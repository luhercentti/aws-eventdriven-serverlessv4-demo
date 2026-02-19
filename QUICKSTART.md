# Quick Start Guide

## 🚀 Fastest Way to Get Started (CI/CD)

**Let GitHub Actions do the work!**

```bash
# 1. Clone and install
git clone <your-repo>
npm install

# 2. Write code and test locally
npm test

# 3. Push to GitHub
git push origin develop

# 4. Done! GitHub Actions automatically:
#    ✅ Tests your code
#    ✅ Deploys to AWS
#    ✅ Runs smoke tests
```

## 🛠️ Local Development (Testing Before Push)

```bash
# Run tests while coding
npm test

# Run API locally (no AWS needed!)
npm run offline

# Watch mode (auto-recompile)
npm run watch
```

## 📦 Manual Deployment (Optional)

**Only needed if NOT using GitHub Actions:**

```bash
# Deploy to dev
npm run deploy

# Deploy to production
npm run deploy:prod
```

## Testing the API

After deployment, you'll get an API endpoint. Test it:

```bash
# Get the endpoint
npm run info

# Create an order
curl -X POST https://YOUR-ENDPOINT/dev/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-123",
    "customerEmail": "test@example.com",
    "items": [{
      "productId": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Test Product",
      "quantity": 1,
      "price": 29.99
    }],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Boston",
      "state": "MA",
      "zipCode": "02101"
    }
  }'

# Get orders
curl https://YOUR-ENDPOINT/dev/orders
```

## Key Files to Review

1. **serverless.yml** - Infrastructure configuration
2. **src/handlers/** - Lambda functions
3. **src/services/** - Business logic
4. **src/models/types.ts** - Advanced TypeScript patterns
5. **tests/** - Jest test examples

## Common Commands

```bash
npm test              # Run all tests
npm run test:coverage # Coverage report
npm run lint          # Check code quality
npm run build         # Compile TypeScript
npm run deploy        # Deploy to AWS
npm run remove        # Remove from AWS
```

## Need Help?

Check the main [README.md](README.md) for detailed documentation.
