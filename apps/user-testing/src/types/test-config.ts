export type TestType = 
  | 'product-purchase'
  | 'enrollment-purchase'
  | 'subscription-purchase'
  | 'refund-flow'
  | 'customer-auth';

export type ScheduleInterval = 
  | '30min'
  | 'hourly'
  | 'daily'
  | 'every-other-day';

export type TestStatus = 
  | 'idle'
  | 'running'
  | 'passed'
  | 'failed'
  | 'scheduled';

export interface TestConfig {
  id: TestType;
  name: string;
  description: string;
  enabled: boolean;
  schedule: ScheduleInterval;
  lastRun?: Date;
  nextRun?: Date;
  settings?: TestSettings;
}

export interface TestSettings {
  // Product Purchase Flow settings
  selectedProductIds?: string[];
  
  // Enrollment Purchase Flow settings
  selectedEnrollmentProductIds?: string[];
  
  // Subscription Purchase Flow settings
  selectedSubscriptionProductIds?: string[];
  subscriptionIntervals?: Record<string, string>; // productId -> interval (e.g., 'monthly', 'quarterly')
  
  // Refund Flow settings
  testRefundAmount?: 'full' | 'partial';
  
  // Customer Auth settings
  testEmailDomain?: string;
}

export interface TestResult {
  id: string;
  testType: TestType;
  status: TestStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in milliseconds
  steps: TestStep[];
  error?: string;
  metadata?: Record<string, any>;
}

export interface TestStep {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  details?: string;
}

export interface TestAnalytics {
  totalRuns: number;
  successRate: number;
  averageDuration: number;
  lastSevenDays: {
    date: string;
    passed: number;
    failed: number;
  }[];
  byTestType: {
    testType: TestType;
    successRate: number;
    totalRuns: number;
  }[];
}

export interface EmailNotification {
  to: string;
  subject: string;
  testResults: TestResult[];
  summary: {
    passed: number;
    failed: number;
    total: number;
  };
}

export const TEST_DEFINITIONS: Record<TestType, { name: string; description: string }> = {
  'product-purchase': {
    name: 'Product Purchase Flow',
    description: 'Test adding a product to cart, going through checkout, and completing purchase'
  },
  'enrollment-purchase': {
    name: 'Enrollment Purchase Flow',
    description: 'Test the complete enrollment purchase process with product enrollment'
  },
  'subscription-purchase': {
    name: 'Subscription Purchase Flow',
    description: 'Test subscription-based product purchase and recurring billing setup'
  },
  'refund-flow': {
    name: 'Refund/Return Flow',
    description: 'Test the refund and return process for completed orders'
  },
  'customer-auth': {
    name: 'Customer Authentication',
    description: 'Test customer login, registration, and authentication flows'
  }
};

export const SCHEDULE_OPTIONS = [
  { value: '30min', label: 'Every 30 minutes' },
  { value: 'hourly', label: 'Every hour' },
  { value: 'daily', label: 'Once daily' },
  { value: 'every-other-day', label: 'Every other day' }
] as const;

export interface FluidProduct {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  type?: string;
  status?: string;
  image_url?: string;
  subscription?: {
    available_intervals?: string[]; // e.g., ['monthly', 'quarterly', 'yearly']
    default_interval?: string;
    trial_days?: number;
  };
}

