# PoC Files Overview

This document explains which files are essential for the PoC and which are optional.

## ✅ Essential Files (Required for PoC)

### Configuration Files
- **package.json** - Dependencies and scripts
- **serverless.yml** - Infrastructure as Code (Serverless Framework)
- **tsconfig.json** - TypeScript compiler configuration
- **jest.config.js** - Test runner configuration
- **.gitignore** - Git exclusions

### Core Application (Demonstrates TypeScript expertise & AWS patterns)
- **src/models/types.ts** - Advanced TypeScript types (generics, discriminated unions, branded types)
- **src/models/schemas.ts** - Runtime validation with Zod + TypeScript inference
- **src/models/entities.ts** - Domain models with builder pattern

### Services (Business Logic)
- **src/services/order-service.ts** - Core business logic with event publishing
- **src/services/event-publisher.ts** - EventBridge integration with type-safe handlers
- **src/services/messaging-service.ts** - SQS/SNS integration

### Handlers (Lambda Functions)
- **src/handlers/order-handlers.ts** - REST API endpoints
- **src/handlers/event-handlers.ts** - EventBridge event processing
- **src/handlers/sqs-handlers.ts** - SQS message processing

### Utilities & Middleware
- **src/utils/helpers.ts** - Common utilities (retry, logging, type guards)
- **src/utils/dynamodb-repository.ts** - Generic DynamoDB repository pattern
- **src/middleware/lambda-middleware.ts** - Middleware composition (validation, logging, CORS)

### Tests (Jest)
- **tests/unit/order-service.test.ts** - Service layer unit tests
- **tests/unit/helpers.test.ts** - Utility function tests
- **tests/unit/order-builder.test.ts** - Builder pattern tests
- **tests/unit/schemas.test.ts** - Validation tests
- **tests/integration/order-api.test.ts** - API integration tests

### CI/CD
- **.github/workflows/ci-cd.yml** - GitHub Actions pipeline

### Documentation
- **README.md** - Comprehensive project documentation

## 🟡 Helpful but Optional

- **QUICKSTART.md** - Quick reference guide
- **.eslintrc.json** - Code quality rules (can use defaults)
- **.prettierrc.json** - Code formatting (can use defaults)
- **.nvmrc** - Node version specification
- **tests/unit/event-publisher.test.ts** - Additional test coverage

## ❌ Not Needed (Can Remove for Simpler PoC)

If you want an even simpler PoC, you could consolidate:

1. Merge all models into one file
2. Combine messaging services into one file
3. Reduce test files to just 2-3 key examples
4. Skip integration tests (keep only unit tests)

## 📊 File Count Summary

- **Essential**: ~20 files
- **Total Current**: ~25 files
- **Infrastructure**: 1 file (serverless.yml)
- **Source Code**: 11 TypeScript files
- **Tests**: 6 test files
- **Config**: 7 configuration files

## 🎯 What This PoC Demonstrates

### TypeScript Deep Expertise ✅
- Advanced types (branded, discriminated unions, conditional types)
- Generics and constraints
- Type inference from schemas
- Builder pattern
- Type guards

### AWS Serverless ✅  
- Lambda functions (REST API + event-driven)
- API Gateway
- DynamoDB with GSI
- EventBridge event bus
- SQS with DLQ
- SNS notifications

### Secure & Scalable ✅
- IAM least privilege
- Retry with exponential backoff
- Error handling middleware
- Structured logging
- Input validation

### Testing (Jest) ✅
- Unit tests with mocking
- Integration tests
- Coverage reporting
- Test organization

### CI/CD (GitHub Actions) ✅
- Automated testing
- Security scanning
- Multi-environment deployment
- Artifact management

### Serverless Framework ✅
- Infrastructure as Code
- Multi-stage deployment
- Plugin ecosystem (esbuild, offline)

## 🚀 How to Simplify Further

If you want the absolute minimum PoC:

```
Essential 10 files:
1. package.json
2. serverless.yml
3. tsconfig.json
4. src/models/types.ts
5. src/services/order-service.ts
6. src/handlers/order-handlers.ts
7. src/utils/helpers.ts
8. tests/unit/order-service.test.ts
9. jest.config.js
10. README.md
```

This would still demonstrate all key requirements but in a more minimal form.
