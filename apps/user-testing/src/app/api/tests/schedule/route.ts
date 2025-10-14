import { NextRequest, NextResponse } from 'next/server';
import { ScheduleInterval } from '@/types/test-config';
import { testScheduler } from '@/lib/scheduler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, testType, interval, enabled, authToken, settings } = body;

    if (!companyId || !testType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!enabled) {
      testScheduler.cancelTest(companyId, testType);
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

    // Schedule the test with settings
    testScheduler.scheduleTest(companyId, testType, interval as ScheduleInterval, authToken, settings);

    const jobStatus = testScheduler.getJobStatus(companyId, testType);

    return NextResponse.json({
      success: true,
      schedule: {
        interval,
        nextRun: jobStatus?.nextRun.toISOString(),
        lastRun: jobStatus?.lastRun?.toISOString(),
      },
    });
  } catch (error) {
    console.error('Schedule error:', error);
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

    const jobs = testScheduler.getCompanyJobs(companyId);

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Get schedule error:', error);
    return NextResponse.json(
      { error: 'Failed to get schedules' },
      { status: 500 }
    );
  }
}

