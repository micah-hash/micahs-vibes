import { NextRequest, NextResponse } from 'next/server';
import { TestRunner } from '@/lib/test-runner';
import { FluidApiClient } from '@/lib/fluid-api';
import { TestType } from '@/types/test-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testType, companySubdomain, authToken, settings } = body;

    console.log('[API /api/tests/run] Received request:', {
      testType,
      companySubdomain,
      hasAuthToken: !!authToken,
      authTokenLength: authToken?.length,
      settings: settings ? Object.keys(settings) : 'none',
    });

    if (!testType || !companySubdomain || !authToken) {
      console.error('[API /api/tests/run] Missing required fields:', {
        hasTestType: !!testType,
        hasCompanySubdomain: !!companySubdomain,
        hasAuthToken: !!authToken,
      });
      return NextResponse.json(
        { error: 'Missing required fields', details: {
          testType: !!testType,
          companySubdomain: !!companySubdomain,
          authToken: !!authToken,
        }},
        { status: 400 }
      );
    }

    // Create Fluid API client
    const client = new FluidApiClient({
      companySubdomain,
      authToken,
    });

    // Run the test with settings
    const runner = new TestRunner(client, settings);
    const result = await runner.runTest(testType as TestType);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /api/tests/run] Test execution error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Test execution failed' },
      { status: 500 }
    );
  }
}

