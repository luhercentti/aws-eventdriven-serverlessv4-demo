# Development Workflow Explained 🔄

## TL;DR - Two Options:

### Option 1: Automated (Recommended) 🤖
**You:** Write code + push to GitHub  
**GitHub Actions:** Does everything else automatically  
**You need on your laptop:** Just Node.js to run tests

### Option 2: Manual 💻
**You:** Write code + test + deploy manually from laptop  
**You need on your laptop:** Node.js + AWS credentials configured

---

## Detailed Workflow Comparison

### 🤖 Automated CI/CD Workflow (No AWS Setup on Laptop!)

```
┌─────────────────────────┐
│  Your Laptop            │
├─────────────────────────┤
│ 1. Write code           │
│ 2. Run: npm test        │ ← Just verify locally
│ 3. git push             │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  GitHub Actions         │ ← Runs automatically!
├─────────────────────────┤
│ ✅ Run all tests        │
│ ✅ Check code quality   │
│ ✅ Security scan        │
│ ✅ Build application    │
│ ✅ Deploy to AWS        │
│ ✅ Run smoke tests      │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  AWS Cloud              │ ← Your app is live!
├─────────────────────────┤
│ ☁️  Lambda functions    │
│ ☁️  API Gateway         │
│ ☁️  DynamoDB            │
│ ☁️  EventBridge         │
└─────────────────────────┘
```

**What you run on your laptop:**
```bash
npm test              # Verify changes work
git push origin develop  # Trigger automation
```

**What happens automatically:**
- All testing
- All deployment
- All infrastructure setup

**Prerequisites on your laptop:**
- ✅ Node.js 20+
- ❌ NO AWS credentials needed
- ❌ NO AWS CLI needed

**Prerequisites on GitHub:**
- ✅ AWS credentials in GitHub Secrets (one-time setup)

---

### 💻 Manual Workflow (Traditional Approach)

```
┌─────────────────────────┐
│  Your Laptop            │
├─────────────────────────┤
│ 1. Write code           │
│ 2. npm test             │
│ 3. npm run deploy       │ ← You deploy manually
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  AWS Cloud              │
├─────────────────────────┤
│ ☁️  Lambda functions    │
│ ☁️  API Gateway         │
│ ☁️  DynamoDB            │
│ ☁️  EventBridge         │
└─────────────────────────┘
```

**What you run on your laptop:**
```bash
npm test           # Test
npm run deploy     # Deploy manually
```

**Prerequisites on your laptop:**
- ✅ Node.js 20+
- ✅ AWS credentials configured (`aws configure`)
- ✅ AWS CLI installed

---

## Command Purposes Explained

### Local Development Commands (Run While Coding)

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm install` | Install dependencies | Once after clone |
| `npm test` | Run tests | Before every commit |
| `npm test -- --watch` | Auto-run tests on file changes | While coding |
| `npm run offline` | Run API locally | Test API without AWS |
| `npm run watch` | Auto-compile TypeScript | While coding |

**These commands never touch AWS - safe to run anytime!**

### Manual Deployment Commands (Optional)

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm run deploy` | Deploy to dev | If NOT using GitHub Actions |
| `npm run deploy:prod` | Deploy to production | If NOT using GitHub Actions |
| `npm run remove` | Delete from AWS | Cleanup/teardown |
| `npm run info` | Show deployed API URL | Check deployment status |

**These touch AWS - only needed if doing manual deployment!**

---

## Typical Day-to-Day Workflow

### With GitHub Actions (Recommended)

```bash
# Morning: Start working
npm test -- --watch   # Terminal 1: Auto-run tests
npm run offline       # Terminal 2: Local API server

# Code all day, tests run automatically...

# Evening: Done for the day
git add .
git commit -m "Implement order cancellation"
git push origin develop

# 🎉 Done! GitHub Actions deploys while you grab coffee
```

### Without GitHub Actions

```bash
# Morning: Start working
npm test -- --watch   # Auto-run tests while coding

# Code all day...

# Evening: Ready to deploy
npm test              # Final check
npm run deploy        # Deploy manually (takes 2-5 minutes)

# Wait for deployment to finish...
```

---

## Branch Strategy with CI/CD

```
develop branch → Push → GitHub Actions → Deploy to DEV environment
   ↓
   Merge PR
   ↓
main branch → Push → GitHub Actions → Deploy to PRODUCTION
```

**Example:**
```bash
# Feature development
git checkout -b feature/new-endpoint
# ... code ...
npm test
git push origin feature/new-endpoint

# Create PR to develop → Tests run automatically
# Merge PR → Automatically deploys to DEV

# Ready for production?
# Create PR from develop to main
# Merge PR → Automatically deploys to PRODUCTION
```

---

## FAQ

**Q: Do I need AWS credentials on my laptop?**  
A: Only if you're doing manual deployment. With GitHub Actions, no!

**Q: When should I run `npm run deploy`?**  
A: Never, if you're using GitHub Actions. It's automatic on push!

**Q: Can I test without deploying to AWS?**  
A: Yes! Use `npm run offline` to run API locally.

**Q: What if I want to deploy without pushing to GitHub?**  
A: Run `npm run deploy` manually (requires AWS credentials).

**Q: Should I commit node_modules?**  
A: No! It's in `.gitignore`. GitHub Actions runs `npm install` automatically.

---

## Summary

| Task | Local Commands | GitHub Actions |
|------|----------------|----------------|
| Install deps | `npm install` | Automatic |
| Run tests | `npm test` | Automatic on push |
| Code quality | `npm run lint` | Automatic on push |
| Build | `npm run build` | Automatic on push |
| Deploy | `npm run deploy` (manual) | **Automatic on push** |
| Smoke tests | You test manually | **Automatic** |

**Use GitHub Actions and you only need to run `npm test` locally!** 🎉
