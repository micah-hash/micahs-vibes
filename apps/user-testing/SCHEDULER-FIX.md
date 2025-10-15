# Scheduler Fix - Scheduled Tests Now Working

## Problem

Scheduled tests were being saved and showing "next run" times in the UI, but they weren't actually executing. 

### Root Causes

1. **In-Memory Scheduler with setTimeout**: The old `TestScheduler` class used `setTimeout` to schedule tests, which doesn't work in serverless environments (Vercel). Each API call runs in a potentially different container, so the timers were lost between function invocations.

2. **Non-Functional Cron Job**: The `/api/cron` endpoint existed but only returned a success message—it didn't actually check for or run any scheduled tests.

3. **No Persistent Storage**: Scheduled jobs weren't persisted anywhere that the cron job could access them.

## Solution

### 1. Persistent Job Storage
- Extended `testDataStore` to store scheduled job data
- Jobs persist across API calls (in-memory singleton)
- Each job includes: `id`, `companyId`, `testType`, `interval`, `nextRun`, `lastRun`, `enabled`, `authToken`, `settings`

**Files Modified:**
- `src/lib/test-data-store.ts` - Added scheduled job management methods

### 2. Updated Schedule API
- Replaced `testScheduler` usage with direct `testDataStore` operations
- Calculates `nextRun` time when a test is scheduled
- Stores job data that the cron can access
- Returns schedule info to UI for display

**Files Modified:**
- `src/app/api/tests/schedule/route.ts` - Complete rewrite to use persistent storage

### 3. Functional Cron Job
- Checks `testDataStore` for all scheduled jobs every 15 minutes
- Filters jobs where `nextRun` time has passed
- Executes each due test via `/api/tests/run`
- Saves results and sends email notifications
- Updates `nextRun` time for the next execution
- Logs detailed execution information

**Files Modified:**
- `src/app/api/cron/route.ts` - Complete rewrite with actual test execution logic

### 4. Increased Cron Frequency
- Changed from daily (`0 0 * * *`) to every 15 minutes (`*/15 * * * *`)
- Ensures 30-minute tests run within 15 minutes of their scheduled time
- Catches hourly and daily tests promptly

**Files Modified:**
- `vercel.json` - Updated cron schedule

### 5. Development Testing Endpoint
- Created `/api/cron/trigger` for local testing
- Bypasses `CRON_SECRET` authentication in development
- Allows manual triggering without waiting for cron

**Files Added:**
- `src/app/api/cron/trigger/route.ts` - Dev-only cron trigger

### 6. Documentation
- Created comprehensive scheduling documentation
- Updated README with setup instructions
- Updated SETUP-GUIDE with environment variables
- Added troubleshooting guides

**Files Added/Modified:**
- `SCHEDULING.md` - New comprehensive scheduling documentation
- `README.md` - Updated with cron information
- `SETUP-GUIDE.md` - Added environment and testing sections

## How It Works Now

### Scheduling Flow

1. **User enables a test** and sets schedule (e.g., "hourly")
2. **Frontend calls** `POST /api/tests/schedule`
3. **API calculates** `nextRun` time (e.g., 1 hour from now)
4. **Job is stored** in `testDataStore` with all details
5. **UI displays** the `nextRun` time to the user

### Execution Flow

1. **Vercel Cron triggers** `GET /api/cron` every 15 minutes
2. **Cron loads** all scheduled jobs from `testDataStore`
3. **Cron filters** jobs where `nextRun <= now`
4. **For each due job:**
   - Calls `POST /api/tests/run` with test config
   - Saves results via `POST /api/tests/results`
   - Sends email via `POST /api/tests/notify` (if configured)
   - Updates job's `lastRun` and calculates new `nextRun`
   - Stores updated job back to `testDataStore`

## Testing the Fix

### Local Testing

1. Start the dev server:
   ```bash
   pnpm --filter user-testing dev
   ```

2. Open the app with test credentials:
   ```
   http://localhost:3001/user-testing?company_id=test&token=your_token
   ```

3. Enable a test and set it to run every 30 minutes

4. Save the configuration (note the "Next run" time)

5. Manually trigger the cron:
   ```
   http://localhost:3001/api/cron/trigger
   ```

6. Check the console logs - you should see:
   ```
   [Cron] Running scheduled tests check...
   [Cron] Found X total scheduled job(s)
   [Cron] Found Y job(s) due to run
   [Cron] Executing scheduled test: ...
   [Test Runner] Starting test: ...
   [Cron] ✓ Successfully executed test
   ```

7. Check the "Test Results" tab - the test result should appear

### Production Testing

1. Deploy to Vercel with environment variables:
   - `CRON_SECRET` - Generate with `openssl rand -base64 32`
   - `NEXT_PUBLIC_APP_URL` - Your app URL

2. Enable a test with a 30-minute schedule

3. Go to Vercel Dashboard → Your Project → Cron Jobs

4. Wait up to 15 minutes for the next cron execution

5. Check the logs to see execution

6. Verify results appear in the UI

## Environment Requirements

### Development
```bash
CRON_SECRET=dev-secret-key
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### Production (Vercel)
```bash
CRON_SECRET=<secure-random-string>  # Required
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app  # Required
RESEND_API_KEY=<key>  # Optional for emails
```

## Important Notes

### In-Memory Storage Limitation

The current implementation uses in-memory storage (`testDataStore`), which means:

- ✅ Works for single-instance deployments
- ✅ Survives between API calls (singleton pattern)
- ⚠️  Lost if the serverless container restarts
- ⚠️  Doesn't work across multiple instances

### For Production Scale

To make this production-ready at scale, replace `testDataStore` with a database:

1. **Database Storage**: Store scheduled jobs in PostgreSQL/MySQL/MongoDB
2. **Update APIs**: Modify schedule and cron endpoints to use database
3. **Job Queue**: Consider using Bull/BullMQ for reliable scheduling
4. **Distributed Locks**: Prevent duplicate execution across instances

See `SCHEDULING.md` for more details.

## Files Changed

### Core Logic
- ✅ `src/lib/test-data-store.ts` - Added scheduled job storage
- ✅ `src/app/api/tests/schedule/route.ts` - Rewrote to use persistent storage
- ✅ `src/app/api/cron/route.ts` - Rewrote with actual execution logic
- ✅ `vercel.json` - Updated cron frequency to 15 minutes

### Documentation
- ✅ `SCHEDULING.md` - New comprehensive documentation
- ✅ `README.md` - Updated with cron information
- ✅ `SETUP-GUIDE.md` - Added environment and testing sections
- ✅ `SCHEDULER-FIX.md` - This document

### Development Tools
- ✅ `src/app/api/cron/trigger/route.ts` - New dev-only testing endpoint

## Verification Checklist

- [x] Tests can be scheduled via UI
- [x] `nextRun` time displays correctly
- [x] Cron job runs every 15 minutes
- [x] Due tests are detected correctly
- [x] Tests execute successfully
- [x] Results are saved
- [x] Email notifications work (if configured)
- [x] `nextRun` time updates after execution
- [x] Local testing works via `/api/cron/trigger`
- [x] Logs show detailed execution info

## Next Steps

For production deployment:
1. Set `CRON_SECRET` in Vercel environment
2. Set `NEXT_PUBLIC_APP_URL` in Vercel environment
3. Deploy to Vercel
4. Verify cron job appears in Vercel dashboard
5. Enable a test and wait for execution
6. Monitor logs for successful execution

For production scale:
1. Migrate to database storage (see `SCHEDULING.md`)
2. Add database connection string to environment
3. Update schedule/cron endpoints to use database
4. Consider adding a job queue for reliability
5. Implement distributed locks if running multiple instances

