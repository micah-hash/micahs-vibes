import { NextRequest, NextResponse } from 'next/server';

/**
 * Development-only endpoint to manually trigger the cron job
 * This bypasses the CRON_SECRET authentication for local testing
 * 
 * Usage: GET http://localhost:3001/api/cron/trigger
 */
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  console.log('[Cron Trigger] Manual trigger initiated (development mode)');

  try {
    // Get the base URL
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3001';
    const baseUrl = `${protocol}://${host}`;

    // Call the actual cron endpoint with a fake authorization header
    const cronUrl = `${baseUrl}/api/cron`;
    console.log(`[Cron Trigger] Calling cron endpoint: ${cronUrl}`);

    const response = await fetch(cronUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'dev-secret'}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: 'Cron execution failed',
          details: data,
          status: response.status,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cron job triggered successfully',
      result: data,
    });
  } catch (error) {
    console.error('[Cron Trigger] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to trigger cron job',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

