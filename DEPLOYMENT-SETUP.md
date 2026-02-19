# Deployment Setup Guide

## Manual Approval Configuration

The CI/CD pipeline includes manual approval gates before deploying to Dev and Production environments. Follow these steps to configure them in GitHub:

### Step 1: Configure Environment Protection Rules

1. **Go to your GitHub repository**
2. **Navigate to**: Settings → Environments
3. **Create/Configure the following environments**:

#### For Development Approval (`development-approval`)
- Click **"New environment"** or select existing `development-approval`
- Enable **"Required reviewers"**
- Add reviewers (team members who can approve dev deployments)
- Optionally set **"Wait timer"** (e.g., 0 minutes for immediate review)
- Click **"Save protection rules"**

#### For Production Approval (`production-approval`)
- Click **"New environment"** or select existing `production-approval`
- Enable **"Required reviewers"**
- Add reviewers (team members who can approve production deployments)
- Optionally set **"Wait timer"** (e.g., 5 minutes minimum wait before approval)
- Enable **"Prevent self-review"** (recommended for production)
- Click **"Save protection rules"**

#### For Deployment Environments (Optional - Additional Protection)
You can also add additional protection to `development` and `production` environments:
- **Branch restrictions**: Only allow deployments from specific branches
- **Deployment branches**: Restrict to `develop` for dev, `main` for prod

### Step 2: Configure AWS Credentials

Add the following secrets in **Settings → Secrets and variables → Actions**:

**For Development:**
- `AWS_ACCESS_KEY_ID` - AWS access key for dev account
- `AWS_SECRET_ACCESS_KEY` - AWS secret key for dev account

**For Production:**
- `AWS_ACCESS_KEY_ID_PROD` - AWS access key for prod account
- `AWS_SECRET_ACCESS_KEY_PROD` - AWS secret key for prod account

**For Security Scanning (Optional):**
- `SNYK_TOKEN` - Snyk API token for security scanning

### Step 3: How the Approval Process Works

#### Development Deployment Flow:
1. Push to `develop` branch
2. Tests run automatically
3. Build completes
4. **Workflow pauses at "Approve Dev Deployment"** ⏸️
5. Designated reviewer approves in GitHub Actions UI
6. Deployment proceeds to dev environment

#### Production Deployment Flow:
1. Push to `main` branch (or merge PR)
2. Tests run automatically
3. Build completes
4. **Workflow pauses at "Approve Production Deployment"** ⏸️
5. Designated reviewer approves in GitHub Actions UI
6. Deployment proceeds to production environment

### Step 4: Approving a Deployment

When a deployment requires approval:

1. **Go to**: Actions tab in your GitHub repository
2. **Find the workflow run** that's waiting for approval
3. **Click on the workflow run**
4. You'll see a yellow banner: **"Review pending deployments"**
5. **Click "Review deployments"**
6. **Select the environment(s)** to approve
7. **Add a comment** (optional but recommended)
8. **Click "Approve and deploy"**

### Step 5: Test the Setup

1. **Test Dev Approval:**
   ```bash
   git checkout develop
   git commit --allow-empty -m "Test dev deployment approval"
   git push origin develop
   ```
   - Go to Actions tab and approve the deployment

2. **Test Prod Approval:**
   ```bash
   git checkout main
   git commit --allow-empty -m "Test prod deployment approval"
   git push origin main
   ```
   - Go to Actions tab and approve the deployment

## Best Practices

### Recommended Reviewers
- **Dev approval**: Any senior developer or tech lead
- **Prod approval**: 
  - Engineering manager
  - DevOps lead
  - At least 2 approvers required (can be configured)

### Approval Response Times
- **Dev**: Approve during business hours (no wait timer needed)
- **Prod**: 
  - Set minimum 5-10 minute wait timer
  - Allows time to review deployment
  - Prevents hasty approvals

### Notification Setup
Configure notifications so approvers are alerted:
1. **Settings → Notifications**
2. Enable **"Actions"** notifications
3. Choose notification method (email, web, mobile)

### Audit Trail
All deployment approvals are logged in:
- The Actions workflow run
- Environment deployment history
- Can be exported for compliance

## Troubleshooting

### "No environment protection rules configured"
- Go to Settings → Environments
- Select the environment
- Add required reviewers

### "You cannot approve this deployment"
- You might be the person who triggered the deployment
- Enable "Prevent self-review" in environment settings
- Have another team member approve

### "Reviewer not found"
- The reviewer must have write access to the repository
- Check collaborator permissions in Settings → Collaborators

## Alternative: No Approval Setup

If you want to deploy automatically without approval, remove the approval jobs from the workflow:

1. Delete the `approve-dev` and `approve-prod` jobs
2. Change `needs: approve-dev` back to `needs: build` in the deploy jobs

This will make deployments automatic after successful builds.
