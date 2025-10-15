import { NextRequest, NextResponse } from 'next/server';
import { TestAnalytics, TestType } from '@/types/test-config';
import { testDataStore } from '@/lib/test-data-store';

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get('companyId');
  
  if (!companyId) {
    return NextResponse.json(
      { error: 'Company ID is required' },
      { status: 400 }
    );
  }

  const results = testDataStore.getResults(companyId);

  // Calculate analytics
  const analytics: TestAnalytics = {
    totalRuns: results.length,
    successRate: calculateSuccessRate(results),
    averageDuration: calculateAverageDuration(results),
    lastSevenDays: calculateLastSevenDays(results),
    byTestType: calculateByTestType(results),
  };

  return NextResponse.json(analytics);
}

function calculateSuccessRate(results: any[]): number {
  if (results.length === 0) return 0;
  const passed = results.filter(r => r.status === 'passed').length;
  return (passed / results.length) * 100;
}

function calculateAverageDuration(results: any[]): number {
  if (results.length === 0) return 0;
  const total = results.reduce((sum, r) => sum + (r.duration || 0), 0);
  return total / results.length;
}

function calculateLastSevenDays(results: any[]): TestAnalytics['lastSevenDays'] {
  const days: TestAnalytics['lastSevenDays'] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayResults = results.filter(r => {
      const resultDate = new Date(r.startTime).toISOString().split('T')[0];
      return resultDate === dateStr;
    });

    days.push({
      date: dateStr,
      passed: dayResults.filter(r => r.status === 'passed').length,
      failed: dayResults.filter(r => r.status === 'failed').length,
    });
  }

  return days;
}

function calculateByTestType(results: any[]): TestAnalytics['byTestType'] {
  const testTypes: TestType[] = [
    'product-purchase',
    'enrollment-purchase',
    'subscription-purchase',
    'refund-flow',
    'customer-auth',
  ];

  return testTypes.map(testType => {
    const typeResults = results.filter(r => r.testType === testType);
    const passed = typeResults.filter(r => r.status === 'passed').length;

    return {
      testType,
      successRate: typeResults.length > 0 ? (passed / typeResults.length) * 100 : 0,
      totalRuns: typeResults.length,
    };
  });
}

