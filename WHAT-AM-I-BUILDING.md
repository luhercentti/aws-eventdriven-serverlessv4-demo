# What Am I Building? Quick Guide

## The App: Order Management System 📦

You're building a **serverless e-commerce order management backend** with:
- REST API to create/view/update/delete orders
- Event-driven architecture for order lifecycle events
- Background processing and notifications

## How It Works (Simple Flow)

```
1. Customer creates order → POST /orders
   ↓
2. API validates request (Zod schemas)
   ↓
3. OrderService saves to DynamoDB
   ↓
4. Publishes "ORDER_CREATED" event → EventBridge
   ↓
5. Event triggers → Lambda handlers
   ↓
6. Send notification → SNS → Email/SMS
   ↓
7. Queue background tasks → SQS → Process later
```

## Files Explained (What Each Does)

### 📋 Configuration (You barely touch these after setup)
```
package.json         → Dependencies and npm scripts
serverless.yml       → AWS infrastructure (Lambda, API, DB, queues)
tsconfig.json        → TypeScript compiler settings
jest.config.js       → Test runner configuration
.eslintrc.json       → Code quality rules
.prettierrc.json     → Code formatting rules
.gitignore           → What Git should ignore
```

### 🎯 Core Application Code (Where you work)

**Models (Data structures & types)**
```
src/models/types.ts      → Advanced TypeScript types
                           (branded types, discriminated unions)
src/models/schemas.ts    → Request validation rules (Zod)
src/models/entities.ts   → Order object + builder pattern
```

**Services (Business logic)**
```
src/services/order-service.ts     → Order CRUD + event publishing
src/services/event-publisher.ts   → Send events to EventBridge
src/services/messaging-service.ts → SQS/SNS integrations
```

**Handlers (Lambda functions - AWS entry points)**
```
src/handlers/order-handlers.ts    → REST API endpoints
                                     (create, get, update, delete, list)
src/handlers/event-handlers.ts    → Process EventBridge events
src/handlers/sqs-handlers.ts      → Process SQS queue messages
```

**Utilities (Reusable helpers)**
```
src/utils/helpers.ts              → Logging, retry logic, type guards
src/utils/dynamodb-repository.ts  → Database access pattern
src/middleware/lambda-middleware.ts → Error handling, CORS, validation
```

### 🧪 Tests (Verify everything works)

**Unit Tests (Test individual pieces)**
```
tests/unit/order-service.test.ts   → Test business logic with mocks
tests/unit/helpers.test.ts         → Test utility functions
tests/unit/order-builder.test.ts   → Test builder pattern
tests/unit/schemas.test.ts         → Test validation rules
tests/unit/event-publisher.test.ts → Test event handlers
```

**Integration Tests (Test the whole flow)**
```
tests/integration/order-api.test.ts → Test Lambda handlers end-to-end
```

### 🚀 CI/CD (Automated deployment)
```
.github/workflows/ci-cd.yml → GitHub Actions pipeline
                               (test → build → deploy)
```

### 📚 Documentation
```
README.md                  → Full project documentation
QUICKSTART.md             → Quick commands reference
REQUIREMENTS-CHECKLIST.md → Requirements → Implementation mapping
FILES-OVERVIEW.md         → This file!
```

## Two Ways to Work: Local vs Automated

### 🤖 Way 1: Let GitHub Actions Do Everything (Recommended)

```bash
# 1. Install dependencies
npm install

# 2. Write code and test locally
npm test

# 3. Push to GitHub
git push origin develop

# 4. GitHub Actions automatically:
#    - Runs all tests
#    - Deploys to AWS
#    - Gives you the API URL
```

**You never need to deploy from your laptop!**

### 💻 Way 2: Manual Local Testing & Deployment

**Step 1: Test Locally (Before Pushing)**
```bash
# All tests
npm test

# Just unit tests (fast)
npm run test:unit

# With coverage report
npm run test:coverage
```

**Step 2: Test API Locally (No AWS Needed)**
```bash
# Emulate API on your laptop
npm run offline

# Test with curl:
curl http://localhost:3000/dev/orders
```

**Step 3: Manual Deploy (If Not Using CI/CD)**
```bash
# Requires AWS credentials configured
npm run deploy

# You'll get an API URL like:
# https://abc123.execute-api.us-east-1.amazonaws.com/dev

# Test it:
curl https://YOUR-URL/dev/orders
```

## What Each File Type Does

| Extension | Purpose | Example |
|-----------|---------|---------|
| `.ts` | TypeScript source code | Business logic, handlers |
| `.test.ts` | Test files (Jest) | Verify code works |
| `.json` | Configuration files | package.json, tsconfig.json |
| `.yml` | Infrastructure config | serverless.yml |
| `.js` | JavaScript config | jest.config.js |
| `.md` | Documentation | README.md |

## Do I Need All These Files?

**Absolutely Essential (10 files):**
1. `package.json` - Dependencies
2. `serverless.yml` - Infrastructure
3. `tsconfig.json` - TypeScript
4. `src/models/types.ts` - Type definitions
5. `src/services/order-service.ts` - Business logic
6. `src/handlers/order-handlers.ts` - API endpoints
7. `src/utils/helpers.ts` - Utilities
8. `tests/unit/order-service.test.ts` - Tests
9. `jest.config.js` - Test config
10. `README.md` - Documentation

**Very Useful (the rest):**
- More tests for better coverage
- Event-driven handlers for async processing
- CI/CD for automated deployment
- More utilities for resilience patterns

## Quick Reference

**Run tests:** `npm test`  
**Deploy:** `npm run deploy`  
**Remove from AWS:** `npm run remove`  
**See all commands:** `npm run`  

**Main entry points:**
- REST API: `src/handlers/order-handlers.ts`
- Business logic: `src/services/order-service.ts`
- Types: `src/models/types.ts`

That's it! 🎉
