# Connecting User Testing Droplet to Fluid

## Quick Local Test (5 minutes)

Just open this URL in your browser:

```
http://localhost:3001/user-testing?company_id=tacobell&auth_token=YOUR_API_TOKEN
```

**Replace:**
- `tacobell` → Your company's subdomain (e.g., `tacobell.fluid.app` → use `tacobell`)
- `YOUR_API_TOKEN` → Get from Fluid: Settings → API → Generate Token

## Production Setup (Full Integration)

### Step 1: Get Your Credentials

1. **Company Subdomain**: e.g., `tacobell` from `tacobell.fluid.app`
2. **API Token**: 
   - Log into Fluid as admin
   - Go to Settings → API
   - Click "Generate Token"
   - Copy the token

### Step 2: Deploy Your App

Choose one:

**Option A: Vercel (Recommended)**
```bash
cd /Users/micah/Documents/micahs-vibes/apps/user-testing
vercel
```

**Option B: Ngrok (Local Testing)**
```bash
# In a separate terminal
ngrok http 3001
# Copy the https URL (e.g., https://abc123.ngrok-free.app)
```

### Step 3: Configure Environment Variables

**For Vercel (Recommended):**

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables:

```bash
# Required for scheduled tests (Vercel Cron authentication)
# Generate with: openssl rand -base64 32
CRON_SECRET=your_secure_random_string

# Your app URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Optional: Email notifications (choose one)
RESEND_API_KEY=re_...
# OR
SENDGRID_API_KEY=SG...
```

**For Local Development:**

Create `apps/user-testing/.env.local`:

```bash
# For local testing of scheduled tests
CRON_SECRET=dev-secret-key
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Optional: Email API keys
# RESEND_API_KEY=your_key
# SENDGRID_API_KEY=your_key
```

### Step 4: Register the Droplet

Install tsx if needed:
```bash
pnpm add -g tsx
```

Run the registration script:
```bash
cd /Users/micah/Documents/micahs-vibes/apps/user-testing
tsx scripts/register-droplet.ts
```

You should see:
```
✅ Droplet registered successfully!
```

### Step 5: Access in Fluid

Once registered, the droplet will appear in:
- Fluid Marketplace (for admins to install)
- Or access directly at: `https://tacobell.fluid.app/droplets/your-droplet-id`

When Fluid loads your droplet, it automatically adds:
- `?company_id=tacobell`
- `&auth_token=<token>`

## Environment Variables Reference

### Required

- `CRON_SECRET` - Secure random string for Vercel Cron authentication
  - Generate with: `openssl rand -base64 32`
  - Add to Vercel project settings
  
- `NEXT_PUBLIC_APP_URL` - Your deployed app URL
  - Example: `https://your-app.vercel.app`
  - Used by cron jobs to call API endpoints

### Optional

- `RESEND_API_KEY` - For email notifications via Resend
- `SENDGRID_API_KEY` - For email notifications via SendGrid

## How Scheduled Tests Work

1. **User enables a test** and sets a schedule (e.g., hourly)
2. **System stores** the schedule with next run time
3. **Vercel Cron runs** `/api/cron` every 15 minutes
4. **Cron checks** for tests that are due to run
5. **Tests execute** automatically via `/api/tests/run`
6. **Results are saved** and emails sent (if configured)
7. **Next run time** is updated automatically

See `SCHEDULING.md` for detailed information.

## Testing Checklist

- [ ] Local URL test works: `http://localhost:3001/user-testing?company_id=tacobell&auth_token=...`
- [ ] App is deployed (Vercel/Ngrok)
- [ ] Environment variables are set (`CRON_SECRET`, `NEXT_PUBLIC_APP_URL`)
- [ ] Cron job appears in Vercel Dashboard → Cron Jobs
- [ ] Registration script ran successfully
- [ ] Droplet appears in Fluid admin
- [ ] Scheduled tests work (enable one and wait for cron)

## Troubleshooting

**"No company_id found"**
- Check URL has `?company_id=tacobell` parameter
- Check it matches your Fluid subdomain exactly

**"API request failed"**
- Verify API token is valid
- Check token has correct permissions
- Ensure company subdomain is correct

**"Cannot connect to Fluid API"**
- Verify Fluid is accessible at `https://tacobell.fluid.app`
- Check CORS settings if getting blocked
- Ensure your deployed URL is HTTPS (not HTTP)

## Quick Commands

```bash
# Start local dev server
pnpm --filter user-testing dev

# Test with URL parameters
open "http://localhost:3001/user-testing?company_id=tacobell&auth_token=test"

# Test scheduled tests locally
open "http://localhost:3001/api/cron/trigger"

# Generate a secure CRON_SECRET
openssl rand -base64 32

# Register droplet (after deploying)
cd apps/user-testing
tsx scripts/register-droplet.ts

# Deploy to Vercel
vercel
```

## Notes

- The droplet auto-enables tests and shows a guided tour on first visit
- **Scheduled tests** are executed by Vercel Cron every 15 minutes
- Email notifications require Resend or SendGrid API key
- Test results are stored in-memory (consider adding database for production)
- Scheduled jobs are stored in-memory (for production, use a database)
- See `SCHEDULING.md` for detailed information about the scheduling system

## Verifying Scheduled Tests

After deployment:

1. Enable a test and set it to run every 30 minutes
2. Save the configuration
3. Note the "Next run" time shown in the UI
4. Go to Vercel Dashboard → Your Project → Cron Jobs
5. Wait for the cron to run (or manually trigger it)
6. Check logs to verify execution
7. Results will appear in the "Test Results" tab

