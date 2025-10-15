import { NextRequest, NextResponse } from 'next/server';
import { testDataStore, ScheduledJobData } from '@/lib/test-data-store';
import { ScheduleInterval } from '@/types/test-config';

// This endpoint will be called by Vercel Cron
// https://vercel.com/docs/cron-jobs

function calculateNextRun(interval: ScheduleInterval): Date {
  const now = new Date();
  const nextRun = new Date(now);

  switch (interval) {
    case '30min':
      nextRun.setMinutes(nextRun.getMinutes() + 30);
      break;
    case 'hourly':
      nextRun.setHours(nextRun.getHours() + 1);
      break;
    case 'daily':
      nextRun.setDate(nextRun.getDate() + 1);
      break;
    case 'every-other-day':
      nextRun.setDate(nextRun.getDate() + 2);
      break;
  }

  return nextRun;
}

async function executeScheduledTest(job: ScheduledJobData): Promise<void> {
  console.log(`[Cron] Executing scheduled test: ${job.testType} for company ${job.companyId}`);

  try {
    // Get the base URL for the API
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3001';

    // Call the test runner API
    const response = await fetch(`${baseUrl}/api/tests/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        testType: job.testType,
        companySubdomain: job.companyId,
        authToken: job.authToken,
        settings: job.settings,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Test execution failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`[Cron] Test completed with status: ${result.status}`);

    // Save result
    await fetch(`${baseUrl}/api/tests/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: job.companyId,
        result,
      }),
    });

    // Send notification if configured
    const config = testDataStore.getConfig(job.companyId);
    
    if (config?.emailNotifications?.enabled && config.emailNotifications?.recipients?.length > 0) {
      await fetch(`${baseUrl}/api/tests/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: config.emailNotifications.recipients.join(', '),
          subject: `Scheduled Test: ${result.status === 'passed' ? '✓' : '✗'} ${job.testType}`,
          testResults: [result],
          summary: {
            passed: result.status === 'passed' ? 1 : 0,
            failed: result.status === 'failed' ? 1 : 0,
            total: 1,
          },
        }),
      });
      console.log(`[Cron] Email notification sent to ${config.emailNotifications.recipients.length} recipient(s)`);
    }

    console.log(`[Cron] ✓ Successfully executed test: ${job.testType}`);
  } catch (error) {
    console.error(`[Cron] ✗ Test execution failed for ${job.id}:`, error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log('[Cron] Unauthorized request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();
  console.log('[Cron] ========================================');
  console.log('[Cron] Running scheduled tests check...');
  console.log('[Cron] Time:', new Date().toISOString());

  try {
    // Get all scheduled jobs
    const allJobs = testDataStore.getAllScheduledJobs();
    console.log(`[Cron] Found ${allJobs.length} total scheduled job(s)`);

    if (allJobs.length === 0) {
      console.log('[Cron] No scheduled jobs found');
      return NextResponse.json({
        checked: new Date().toISOString(),
        message: 'No scheduled tests to run',
        totalJobs: 0,
        dueJobs: 0,
        executed: 0,
      });
    }

    // Filter jobs that are due to run
    const now = new Date();
    const dueJobs = allJobs.filter(job => {
      const nextRun = new Date(job.nextRun);
      return job.enabled && nextRun <= now;
    });

    console.log(`[Cron] Found ${dueJobs.length} job(s) due to run`);

    const results = {
      checked: now.toISOString(),
      totalJobs: allJobs.length,
      dueJobs: dueJobs.length,
      executed: 0,
      failed: 0,
      details: [] as any[],
    };

    // Execute due jobs
    for (const job of dueJobs) {
      console.log(`[Cron] Processing job: ${job.id}`);
      try {
        await executeScheduledTest(job);
        
        // Update job with new next run time
        const nextRun = calculateNextRun(job.interval as ScheduleInterval);
        const updatedJob = {
          ...job,
          lastRun: now.toISOString(),
          nextRun: nextRun.toISOString(),
        };
        testDataStore.setScheduledJob(job.id, updatedJob);
        
        results.executed++;
        results.details.push({
          jobId: job.id,
          testType: job.testType,
          companyId: job.companyId,
          status: 'success',
          nextRun: nextRun.toISOString(),
        });
        
        console.log(`[Cron] ✓ Job completed: ${job.id}, next run: ${nextRun.toISOString()}`);
      } catch (error) {
        results.failed++;
        results.details.push({
          jobId: job.id,
          testType: job.testType,
          companyId: job.companyId,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        
        // Still update next run time even if failed
        const nextRun = calculateNextRun(job.interval as ScheduleInterval);
        const updatedJob = {
          ...job,
          nextRun: nextRun.toISOString(),
        };
        testDataStore.setScheduledJob(job.id, updatedJob);
        
        console.error(`[Cron] ✗ Job failed: ${job.id}`, error);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[Cron] ========================================`);
    console.log(`[Cron] Completed in ${duration}ms`);
    console.log(`[Cron] Executed: ${results.executed}/${results.dueJobs}`);
    console.log(`[Cron] Failed: ${results.failed}`);
    console.log(`[Cron] ========================================`);

    return NextResponse.json({
      ...results,
      duration: `${duration}ms`,
      message: `Executed ${results.executed} of ${results.dueJobs} due tests`,
    });
  } catch (error) {
    console.error('[Cron] Error:', error);
    return NextResponse.json(
      { 
        error: 'Cron job failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        checked: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}


