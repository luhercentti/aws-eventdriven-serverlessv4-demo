# AWS Event-Driven serverless framework Demo

> **What is this?** A complete **Order Management System** built with serverless architecture on AWS, demonstrating production-ready patterns for RESTful APIs and event-driven systems using TypeScript.

Modern serverless application demonstrating AWS event-driven architecture using TypeScript, Serverless Framework, and comprehensive testing with **Jest**.

## 🎯 Overview

This proof of concept showcases modern serverless development best practices including:

- **Advanced TypeScript**: Deep expertise in type system, generics, discriminated unions, branded types, and advanced language features
- **Serverless Architecture**: RESTful APIs and event-driven systems using AWS Lambda, API Gateway, EventBridge, SQS, SNS, and DynamoDB
- **Secure & Scalable**: AWS IAM roles, encryption at rest, resilience patterns (retry with exponential backoff), and structured logging
- **Testing**: Comprehensive unit and integration tests using Jest
- **CI/CD**: GitHub Actions pipeline with automated testing and deployment
- **Type Safety**: Runtime validation with Zod schemas combined with TypeScript

## 📁 Project Structure

```
├── src/
│   ├── handlers/           # Lambda function handlers
│   │   ├── order-handlers.ts      # REST API handlers
│   │   ├── event-handlers.ts      # EventBridge handlers
│   │   └── sqs-handlers.ts        # SQS message handlers
│   ├── services/           # Business logic and integrations
│   │   ├── order-service.ts       # Order management service
│   │   ├── event-publisher.ts     # EventBridge publisher
│   │   └── messaging-service.ts   # SQS/SNS services
│   ├── models/            # TypeScript types and schemas
│   │   ├── types.ts              # Advanced TypeScript types
│   │   ├── schemas.ts            # Zod validation schemas
│   │   └── entities.ts           # Domain entities
│   ├── middleware/        # Lambda middleware
│   │   └── lambda-middleware.ts  # Error handling, logging, CORS, validation
│   └── utils/             # Utility functions
│       ├── helpers.ts            # Common utilities
│       └── dynamodb-repository.ts # DynamoDB abstraction
├── tests/
│   ├── unit/              # Unit tests
│   └── integration/       # Integration tests
├── .github/workflows/     # CI/CD pipelines
├── serverless.yml         # Serverless Framework configuration
├── jest.config.js         # Jest configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## 🚀 Key Features

### 1. TypeScript Type System

- **Branded Types**: Type-safe IDs (`OrderId`, `CustomerId`, `Email`)
- **Discriminated Unions**: Type-safe event handling
- **Generic Constraints**: Reusable repository and service patterns
- **Mapped Types**: Utility types like `PartialBy`, `DeepPartial`, `DeepReadonly`
- **Type Guards**: Runtime type checking with TypeScript inference
- **Builder Pattern**: Fluent API for constructing complex objects

### 2. RESTful API

RESTful endpoints for order management:

```
POST   /orders              # Create order
GET    /orders              # List orders
GET    /orders/{orderId}    # Get order
PUT    /orders/{orderId}    # Update order
DELETE /orders/{orderId}    # Delete order
```

Features:
- Request validation with Zod schemas
- Middleware composition (error handling, logging, CORS)
- Type-safe request/response handling
- Structured JSON logging

### 3. Event-Driven Architecture

- **EventBridge**: Pub/sub event bus for domain events
- **Event Types**: `ORDER_CREATED`, `ORDER_UPDATED`, `ORDER_DELETED`, `PAYMENT_PROCESSED`
- **Event Handlers**: Type-safe event routing and processing
- **SQS Integration**: Asynchronous message processing with DLQ
- **SNS Notifications**: Push notifications for order events

### 4. Resilience Patterns

- **Retry with Exponential Backoff**: Automatic retry for transient failures
- **Dead Letter Queues**: Failed message handling
- **Optimistic Locking**: Version-based concurrency control
- **Structured Logging**: Correlation IDs and contextual logging
- **Error Handling**: Centralized error handling middleware

### 5. Testing with Jest

```bash
npm test              # Run all tests
npm run test:unit     # Unit tests only
npm run test:integration  # Integration tests only
npm run test:coverage # Coverage report
```

Test coverage includes:
- Service layer unit tests with mocking
- TypeScript utility function tests
- Schema validation tests
- Builder pattern tests
- Event handler tests
- Integration tests for API endpoints

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 20.x or higher
- **For local development only:** AWS Account with credentials configured
- **For CI/CD:** GitHub repository with AWS secrets configured

### Install Dependencies (Local Development)
# this will create the needed package-lock.json
```bash
npm install
```

## 🔄 Development Workflow

### Option 1: Automated CI/CD (Recommended) 🤖

**You push code → GitHub Actions does everything automatically!**

```bash
# 1. Write code locally
# 2. Run tests locally to verify
npm test
npm run lint

# 3. Commit and push
git add .
git commit -m "Add new feature"
git push origin develop

# 4. GitHub Actions automatically:
#    ✅ Runs all tests
#    ✅ Checks code quality
#    ✅ Runs security scans
#    ✅ Deploys to AWS dev environment
#    ✅ Runs smoke tests
```

**When merged to `main` → Automatically deploys to production!**

**You don't need to run deployment commands on your laptop.**

### Option 2: Manual Local Workflow (For Testing)

**Use these commands when developing locally:**

```bash
# Run tests while coding
npm test

# Run with watch mode (tests re-run on file changes)
npm test -- --watch

# Test API locally (no AWS needed)
npm run offline

# TypeScript watch mode
npm run watch
```

### Local Development with Serverless Offline

**Test the API locally without deploying to AWS:**

```bash
# Start local API server
npm run offline
```

This starts the API at `http://localhost:3000/dev`

**⚠️ Expected Behavior:**
- ✅ **API endpoints are accessible** - All REST routes work
- ❌ **DynamoDB errors are normal** - You'll see "ResourceNotFoundException" (database not running locally)
- ❌ **Events won't trigger** - EventBridge/SQS handlers won't execute

**Quick Test Example:**
```bash
# This will return a DynamoDB error (expected without local DB)
curl http://localhost:3000/dev/orders
```

📖 **See [LOCAL-TESTING.md](LOCAL-TESTING.md) for complete testing guide** including:
- curl examples for all endpoints
- DynamoDB Local setup (for full CRUD testing)
- LocalStack configuration (for complete AWS emulation)
- Postman collection setup
- Troubleshooting common issues

**For code testing (recommended):**
```bash
npm test  # Unit & integration tests with mocked AWS services
```

**Manual deployment (only if not using CI/CD):**
```bash
# Deploy to dev (requires AWS credentials configured locally)
npm run deploy

# Deploy to production
npm run deploy:prod

# Remove stack
npm run remove
```

## 🧪 Testing

### Local Testing (Before Pushing Code)

```bash
# All tests
npm test

# Just unit tests (fastest)
npm run test:unit

# Integration tests
npm run test:integration

# Coverage report
npm run test:coverage

# Specific test file
npm test -- order-service.test.ts
```

### Test Structure

- **Unit Tests**: Mock external dependencies, test business logic
- **Integration Tests**: Test Lambda handlers with event simulation
- Coverage threshold: 70% (branches, functions, lines, statements)

## 🔄 CI/CD Pipeline (GitHub Actions)

**The pipeline runs automatically when you push code - no manual commands needed!**

### What Happens Automatically:

**On every push and pull request:**
1. ✅ **Test Stage**: Linting, unit tests, integration tests, coverage
2. ✅ **Build Stage**: TypeScript compilation, Serverless packaging
3. ✅ **Security Scan**: npm audit and Snyk security scanning

**When you push to `develop` branch:**
4. ✅ **Deploy to Dev**: Automatically deploys to AWS dev environment
5. ✅ **Smoke Tests**: Verifies deployment worked

**When you push to `main` branch:**
6. ✅ **Deploy to Production**: Automatically deploys to AWS production
7. ✅ **Smoke Tests**: Verifies production deployment

### One-Time Setup: GitHub Secrets

Configure these secrets in your GitHub repository settings once:

- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` (dev environment)
- `AWS_ACCESS_KEY_ID_PROD` / `AWS_SECRET_ACCESS_KEY_PROD` (production)
- `SNYK_TOKEN` (optional, for security scanning)

### Your Workflow

```bash
# 1. Develop locally
npm test

# 2. Push to GitHub
git push origin develop

# 3. Relax - GitHub Actions handles the rest! ☕
#    - Runs tests
#    - Builds application
#    - Deploys to AWS
#    - Notifies you of results
```

### Why `npx serverless deploy` Instead of `serverless deploy`?

You might notice our CI/CD pipeline uses `npx serverless deploy` rather than the `serverless deploy` shown in official Serverless Framework documentation. This is intentional and represents a **production best practice**:

**`npx serverless deploy` (What we use):**
- ✅ Uses the **exact version** specified in `package.json` (3.38.0)
- ✅ **No global installation** required in CI/CD runners
- ✅ **Version consistency** across all environments (local, CI/CD, team members)
- ✅ **Reproducible builds** - same version everywhere
- ✅ **Isolated dependencies** - different projects can use different Serverless versions
- ✅ **Industry best practice** for modern npm workflows

**`serverless deploy` (What docs show):**
- ❌ Requires global installation: `npm install -g serverless`
- ❌ Global version might differ from project's required version
- ❌ Version drift between team members and environments
- ❌ Breaks if multiple projects need different Serverless versions

**Why do the docs show `serverless`?** The official documentation assumes you've globally installed the CLI for quick setup. However, for production systems and teams, using local dependencies with `npx` ensures everyone uses the same tooling version, eliminating "works on my machine" issues.

**Note:** In `package.json` scripts, you don't need `npx` because npm automatically resolves to local binaries:

```json
{
  "scripts": {
    "deploy": "serverless deploy"  // npm scripts auto-use local node_modules/.bin
  }
}
```

But in CI/CD runner commands or direct terminal usage, `npx` is explicit and safer.

## 🏗️ AWS Infrastructure

Deployed resources:

- **API Gateway**: REST API with CORS enabled
- **Lambda Functions**: 7 functions (5 API + 2 event handlers)
- **DynamoDB**: Orders table with GSI for customer queries
- **EventBridge**: Custom event bus for domain events
- **SQS**: Processing queue with DLQ
- **SNS**: Notification topic
- **CloudWatch**: Logs with 7-day retention
- **X-Ray**: Distributed tracing enabled

## 📊 Advanced TypeScript Features Demonstrated

### 1. Conditional Types

```typescript
export type ApiResponse<T, E = Error> = 
  | { success: true; data: T; metadata?: ResponseMetadata }
  | { success: false; error: E; code: ErrorCode };
```

### 2. Branded Types

```typescript
export type Brand<K, T> = K & { __brand: T };
export type OrderId = Brand<string, 'OrderId'>;
```

### 3. Generic Repository Pattern

```typescript
export interface Repository<T, ID> {
  findById(id: ID): Promise<T | null>;
  save(entity: T): Promise<T>;
  // ...
}
```

### 4. Discriminated Unions

```typescript
export type DomainEvent =
  | { type: 'ORDER_CREATED'; payload: OrderCreatedPayload }
  | { type: 'ORDER_UPDATED'; payload: OrderUpdatedPayload }
  // ...
```

### 5. Type Inference from Zod Schemas

```typescript
const createOrderSchema = z.object({...});
export type CreateOrderRequest = z.infer<typeof createOrderSchema>;
```

## 📈 Monitoring & Observability

- **CloudWatch Logs**: Structured JSON logging with correlation IDs
- **X-Ray Tracing**: End-to-end request tracing
- **CloudWatch Metrics**: Lambda invocations, errors, duration
- **Custom Metrics**: API latency, error rates

## 🔒 Security Features

- **IAM Least Privilege**: Function-specific permissions
- **Encryption**: DynamoDB encryption at rest
- **CORS**: Configured for secure cross-origin requests
- **Input Validation**: Zod schema validation on all inputs
- **Error Sanitization**: No sensitive data in error responses

## 🚦 API Examples

### Create Order

```bash
curl -X POST https://your-api.execute-api.us-east-1.amazonaws.com/dev/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-123",
    "customerEmail": "test@example.com",
    "items": [{
      "productId": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Product",
      "quantity": 2,
      "price": 29.99
    }],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Boston",
      "state": "MA",
      "zipCode": "02101"
    }
  }'
```

### Get Order

```bash
curl https://your-api.execute-api.us-east-1.amazonaws.com/dev/orders/{orderId}
```

### List Orders

```bash
curl https://your-api.execute-api.us-east-1.amazonaws.com/dev/orders?customerId=customer-123&limit=20
```

## 📝 Development Best Practices

1. **Type Safety**: Use strict TypeScript configuration
2. **Error Handling**: Centralized error handling middleware
3. **Testing**: Write tests before deploying
4. **Logging**: Use structured logging with context
5. **Validation**: Validate at the edge with Zod
6. **Documentation**: Document complex type transformations
7. **Code Quality**: Use ESLint and Prettier

## 🤖 AI Code Generation Integration

This project structure is optimized for AI-assisted development:
- Clear separation of concerns
- Well-documented types and interfaces
- Consistent patterns across modules
- Comprehensive examples for AI context

## 📚 Resources

- [Serverless Framework](https://www.serverless.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Jest Testing Framework](https://jestjs.io/)
- [Zod Validation](https://zod.dev/)
- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)

## 📄 License

MIT

---

**Built with ❤️ using TypeScript, AWS, and Serverless Framework**
