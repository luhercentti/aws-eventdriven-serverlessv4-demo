# Local Testing Guide

## Quick Start

The serverless-offline plugin is running at `http://localhost:3000`. You can test the REST API endpoints, but note that **DynamoDB is not emulated** - you'll see "Requested resource not found" errors, which is expected.

## Testing REST API Endpoints

### 1. Create an Order (POST)

```bash
curl -X POST http://localhost:3000/dev/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-123",
    "items": [
      {
        "productId": "prod-001",
        "quantity": 2,
        "price": 29.99
      }
    ],
    "totalAmount": 59.98
  }'
```

**Expected Result:** ❌ DynamoDB error (table doesn't exist locally)

### 2. Get All Orders (GET)

```bash
curl http://localhost:3000/dev/orders
```

**Expected Result:** ❌ DynamoDB error

### 3. Get Single Order (GET)

```bash
curl http://localhost:3000/dev/orders/order-123
```

**Expected Result:** ❌ DynamoDB error

### 4. Update Order (PUT)

```bash
curl -X PUT http://localhost:3000/dev/orders/order-123 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SHIPPED"
  }'
```

**Expected Result:** ❌ DynamoDB error

### 5. Delete Order (DELETE)

```bash
curl -X DELETE http://localhost:3000/dev/orders/order-123
```

**Expected Result:** ❌ DynamoDB error

## Full Local Testing with DynamoDB

To test with actual data persistence, you have two options:

### Option A: DynamoDB Local (Recommended for Simple Testing)

1. **Install DynamoDB Local:**
```bash
npm install --save-dev serverless-dynamodb
npx serverless-dynamodb install
```

2. **Update `serverless.yml` to add DynamoDB Local plugin:**
```yaml
plugins:
  - serverless-esbuild
  - serverless-offline
  - serverless-dynamodb  # Add this

custom:
  dynamodb:
    stages:
      - dev
    start:
      port: 8000
      inMemory: true
      migrate: true  # Auto-create tables
```

3. **Start both DynamoDB Local and serverless-offline:**
```bash
npx serverless dynamodb start & npm run offline
```

4. **Now your API calls will work!** ✅

### Option B: LocalStack (Full AWS Emulation)

1. **Install LocalStack:**
```bash
pip install localstack
# or
brew install localstack
```

2. **Start LocalStack:**
```bash
localstack start
```

3. **Update AWS endpoint in your code** (for local testing):
   - Set `AWS_ENDPOINT_URL=http://localhost:4566` environment variable
   - Modify DynamoDB client to use local endpoint

4. **Deploy to LocalStack:**
```bash
npx serverless deploy --stage local
```

## Testing Without Database (Lambda Invocation Only)

You can test the Lambda functions directly without the database:

```bash
# Direct Lambda invocation
curl -X POST http://localhost:3000/2015-03-31/functions/createOrder/invocations \
  -H "Content-Type: application/json" \
  -d '{
    "body": "{\"customerId\":\"customer-123\",\"items\":[{\"productId\":\"prod-001\",\"quantity\":2,\"price\":29.99}],\"totalAmount\":59.98}",
    "headers": {"Content-Type": "application/json"},
    "httpMethod": "POST",
    "path": "/orders"
  }'
```

## Testing Strategy

### Without DynamoDB Local
- ✅ Verify Lambda functions start without errors
- ✅ Verify API Gateway routes are configured correctly  
- ✅ Verify request/response format and validation
- ✅ Check error handling and logging structure
- ❌ Cannot test actual CRUD operations
- ❌ Cannot test event-driven workflows (EventBridge, SQS)

### With DynamoDB Local
- ✅ Full CRUD operations testing
- ✅ Data persistence verification
- ✅ Query and scan operations
- ❌ EventBridge and SQS still not emulated

### With LocalStack
- ✅ Complete AWS environment emulation
- ✅ EventBridge, SQS, SNS testing
- ✅ Full event-driven workflow testing
- ✅ Most realistic local environment

## Recommended Testing Approach

**For Quick Development:**
```bash
# Run unit tests (no AWS services needed)
npm test

# Run integration tests (mocked dependencies)
npm run test:integration
```

**For API Testing:**
```bash
# Option 1: Deploy to AWS dev environment
npm run deploy

# Option 2: Use DynamoDB Local (see Option A above)
npx serverless dynamodb start & npm run offline
```

**For Full Testing:**
```bash
# Deploy to AWS and test real environment
npm run deploy
# Then use the AWS endpoints from deployment output
```

## Common Issues

### Issue: "Requested resource not found" errors
**Cause:** DynamoDB table doesn't exist locally  
**Solution:** Install DynamoDB Local (Option A) or use AWS deployment

### Issue: EventBridge/SQS events not triggering
**Cause:** serverless-offline doesn't emulate EventBridge/SQS  
**Solution:** Use LocalStack or test in AWS environment

### Issue: Cannot connect to DynamoDB Local
**Cause:** DynamoDB Local not running or wrong port  
**Solution:** Ensure DynamoDB Local is running on port 8000

## Postman Collection

For easier testing, import these endpoints to Postman:

**Base URL:** `http://localhost:3000/dev`

**Endpoints:**
- POST `/orders` - Create order
- GET `/orders` - List all orders
- GET `/orders/:orderId` - Get specific order
- PUT `/orders/:orderId` - Update order
- DELETE `/orders/:orderId` - Delete order

## Next Steps

1. Choose your testing approach based on needs
2. For full local development, install DynamoDB Local
3. For production-like testing, deploy to AWS dev environment
4. Use unit/integration tests for code coverage
