# Scheduled Test Execution

## Overview

The user-testing app now supports **automatic scheduled test execution** using Vercel Cron Jobs. Tests are scheduled by users through the UI and executed automatically at their specified intervals.

## How It Works

### 1. Scheduling a Test
When a user enables a test and sets a schedule:
1. The frontend calls `/api/tests/schedule` with the test configuration
2. The API calculates the next run time based on the interval
3. The scheduled job is stored in the `testDataStore` (in-memory)

### 2. Running Scheduled Tests
Scheduled tests are executed by a cron job:
- **Cron Endpoint**: `/api/cron`
- **Schedule**: Every 15 minutes (`*/15 * * * *`)
- **Process**:
  1. Fetches all scheduled jobs from the data store
  2. Filters jobs where `nextRun` time has passed
  3. Executes each due test via `/api/tests/run`
  4. Saves results and updates the `nextRun` time
  5. Sends email notifications if configured

### 3. Schedule Intervals
Available intervals:
- **30min**: Every 30 minutes
- **hourly**: Every hour
- **daily**: Every day
- **every-other-day**: Every 2 days

## Vercel Cron Configuration

The cron job is configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

The cron job runs every 15 minutes to check for due tests. This frequency ensures:
- 30-minute scheduled tests run within 15 minutes of their due time
- Hourly and daily tests run promptly
- Minimal delay between scheduled time and execution

## Testing Locally

### Option 1: Manual Cron Trigger (Development)
For local testing without the cron secret, access:
```
http://localhost:3001/api/cron/trigger
```

This endpoint bypasses authentication and is only available in development mode.

### Option 2: With Cron Secret
Set the `CRON_SECRET` environment variable and call:
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3001/api/cron
```

### Testing Workflow
1. Start the dev server: `pnpm --filter user-testing dev`
2. Open the app and enable a test with a 30-minute schedule
3. Save the configuration
4. Wait or manually trigger the cron endpoint
5. Check the console logs for cron execution

## Production Deployment

### Environment Variables
Set in Vercel:
- `CRON_SECRET`: Secret token for authenticating cron requests
- `NEXT_PUBLIC_APP_URL`: Your app's URL (e.g., `https://your-app.vercel.app`)

### Vercel Cron Setup
1. Deploy to Vercel
2. Vercel automatically sets up the cron job from `vercel.json`
3. View cron logs in Vercel dashboard under "Cron Jobs"

## Important Notes

### In-Memory Storage Limitation
⚠️ **Current Implementation**: Uses in-memory storage via `testDataStore`

This means:
- Scheduled jobs persist only while the server is running
- In serverless environments (Vercel), jobs may be lost between cold starts
- **For production**: Integrate with a database (e.g., PostgreSQL, MongoDB) to persist scheduled jobs

### Recommended for Production
Replace `testDataStore` with database storage:
1. Store scheduled jobs in a database table
2. Update `/api/tests/schedule` to write to the database
3. Update `/api/cron` to read from the database
4. Add database connection string to environment variables

## Monitoring

### Check Scheduled Jobs
Get all scheduled jobs for a company:
```
GET /api/tests/schedule?companyId=YOUR_COMPANY_ID
```

### View Cron Execution Logs
- **Local**: Check terminal console
- **Vercel**: View in Vercel Dashboard > Your Project > Cron Jobs > Logs

### Verify Test Results
Scheduled test results appear in the "Test Results" tab of the UI, just like manually-run tests.

## Troubleshooting

### Tests Not Running
1. Check cron logs to verify it's executing
2. Verify scheduled jobs exist: `GET /api/tests/schedule?companyId=...`
3. Check that `nextRun` time is in the past
4. Ensure `CRON_SECRET` is set correctly in production

### Authentication Errors
- Verify `CRON_SECRET` matches in both Vercel project settings and cron requests
- Check Vercel cron logs for authentication failures

### Tests Execute But Fail
- Check test runner logs in `/api/tests/run`
- Verify auth token is still valid
- Check Fluid API connectivity

## API Reference

### POST /api/tests/schedule
Schedule or update a test.

**Request Body:**
```json
{
  "companyId": "string",
  "testType": "product-purchase" | "enrollment-purchase" | "subscription-purchase" | "refund-flow" | "customer-auth",
  "interval": "30min" | "hourly" | "daily" | "every-other-day",
  "enabled": true,
  "authToken": "string",
  "settings": {}
}
```

**Response:**
```json
{
  "success": true,
  "schedule": {
    "interval": "hourly",
    "nextRun": "2025-10-15T15:00:00.000Z",
    "lastRun": null
  }
}
```

### GET /api/tests/schedule
Get scheduled jobs for a company.

**Query Parameters:**
- `companyId` (required)

**Response:**
```json
{
  "jobs": [
    {
      "id": "companyId::testType",
      "companyId": "string",
      "testType": "string",
      "interval": "string",
      "nextRun": "ISO date string",
      "lastRun": "ISO date string",
      "enabled": true,
      "settings": {}
    }
  ]
}
```

### GET /api/cron
Execute scheduled tests (called by Vercel Cron).

**Headers:**
- `Authorization: Bearer CRON_SECRET`

**Response:**
```json
{
  "checked": "ISO date string",
  "totalJobs": 5,
  "dueJobs": 2,
  "executed": 2,
  "failed": 0,
  "duration": "1234ms",
  "message": "Executed 2 of 2 due tests",
  "details": [
    {
      "jobId": "string",
      "testType": "string",
      "companyId": "string",
      "status": "success",
      "nextRun": "ISO date string"
    }
  ]
}
```

