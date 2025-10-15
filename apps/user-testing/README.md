# Fluid Automated Testing Droplet

A comprehensive automated testing solution for Fluid that monitors critical business flows and alerts you when something breaks.

## 🎯 Features

### 5 Automated Test Scenarios

1. **Product Purchase Flow**
   - Tests the complete product purchase journey
   - Verifies cart, checkout, and order completion

2. **Enrollment Purchase Flow**
   - Tests enrollment-based purchases
   - Validates enrollment registration and billing

3. **Subscription Purchase Flow**
   - Tests recurring subscription setup
   - Verifies subscription billing configuration

4. **Refund/Return Flow**
   - Tests refund processing
   - Validates return workflows

5. **Customer Authentication**
   - Tests registration and login flows
   - Validates authentication tokens

### Flexible Scheduling

Configure tests to run:
- Every 30 minutes
- Every hour
- Once daily
- Every other day

### Real-time Dashboard

- **Test Configuration** - Enable/disable tests and set schedules
- **Test Results** - View detailed pass/fail history with step-by-step breakdown
- **Analytics** - Visual charts showing success rates and trends

### Email Notifications

Receive email alerts when tests complete:
- Beautiful HTML email reports
- Detailed step-by-step results
- Pass/fail summaries
- Error details for failed tests

## 🚀 Getting Started

### Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Access the droplet
open http://localhost:3001/user-testing
```

### Testing Locally

Test with company context:
```
http://localhost:3001/user-testing?company_id=test-company&token=test-token
```

**Testing Scheduled Tests:**

1. Set up a test with a 30-minute schedule
2. Save the configuration
3. Manually trigger the cron job:
   ```
   http://localhost:3001/api/cron/trigger
   ```
4. Check console logs to see the execution

See `SCHEDULING.md` for detailed information about how scheduled tests work.

### Production Deployment

1. **Set Environment Variables** in Vercel:
   - `CRON_SECRET` - Generate a secure random string (e.g., `openssl rand -base64 32`)
   - `NEXT_PUBLIC_APP_URL` - Your app URL (e.g., `https://your-app.vercel.app`)
   - Email API keys (optional)

2. **Deploy to Vercel**:
   ```bash
   pnpm build
   vercel --prod
   ```

3. **Verify Cron Setup**:
   - Go to Vercel Dashboard → Your Project → Cron Jobs
   - You should see a cron job for `/api/cron` scheduled every 15 minutes
   - Check logs after deployment to verify execution

4. **Register as a Fluid Droplet** (see `FLUID-DROPLET.md`)

5. **Configure in Fluid**:
   - Enable desired tests
   - Set schedules
   - Add email recipients
   - Save configuration

**Note**: Scheduled tests will automatically execute based on their configured intervals. The cron job runs every 15 minutes to check for due tests.

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── cron/
│   │   │   ├── route.ts     # Cron job executor (runs scheduled tests)
│   │   │   └── trigger/     # Dev-only manual cron trigger
│   │   └── tests/
│   │       ├── run/          # Execute tests
│   │       ├── config/       # Save/load configuration
│   │       ├── results/      # Store test results
│   │       ├── schedule/     # Manage test schedules
│   │       ├── analytics/    # Calculate analytics
│   │       └── notify/       # Send email notifications
│   ├── user-testing/
│   │   ├── page.tsx         # Main droplet UI
│   │   └── layout.tsx       # Droplet layout
│   └── page.tsx             # Landing page
├── lib/
│   ├── fluid-api.ts         # Fluid API client
│   ├── test-runner.ts       # Test execution engine
│   ├── test-data-store.ts   # In-memory data store
│   └── email-notifications.ts # Email generation
└── types/
    └── test-config.ts       # TypeScript types
```

## 🔧 Configuration

### Environment Variables

```env
# Required
CRON_SECRET=your_secure_random_string  # For Vercel Cron authentication
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Optional: Email notifications
RESEND_API_KEY=your_resend_api_key
SENDGRID_API_KEY=your_sendgrid_key
```

### Email Integration

The droplet is ready to integrate with email services. Uncomment the relevant code in `src/app/api/tests/notify/route.ts`:

**Resend:**
```typescript
const resend = new Resend(process.env.RESEND_API_KEY);
await resend.emails.send({
  from: 'tests@yourdomain.com',
  to: recipients,
  subject: notification.subject,
  html: htmlContent,
});
```

**SendGrid:**
```typescript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
await sgMail.send({
  to: recipients,
  from: 'tests@yourdomain.com',
  subject: notification.subject,
  html: htmlContent,
});
```

## 🎨 Customization

### Adding New Tests

1. Add test type to `src/types/test-config.ts`:
   ```typescript
   export type TestType = 
     | 'product-purchase'
     | 'your-new-test';
   ```

2. Add test definition:
   ```typescript
   export const TEST_DEFINITIONS = {
     'your-new-test': {
       name: 'Your Test Name',
       description: 'What this test does'
     }
   };
   ```

3. Implement test in `src/lib/test-runner.ts`:
   ```typescript
   private async runYourNewTest(result: TestResult): Promise<void> {
     // Your test logic here
   }
   ```

### Customizing the UI

Edit `src/app/user-testing/page.tsx` to modify:
- Dashboard layout
- Stats display
- Color scheme
- Tab structure

## 📊 Data Storage

Currently uses in-memory storage for demonstration. For production:

1. **Database Integration** - Store configs and results in PostgreSQL/MySQL
2. **Job Queue** - Use Bull/BullMQ for reliable scheduling
3. **Caching** - Use Redis for session data

## 🔒 Security

- Authentication via Fluid droplet tokens
- Company context isolation
- Secure API endpoints
- Token validation

## 📚 API Reference

### POST /api/tests/run
Execute a test immediately.

### GET/POST /api/tests/config
Load/save test configuration.

### GET/POST /api/tests/results
Retrieve/store test results.

### GET/POST /api/tests/schedule
Schedule recurring tests and manage schedules.

### GET /api/tests/analytics
Get analytics and insights.

### POST /api/tests/notify
Send email notifications.

### GET /api/cron
Execute scheduled tests (called by Vercel Cron every 15 minutes).

### GET /api/cron/trigger
**Development only** - Manually trigger cron execution for testing.

For detailed API documentation, see `SCHEDULING.md`.

## 🐛 Troubleshooting

**Tests not running?**
- Check company ID and auth token
- Verify Fluid API connectivity
- Check console for errors

**Schedules not working?**
- Ensure configuration is saved
- Verify tests are enabled with a schedule
- Check that `nextRun` time shows in the UI
- Verify cron job is running (check Vercel logs)
- In development, manually trigger: `http://localhost:3001/api/cron/trigger`
- Verify auth token is still valid
- See `SCHEDULING.md` for detailed troubleshooting

**Emails not sending?**
- Configure email service (Resend/SendGrid)
- Check API keys
- Verify recipients are valid

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
