import { NextRequest, NextResponse } from 'next/server';
import { ScheduleInterval } from '@/types/test-config';
import { testDataStore } from '@/lib/test-data-store';

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

function getJobId(companyId: string, testType: string): string {
  return `${companyId}::${testType}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, testType, interval, enabled, authToken, settings } = body;

    console.log('[Schedule API] Received request:', { companyId, testType, interval, enabled });

    if (!companyId || !testType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const jobId = getJobId(companyId, testType);

    if (!enabled) {
      // Delete the scheduled job
      testDataStore.deleteScheduledJob(jobId);
      console.log('[Schedule API] Deleted schedule for:', jobId);
      return NextResponse.json({ 
        success: true, 
        message: 'Schedule cleared',
        schedule: {
          interval: null,
          nextRun: null,
          lastRun: null,
        }
      });
    }

    if (!interval || !authToken) {
      return NextResponse.json(
        { error: 'Interval and auth token required to enable scheduling' },
        { status: 400 }
      );
    }

    // Calculate next run time
    const nextRun = calculateNextRun(interval as ScheduleInterval);
    
    // Get existing job to preserve lastRun
    const existingJob = testDataStore.getScheduledJob(jobId);

    // Store the scheduled job
    const job = {
      id: jobId,
      companyId,
      testType,
      interval,
      nextRun: nextRun.toISOString(),
      lastRun: existingJob?.lastRun,
      enabled: true,
      authToken,
      settings,
    };

    testDataStore.setScheduledJob(jobId, job);
    console.log('[Schedule API] Saved schedule:', { jobId, nextRun: job.nextRun });

    return NextResponse.json({
      success: true,
      schedule: {
        interval,
        nextRun: job.nextRun,
        lastRun: job.lastRun,
      },
    });
  } catch (error) {
    console.error('[Schedule API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to schedule test' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const jobs = testDataStore.getCompanyScheduledJobs(companyId);

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('[Schedule API] Get error:', error);
    return NextResponse.json(
      { error: 'Failed to get schedules' },
      { status: 500 }
    );
  }
}

