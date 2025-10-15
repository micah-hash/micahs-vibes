import { NextRequest, NextResponse } from 'next/server';
import { testDataStore } from '@/lib/test-data-store';

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get('companyId');
  
  if (!companyId) {
    return NextResponse.json(
      { error: 'Company ID is required' },
      { status: 400 }
    );
  }

  const config = testDataStore.getConfig(companyId) || {
    tests: [],
    emailNotifications: {
      enabled: true,
      recipients: [],
    },
  };

  return NextResponse.json(config);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, config } = body;

    if (!companyId || !config) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    testDataStore.setConfig(companyId, config);

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error('Config save error:', error);
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}

