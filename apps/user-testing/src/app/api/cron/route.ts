import { NextRequest, NextResponse } from 'next/server';
import { testDataStore } from '@/lib/test-data-store';

// This endpoint will be called by Vercel Cron
// https://vercel.com/docs/cron-jobs

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[Cron] Running scheduled tests check...');

  try {
    // This is a simplified version
    // In production, you'd query a database for all companies with scheduled tests
    
    const results = {
      checked: new Date().toISOString(),
      message: 'Cron job executed successfully',
      note: 'Currently using in-memory storage. For production, integrate with a database to persist schedules and automatically run tests.'
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error('[Cron] Error:', error);
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    );
  }
}

