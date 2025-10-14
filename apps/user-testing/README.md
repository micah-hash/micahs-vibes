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

### Production Deployment

1. Deploy to Vercel/Netlify:
   ```bash
   pnpm build
   vercel --prod
   ```

2. Register as a Fluid Droplet (see `FLUID-DROPLET.md`)

3. Configure in Fluid:
   - Enable desired tests
   - Set schedules
   - Add email recipients
   - Save configuration

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── tests/
│   │       ├── run/          # Execute tests
│   │       ├── config/       # Save/load configuration
│   │       ├── results/      # Store test results
│   │       ├── schedule/     # Manage schedules
│   │       ├── analytics/    # Calculate analytics
│   │       └── notify/       # Send email notifications
│   ├── embed/
│   │   ├── page.tsx         # Main droplet UI
│   │   └── layout.tsx       # Embed layout
│   └── page.tsx             # Landing page
├── lib/
│   ├── fluid-api.ts         # Fluid API client
│   ├── test-runner.ts       # Test execution engine
│   ├── scheduler.ts         # Test scheduling service
│   └── email-notifications.ts # Email generation
└── types/
    └── test-config.ts       # TypeScript types
```

## 🔧 Configuration

### Environment Variables

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
RESEND_API_KEY=your_resend_api_key  # Optional: for email
SENDGRID_API_KEY=your_sendgrid_key  # Optional: alternative email
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

### POST /api/tests/schedule
Schedule recurring tests.

### GET /api/tests/analytics
Get analytics and insights.

### POST /api/tests/notify
Send email notifications.

## 🐛 Troubleshooting

**Tests not running?**
- Check company ID and auth token
- Verify Fluid API connectivity
- Check console for errors

**Schedules not working?**
- Ensure configuration is saved
- Check scheduler logs
- Verify auth token is valid

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
