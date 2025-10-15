import { NextRequest, NextResponse } from 'next/server';
import { testDataStore } from '@/lib/test-data-store';

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get('companyId');
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');
  
  if (!companyId) {
    return NextResponse.json(
      { error: 'Company ID is required' },
      { status: 400 }
    );
  }

  const results = testDataStore.getResults(companyId);
  const limitedResults = results.slice(0, limit);

  return NextResponse.json(limitedResults);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, result } = body;

    if (!companyId || !result) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    testDataStore.addResult(companyId, result);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Result save error:', error);
    return NextResponse.json(
      { error: 'Failed to save result' },
      { status: 500 }
    );
  }
}

