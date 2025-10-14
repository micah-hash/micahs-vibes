import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for test results (in production, use a database)
const testResults = new Map<string, any[]>();

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get('companyId');
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');
  
  if (!companyId) {
    return NextResponse.json(
      { error: 'Company ID is required' },
      { status: 400 }
    );
  }

  const results = testResults.get(companyId) || [];
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

    const results = testResults.get(companyId) || [];
    results.unshift(result); // Add to beginning
    
    // Keep only last 1000 results
    if (results.length > 1000) {
      results.pop();
    }

    testResults.set(companyId, results);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Result save error:', error);
    return NextResponse.json(
      { error: 'Failed to save result' },
      { status: 500 }
    );
  }
}

