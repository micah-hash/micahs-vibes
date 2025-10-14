import { NextRequest, NextResponse } from 'next/server';
import { TestRunner } from '@/lib/test-runner';
import { FluidApiClient } from '@/lib/fluid-api';
import { TestType } from '@/types/test-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testType, companySubdomain, authToken, settings } = body;

    if (!testType || !companySubdomain || !authToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
    console.error('Test execution error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Test execution failed' },
      { status: 500 }
    );
  }
}

