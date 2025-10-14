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

### Step 3: Create Environment File

Create `apps/user-testing/.env.local`:

```bash
# Company subdomain
FLUID_COMPANY_SUBDOMAIN=tacobell

# Your Fluid API token
FLUID_API_TOKEN=your_actual_token_here

# Your deployed URL
EMBED_URL=https://your-app.vercel.app/user-testing
# Or for ngrok: https://abc123.ngrok-free.app/user-testing
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

## Environment Variables

Your app needs these in production:

```bash
# For Vercel, add in dashboard under Settings → Environment Variables
FLUID_API_URL=https://tacobell.fluid.app/api
```

## Testing Checklist

- [ ] Local URL test works: `http://localhost:3001/user-testing?company_id=tacobell&auth_token=...`
- [ ] App is deployed (Vercel/Ngrok)
- [ ] Environment variables are set
- [ ] Registration script ran successfully
- [ ] Droplet appears in Fluid admin

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

# Register droplet (after deploying)
cd apps/user-testing
tsx scripts/register-droplet.ts

# Deploy to Vercel
vercel
```

## Notes

- The droplet auto-enables tests and shows a guided tour on first visit
- Email notifications require valid SMTP configuration in your deployment
- Test results are stored in-memory (consider adding database for production)
- Scheduling runs in-memory (consider Redis/queue for production scale)

