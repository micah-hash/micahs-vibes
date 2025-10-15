'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { TestConfig, TestResult, TestAnalytics, TEST_DEFINITIONS, SCHEDULE_OPTIONS, TestType } from '@/types/test-config';
import TestSettingsModal from '../components/TestSettingsModal';
import OnboardingTour from '../components/OnboardingTour';

export default function EmbedPage() {
  const searchParams = useSearchParams();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tests' | 'results' | 'analytics'>('tests');
  const [testConfigs, setTestConfigs] = useState<TestConfig[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [analytics, setAnalytics] = useState<TestAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [runningTestId, setRunningTestId] = useState<TestType | null>(null);
  const [testProgress, setTestProgress] = useState<string>('');
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [emailRecipients, setEmailRecipients] = useState<string>('');
  const [savedEmailRecipients, setSavedEmailRecipients] = useState<string>('');
  const [editingTest, setEditingTest] = useState<TestConfig | null>(null);
  const [showTour, setShowTour] = useState(false);
  const [tourAutoEnabled, setTourAutoEnabled] = useState(false);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());

  useEffect(() => {
    const company = searchParams.get('company_id') || searchParams.get('companyId');
    const token = searchParams.get('token') || searchParams.get('auth_token');
    
    setCompanyId(company);
    setAuthToken(token);

    if (token) {
      sessionStorage.setItem('fluid_auth_token', token);
    }

    // Load Fluid SDK for cart operations
    if (company) {
      loadFluidSDK(company);
    }

    // Initialize test configs
    const defaultConfigs: TestConfig[] = Object.entries(TEST_DEFINITIONS).map(([id, def]) => ({
      id: id as TestType,
      name: def.name,
      description: def.description,
      enabled: false,
      schedule: 'hourly',
    }));
    setTestConfigs(defaultConfigs);

    // Load saved config and results
    if (company) {
      loadConfiguration(company);
      loadResults(company);
      loadAnalytics(company);
    }

    // Check if user has completed onboarding
    const hasCompletedTour = localStorage.getItem('onboarding_completed');
    if (!hasCompletedTour && company) {
      // Show tour after a brief delay to let the page render
      setTimeout(() => setShowTour(true), 1000);
    }

    // Load mock data if in dev mode (no company_id)
    if (!company) {
      loadMockData();
    }
  }, [searchParams]);

  const loadFluidSDK = (companyId: string) => {
    // Check if SDK is already loaded
    if (document.getElementById('fluid-cdn-script')) {
      console.log('[Fluid SDK] Script tag already exists');
      
      // Check if the SDK object is actually available
      if ((window as any).FairShareSDK) {
        console.log('[Fluid SDK] SDK object is available');
      } else {
        console.warn('[Fluid SDK] Script tag exists but SDK object not available yet');
      }
      return;
    }

    console.log(`[Fluid SDK] Loading SDK for company: ${companyId}`);
    console.log(`[Fluid SDK] SDK URL: https://assets.fluid.app/scripts/fluid-sdk/latest/web-widgets/index.js`);
    
    const script = document.createElement('script');
    script.id = 'fluid-cdn-script';
    script.src = 'https://assets.fluid.app/scripts/fluid-sdk/latest/web-widgets/index.js';
    script.type = 'module'; // Required for ES6 modules
    script.setAttribute('data-fluid-shop', companyId);
    script.async = true;
    
    script.onload = () => {
      console.log('[Fluid SDK] ✅ Script loaded successfully');
      
      // Check if SDK is actually available
      setTimeout(() => {
        if ((window as any).FairShareSDK) {
          console.log('[Fluid SDK] ✅ SDK object is now available');
          console.log('[Fluid SDK] Available methods:', Object.keys((window as any).FairShareSDK));
        } else {
          console.error('[Fluid SDK] ❌ Script loaded but SDK object not available');
        }
      }, 500);
    };
    
    script.onerror = (error) => {
      console.error('[Fluid SDK] ❌ Failed to load script:', error);
      console.error('[Fluid SDK] Check if the URL is correct and accessible');
    };
    
    document.head.appendChild(script);
    console.log('[Fluid SDK] Script tag added to document head');
  };

  const loadMockData = () => {
    // Mock test results
    const mockResults: TestResult[] = [
      {
        id: 'test-mock-1',
        testType: 'product-purchase',
        status: 'passed',
        startTime: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
        endTime: new Date(Date.now() - 1000 * 60 * 30 + 2500),
        duration: 2500,
        steps: [
          { name: 'Select product for testing', status: 'passed', duration: 450, details: '{"productId":"prod_abc123"}' },
          { name: 'Add product to cart', status: 'passed', duration: 680, details: '{"cartId":"cart_xyz789"}' },
          { name: 'Process checkout', status: 'passed', duration: 850, details: '{"checkoutId":"checkout_456"}' },
          { name: 'Complete purchase', status: 'passed', duration: 520, details: '{"orderId":"order_789"}' },
        ],
        metadata: { orderId: 'order_789', productId: 'prod_abc123' }
      },
      {
        id: 'test-mock-2',
        testType: 'subscription-purchase',
        status: 'failed',
        startTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        endTime: new Date(Date.now() - 1000 * 60 * 60 * 2 + 3200),
        duration: 3200,
        error: 'Payment gateway timeout',
        steps: [
          { name: 'Select subscription product for testing', status: 'passed', duration: 520, details: '{"productId":"sub_monthly123","interval":"monthly"}' },
          { name: 'Add subscription product to cart', status: 'passed', duration: 720, details: '{"cartId":"cart_sub456"}' },
          { name: 'Process subscription checkout', status: 'failed', duration: 1960, error: 'Payment gateway timeout after 2000ms', details: '{"error":"ETIMEDOUT","message":"Payment gateway timeout after 2000ms","stack":"Error: Payment gateway timeout\\n    at PaymentService.process"}' },
        ],
        metadata: { productId: 'sub_monthly123', interval: 'monthly' }
      },
      {
        id: 'test-mock-3',
        testType: 'customer-auth',
        status: 'passed',
        startTime: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        endTime: new Date(Date.now() - 1000 * 60 * 60 * 5 + 1800),
        duration: 1800,
        steps: [
          { name: 'Register new customer', status: 'passed', duration: 650, details: '{"customerId":"cust_test123","email":"test@example.com"}' },
          { name: 'Customer login', status: 'passed', duration: 480, details: '{"token":"jwt_token_abc"}' },
          { name: 'Get customer profile', status: 'passed', duration: 380, details: '{"customerId":"cust_test123","name":"Test User"}' },
          { name: 'Customer logout', status: 'passed', duration: 290, details: '{"success":true}' },
        ],
        metadata: { customerId: 'cust_test123', email: 'test@example.com' }
      },
      {
        id: 'test-mock-4',
        testType: 'refund-flow',
        status: 'failed',
        startTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        endTime: new Date(Date.now() - 1000 * 60 * 60 * 24 + 2100),
        duration: 2100,
        error: 'Order not found in system',
        steps: [
          { name: 'Get order for refund', status: 'failed', duration: 2100, error: 'Order not found in system', details: '{"error":"ORDER_NOT_FOUND","message":"Order not found in system","orderId":"order_notfound"}' },
        ],
        metadata: { orderId: 'order_notfound' }
      },
      {
        id: 'test-mock-5',
        testType: 'enrollment-purchase',
        status: 'passed',
        startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        endTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 3100),
        duration: 3100,
        steps: [
          { name: 'Select enrollment product', status: 'passed', duration: 520, details: '{"productId":"enroll_vip123"}' },
          { name: 'Add enrollment to cart', status: 'passed', duration: 680, details: '{"cartId":"cart_enroll456"}' },
          { name: 'Process enrollment checkout', status: 'passed', duration: 950, details: '{"checkoutId":"checkout_enroll789"}' },
          { name: 'Complete enrollment purchase', status: 'passed', duration: 950, details: '{"orderId":"order_enroll999","enrollmentId":"enroll_active"}' },
        ],
        metadata: { orderId: 'order_enroll999', enrollmentId: 'enroll_active' }
      },
    ];

    // Mock analytics
    const mockAnalytics: TestAnalytics = {
      totalRuns: 47,
      successRate: 74.5,
      averageDuration: 2680,
      lastSevenDays: [
        { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString().split('T')[0], passed: 4, failed: 2 },
        { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString().split('T')[0], passed: 6, failed: 1 },
        { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString().split('T')[0], passed: 5, failed: 3 },
        { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString().split('T')[0], passed: 7, failed: 1 },
        { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0], passed: 4, failed: 4 },
        { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString().split('T')[0], passed: 6, failed: 2 },
        { date: new Date().toISOString().split('T')[0], passed: 3, failed: 1 },
      ],
      byTestType: [
        { testType: 'product-purchase', successRate: 92.3, totalRuns: 13 },
        { testType: 'subscription-purchase', successRate: 68.8, totalRuns: 16 },
        { testType: 'enrollment-purchase', successRate: 85.7, totalRuns: 7 },
        { testType: 'refund-flow', successRate: 50.0, totalRuns: 6 },
        { testType: 'customer-auth', successRate: 100.0, totalRuns: 5 },
      ],
    };

    setTestResults(mockResults);
    setAnalytics(mockAnalytics);
  };

  const loadConfiguration = async (companyId: string) => {
    try {
      const response = await fetch(`/api/tests/config?companyId=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.tests && data.tests.length > 0) {
          setTestConfigs(data.tests);
        }
        if (data.emailNotifications?.recipients) {
          const emailString = data.emailNotifications.recipients.join(', ');
          setEmailRecipients(emailString);
          setSavedEmailRecipients(emailString);
        }
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
    }
  };

  const loadResults = async (companyId: string) => {
    try {
      const response = await fetch(`/api/tests/results?companyId=${companyId}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setTestResults(data);
      }
    } catch (error) {
      console.error('Failed to load results:', error);
    }
  };

  const loadAnalytics = async (companyId: string) => {
    try {
      const response = await fetch(`/api/tests/analytics?companyId=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const saveConfiguration = async () => {
    if (!companyId || !authToken) return;

    try {
      setLoading(true);
      const config = {
        tests: testConfigs,
        emailNotifications: {
          enabled: true,
          recipients: emailRecipients.split(',').map(e => e.trim()).filter(Boolean),
        },
      };

      // Save configuration
      const response = await fetch('/api/tests/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, config }),
      });

      if (response.ok) {
        // Update schedules for each test and get next run times
        const updatedConfigs = [...testConfigs];
        
        for (let i = 0; i < testConfigs.length; i++) {
          const testConfig = testConfigs[i];
          const scheduleResponse = await fetch('/api/tests/schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              companyId,
              testType: testConfig.id,
              interval: testConfig.schedule,
              enabled: testConfig.enabled,
              authToken,
              settings: testConfig.settings,
            }),
          });

          if (scheduleResponse.ok) {
            const scheduleData = await scheduleResponse.json();
            if (scheduleData.schedule) {
              updatedConfigs[i] = {
                ...updatedConfigs[i],
                nextRun: scheduleData.schedule.nextRun ? new Date(scheduleData.schedule.nextRun) : undefined,
                lastRun: scheduleData.schedule.lastRun ? new Date(scheduleData.schedule.lastRun) : undefined,
              };
            }
          }
        }

        setTestConfigs(updatedConfigs);
        setSavedEmailRecipients(emailRecipients);
        alert('Configuration saved and tests scheduled successfully!');
      }
    } catch (error) {
      console.error('Failed to save configuration:', error);
      alert('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const toggleTest = (testId: TestType) => {
    setTestConfigs(configs =>
      configs.map(config =>
        config.id === testId ? { ...config, enabled: !config.enabled } : config
      )
    );
  };

  const updateSchedule = (testId: TestType, schedule: string) => {
    setTestConfigs(configs =>
      configs.map(config =>
        config.id === testId ? { ...config, schedule: schedule as any } : config
      )
    );
  };

  const updateTestSettings = (testId: TestType, settings: TestConfig['settings']) => {
    setTestConfigs(configs =>
      configs.map(config =>
        config.id === testId ? { ...config, settings } : config
      )
    );
  };

  const runTest = async (testId: TestType) => {
    if (!companyId || !authToken) {
      alert('Missing company ID or auth token');
      return;
    }

    try {
      setLoading(true);
      setRunningTestId(testId);
      setProgressPercentage(0);
      
      // Get test settings
      const testConfig = testConfigs.find(c => c.id === testId);
      const testName = testConfig?.name || 'test';
      setTestProgress(`Preparing ${testName.toLowerCase()}...`);
      
      // Check if this is a product purchase test and SDK is available
      const isProductPurchase = testId === 'product-purchase';
      const sdkAvailable = typeof window !== 'undefined' && !!(window as any).FairShareSDK;
      
      console.log(`[Run Test] Test: ${testId}, SDK Available: ${sdkAvailable}`);
      
      // For product purchase with SDK, run client-side
      if (isProductPurchase && sdkAvailable) {
        console.log('[Run Test] Running client-side test with SDK');
        const result = await runClientSideTest(testId, testConfig?.settings);
        
        setTestProgress('Saving results...');
        setProgressPercentage(90);
        // Save result
        await fetch('/api/tests/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyId, result }),
        });

        setTestProgress('Loading updated results...');
        setProgressPercentage(95);
        // Reload results and analytics
        await loadResults(companyId);
        await loadAnalytics(companyId);

        setTestProgress('Complete!');
        setProgressPercentage(100);
        
        // Brief delay to show 100% completion
        await new Promise(resolve => setTimeout(resolve, 300));
        
        alert(`Test completed: ${result.status}`);
      } else {
        // Run server-side test
        console.log('[Run Test] Running server-side test');
        const testName = testConfig?.name || 'test';
        setTestProgress(`Running ${testName.toLowerCase()}...`);
        setProgressPercentage(50);
        
        const response = await fetch('/api/tests/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            testType: testId,
            companySubdomain: companyId,
            authToken,
            settings: testConfig?.settings,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          
          setTestProgress('Saving results...');
          setProgressPercentage(90);
          // Save result
          await fetch('/api/tests/results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companyId, result }),
          });

          setTestProgress('Loading updated results...');
          setProgressPercentage(95);
          // Reload results and analytics
          await loadResults(companyId);
          await loadAnalytics(companyId);

          setTestProgress('Complete!');
          setProgressPercentage(100);
          
          // Brief delay to show 100% completion
          await new Promise(resolve => setTimeout(resolve, 300));
          
          alert(`Test completed: ${result.status}`);
        } else {
          setTestProgress('');
          setProgressPercentage(0);
          alert('Test execution failed');
        }
      }
    } catch (error) {
      console.error('Failed to run test:', error);
      setTestProgress('');
      setProgressPercentage(0);
      alert('Failed to run test');
    } finally {
      setLoading(false);
      setRunningTestId(null);
      setTestProgress('');
      setProgressPercentage(0);
    }
  };

  const runClientSideTest = async (testId: TestType, settings: any) => {
    const { TestRunner } = await import('@/lib/test-runner');
    const { FluidApiClient } = await import('@/lib/fluid-api');
    
    console.log('[Client-Side Test] Creating Fluid API client');
    const client = new FluidApiClient({
      companySubdomain: companyId!,
      authToken: authToken!,
    });
    
    console.log('[Client-Side Test] Creating test runner');
    const runner = new TestRunner(client, settings, (progress, currentStep, totalSteps) => {
      // Update progress in real-time
      setTestProgress(progress);
      
      // Calculate and update percentage
      if (currentStep && totalSteps) {
        const percentage = Math.round((currentStep / totalSteps) * 100);
        setProgressPercentage(percentage);
      }
    });
    
    console.log('[Client-Side Test] Running test...');
    const result = await runner.runTest(testId);
    
    console.log('[Client-Side Test] Test completed:', result);
    return result;
  };

  const runAllTests = async () => {
    const enabledTests = testConfigs.filter(c => c.enabled);
    for (const test of enabledTests) {
      await runTest(test.id);
    }
  };

  const handleTourComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setShowTour(false);
    // Reset the first test if it was auto-enabled by the tour
    if (tourAutoEnabled && testConfigs.length > 0) {
      const updated = [...testConfigs];
      updated[0].enabled = false;
      setTestConfigs(updated);
      setTourAutoEnabled(false);
    }
  };

  const handleTourSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setShowTour(false);
    // Reset the first test if it was auto-enabled by the tour
    if (tourAutoEnabled && testConfigs.length > 0) {
      const updated = [...testConfigs];
      updated[0].enabled = false;
      setTestConfigs(updated);
      setTourAutoEnabled(false);
    }
  };

  const restartTour = () => {
    setShowTour(true);
  };

  const toggleResultExpanded = (resultId: string) => {
    setExpandedResults(prev => {
      const next = new Set(prev);
      if (next.has(resultId)) {
        next.delete(resultId);
      } else {
        next.add(resultId);
      }
      return next;
    });
  };

  const handleTourStepChange = (stepId: string) => {
    // Perform actions based on which tour step we're on
    switch (stepId) {
      case 'welcome':
        // Reset to initial state if going back to welcome
        if (tourAutoEnabled && testConfigs.length > 0) {
          const updated = [...testConfigs];
          updated[0].enabled = false;
          setTestConfigs(updated);
          setTourAutoEnabled(false);
        }
        break;

      case 'enable-tests':
        // Enable the first test to reveal the schedule options
        if (testConfigs.length > 0 && !testConfigs[0].enabled) {
          const updated = [...testConfigs];
          updated[0].enabled = true;
          setTestConfigs(updated);
          setTourAutoEnabled(true);
        }
        break;
      
      case 'configure-settings':
        // Keep the first test enabled so settings button is visible
        // Ensure it stays enabled if user navigates back and forth
        if (testConfigs.length > 0 && !testConfigs[0].enabled && tourAutoEnabled) {
          const updated = [...testConfigs];
          updated[0].enabled = true;
          setTestConfigs(updated);
        }
        break;
      
      case 'set-schedule':
        // Ensure first test is enabled so schedule dropdown is visible
        if (testConfigs.length > 0 && !testConfigs[0].enabled && tourAutoEnabled) {
          const updated = [...testConfigs];
          updated[0].enabled = true;
          setTestConfigs(updated);
        }
        break;
      
      case 'email-notifications':
        // Keep first test enabled
        if (testConfigs.length > 0 && !testConfigs[0].enabled && tourAutoEnabled) {
          const updated = [...testConfigs];
          updated[0].enabled = true;
          setTestConfigs(updated);
        }
        break;
      
      case 'save-and-run':
        // Keep first test enabled
        if (testConfigs.length > 0 && !testConfigs[0].enabled && tourAutoEnabled) {
          const updated = [...testConfigs];
          updated[0].enabled = true;
          setTestConfigs(updated);
        }
        break;
      
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 p-6">
      {/* Loading Modal */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4 relative overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
            
            <div className="relative">
              {/* Spinner */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Status */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {runningTestId && testConfigs.find(c => c.id === runningTestId)?.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {testProgress || 'Processing...'}
                </p>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                
                <p className="text-xs text-gray-500 mt-4">
                  This may take a few moments...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-8 overflow-hidden">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
          
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                Fluid Automated Testing
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Monitor your Fluid flows with automated tests</p>
            </div>
            <div className="flex items-center gap-3">
              {companyId && (
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-semibold shadow-lg shadow-blue-500/30">
                  {companyId}
                </div>
              )}
              <button
                onClick={restartTour}
                className="bg-white/80 backdrop-blur text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white transition-all shadow-sm flex items-center gap-2"
                title="Restart tour"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tour
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="group relative bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="text-sm font-medium text-gray-500 mb-2">Total Tests Run</div>
                <div className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{analytics.totalRuns}</div>
              </div>
            </div>
            <div className="group relative bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="text-sm font-medium text-gray-500 mb-2">Success Rate</div>
                <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {analytics.successRate.toFixed(1)}%
                </div>
                <div className={`text-sm mt-2 font-semibold ${analytics.successRate >= 90 ? 'text-green-600' : 'text-amber-600'}`}>
                  {analytics.successRate >= 90 ? '✓ Healthy' : '⚠ Needs attention'}
                </div>
              </div>
            </div>
            <div className="group relative bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="text-sm font-medium text-gray-500 mb-2">Avg Duration</div>
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {(analytics.averageDuration / 1000).toFixed(1)}s
                </div>
              </div>
            </div>
            <div className="group relative bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="text-sm font-medium text-gray-500 mb-2">Active Tests</div>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {testConfigs.filter(c => c.enabled).length}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-transparent to-blue-50/30 pointer-events-none"></div>
          
          <div className="relative border-b border-gray-200/50">
            <nav className="flex space-x-2 px-6 py-2" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('tests')}
                className={`relative py-4 px-6 font-semibold text-sm rounded-2xl transition-all duration-300 ${
                  activeTab === 'tests'
                    ? 'text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                }`}
              >
                {activeTab === 'tests' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl shadow-lg shadow-blue-500/30"></div>
                )}
                <span className="relative">Test Configuration</span>
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`relative py-4 px-6 font-semibold text-sm rounded-2xl transition-all duration-300 ${
                  activeTab === 'results'
                    ? 'text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                }`}
              >
                {activeTab === 'results' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl shadow-lg shadow-purple-500/30"></div>
                )}
                <span className="relative">Test Results</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`relative py-4 px-6 font-semibold text-sm rounded-2xl transition-all duration-300 ${
                  activeTab === 'analytics'
                    ? 'text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                }`}
              >
                {activeTab === 'analytics' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/30"></div>
                )}
                <span className="relative">Analytics</span>
              </button>
            </nav>
          </div>

          <div className="relative p-8">
            {/* Test Configuration Tab */}
            {activeTab === 'tests' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Configure Automated Tests
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Enable tests and set schedules - they'll run automatically in the background
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={runAllTests}
                      disabled={loading || testConfigs.filter(c => c.enabled).length === 0}
                      className="relative group bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                    >
                      <span className="relative">Run All Enabled Tests</span>
                    </button>
                    <button
                      onClick={saveConfiguration}
                      disabled={loading}
                      className="relative group bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      data-tour="save-button"
                    >
                      <span className="relative">Save Configuration</span>
                    </button>
                  </div>
                </div>

                {/* Email Notifications */}
                <div className="relative bg-gradient-to-br from-blue-50/50 to-purple-50/30 backdrop-blur rounded-3xl p-6 border border-blue-100/50 shadow-lg" data-tour="email-input">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl pointer-events-none"></div>
                  <div className="relative">
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">📧 Email Notifications</h3>
                    <p className="text-sm text-gray-600 mb-4">Receive email notifications when tests complete (comma-separated)</p>
                    <input
                      type="text"
                      value={emailRecipients}
                      onChange={(e) => setEmailRecipients(e.target.value)}
                      placeholder="email1@example.com, email2@example.com"
                      className="w-full px-5 py-3 bg-white/80 backdrop-blur border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm placeholder:text-gray-400 text-gray-900"
                    />
                    {emailRecipients && emailRecipients !== savedEmailRecipients && (
                      <div className="mt-3 flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl font-semibold">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Unsaved
                        </div>
                        <span className="text-gray-500">
                          Click "Save Configuration" to save email recipients
                        </span>
                      </div>
                    )}
                    {emailRecipients && emailRecipients === savedEmailRecipients && (
                      <div className="mt-3 flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl font-semibold">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Saved
                        </div>
                        <span className="text-gray-500">
                          Email notifications will be sent to these addresses
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scheduled Tests Overview - Always visible to prevent layout shift */}
                <div className={`mb-8 relative backdrop-blur-lg border rounded-3xl p-6 shadow-xl transition-all duration-300 ${
                  testConfigs.some(c => c.enabled) 
                    ? 'bg-gradient-to-br from-emerald-50/80 to-blue-50/50 border-emerald-200/50' 
                    : 'bg-gradient-to-br from-gray-50/80 to-slate-50/50 border-gray-200/50'
                }`}>
                  <div className={`absolute inset-0 bg-gradient-to-br rounded-3xl pointer-events-none transition-all duration-300 ${
                    testConfigs.some(c => c.enabled)
                      ? 'from-emerald-500/5 to-blue-500/5'
                      : 'from-gray-500/5 to-slate-500/5'
                  }`}></div>
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`text-white rounded-xl p-2 transition-all duration-300 ${
                          testConfigs.some(c => c.enabled) ? 'bg-emerald-500' : 'bg-gray-400'
                        }`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Active Schedules</h3>
                          <p className="text-sm text-gray-600">
                            {testConfigs.some(c => c.enabled) 
                              ? `${testConfigs.filter(c => c.enabled).length} test${testConfigs.filter(c => c.enabled).length === 1 ? '' : 's'} scheduled to run automatically`
                              : 'No tests scheduled yet - enable a test below to get started'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {testConfigs.some(c => c.enabled) ? (
                      <div className="space-y-3">
                        {testConfigs.filter(c => c.enabled).map((config) => (
                          <div key={config.id} className="bg-white/80 backdrop-blur rounded-2xl p-4 border border-gray-200/50 hover:border-emerald-300/50 transition-all">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="flex items-center gap-3">
                                  <div className="bg-emerald-100 text-emerald-700 rounded-lg px-3 py-1 text-xs font-bold">
                                    ACTIVE
                                  </div>
                                  <span className="font-semibold text-gray-900">{config.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="font-medium">
                                    {SCHEDULE_OPTIONS.find(opt => opt.value === config.schedule)?.label || config.schedule}
                                  </span>
                                  {config.nextRun && (
                                    <span className="text-gray-500">
                                      • Next: {new Date(config.nextRun).toLocaleString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric', 
                                        hour: 'numeric', 
                                        minute: '2-digit',
                                        hour12: true 
                                      })}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => toggleTest(config.id)}
                                className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg px-3 py-2 text-sm font-semibold transition-all flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Disable
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white/60 backdrop-blur rounded-2xl p-6 border border-gray-200/50 text-center">
                        <div className="text-gray-400 mb-2">
                          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 text-sm">
                          Enable a test below to schedule automatic testing
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Test Configs */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    All Available Tests
                  </h3>
                  {testConfigs.map((config, index) => (
                    <div key={config.id} className={`group relative backdrop-blur-lg border rounded-3xl p-6 hover:shadow-2xl transition-all duration-300 ${config.enabled ? 'bg-emerald-50/40 border-emerald-200/50 hover:border-emerald-300' : 'bg-white/60 border-gray-200/50 hover:border-blue-200/50'}`} data-tour={index === 0 ? "test-card" : undefined}>
                      <div className={`absolute inset-0 bg-gradient-to-br rounded-3xl transition-all duration-300 pointer-events-none ${config.enabled ? 'from-emerald-500/0 to-blue-500/0 group-hover:from-emerald-500/5 group-hover:to-blue-500/5' : 'from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5'}`}></div>
                      
                      <div className="relative flex items-start justify-between">
                        <div className="flex items-start space-x-5 flex-1">
                          <div className="relative mt-1">
                            <input
                              type="checkbox"
                              checked={config.enabled}
                              onChange={() => toggleTest(config.id)}
                              className="h-6 w-6 text-blue-600 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer transition-all"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-gray-900 text-lg">{config.name}</h3>
                              {config.enabled && (
                                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  SCHEDULED
                                </span>
                              )}
                              {(() => {
                                const getProductCount = () => {
                                  switch (config.id) {
                                    case 'product-purchase':
                                      return config.settings?.selectedProductIds?.length || 0;
                                    case 'enrollment-purchase':
                                      return config.settings?.selectedEnrollmentProductIds?.length || 0;
                                    case 'subscription-purchase':
                                      return config.settings?.selectedSubscriptionProductIds?.length || 0;
                                    default:
                                      return 0;
                                  }
                                };
                                const productCount = getProductCount();
                                
                                return productCount > 0 ? (
                                  <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-xl">
                                    {productCount} product{productCount === 1 ? '' : 's'}
                                  </span>
                                ) : null;
                              })()}
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">{config.description}</p>
                            
                            {/* Settings Button */}
                            <button
                              onClick={() => setEditingTest(config)}
                              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                              data-tour={index === 0 ? "settings-button" : undefined}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Configure Test Settings
                            </button>
                            
                            {config.enabled && (
                              <div className="mt-4 space-y-3">
                                <div className="flex items-center space-x-4 bg-gradient-to-r from-blue-50/50 to-purple-50/30 rounded-2xl p-3 border border-blue-100/50" data-tour={index === 0 ? "schedule-selector" : undefined}>
                                  <label className="text-sm font-medium text-gray-700">⏰ Schedule:</label>
                                  <select
                                    value={config.schedule}
                                    onChange={(e) => updateSchedule(config.id, e.target.value)}
                                    className="px-4 py-2 bg-white backdrop-blur border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm hover:border-blue-300 cursor-pointer"
                                  >
                                    {SCHEDULE_OPTIONS.map(option => (
                                      <option key={option.value} value={option.value} className="text-gray-900 font-medium bg-white py-2">
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                
                                {/* Next Run Indicator */}
                                {config.nextRun && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl font-semibold">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      Scheduled
                                    </div>
                                    <span className="text-gray-600">
                                      Next run: {new Date(config.nextRun).toLocaleString()}
                                    </span>
                                  </div>
                                )}
                                {config.lastRun && (
                                  <div className="text-xs text-gray-500">
                                    Last run: {new Date(config.lastRun).toLocaleString()}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => runTest(config.id)}
                          disabled={loading}
                          className="ml-6 relative bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center gap-2"
                        >
                          {runningTestId === config.id ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Running...
                            </>
                          ) : (
                            'Run Now'
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Test Results Tab */}
            {activeTab === 'results' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Recent Test Results
                  </h2>
                </div>
                
                {testResults.length === 0 ? (
                  <div className="relative bg-gradient-to-br from-slate-50 to-blue-50/30 backdrop-blur rounded-3xl p-16 text-center border border-gray-200/50 shadow-xl">
                    <div className="text-6xl mb-4">🧪</div>
                    <p className="text-gray-600 text-lg">No test results yet. Run your first test to see results here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {testResults.map((result) => {
                      const isExpanded = expandedResults.has(result.id);
                      const hasFailed = result.status === 'failed';
                      
                      return (
                        <div
                          key={result.id}
                          className={`group relative backdrop-blur-xl rounded-2xl shadow-lg border transition-all duration-300 cursor-pointer ${
                            result.status === 'passed'
                              ? 'border-emerald-200/50 bg-white/80 hover:border-emerald-300'
                              : 'border-red-200/50 bg-white/80 hover:border-red-300'
                          }`}
                        >
                          {/* Main Result Row */}
                          <div className="p-5" onClick={() => toggleResultExpanded(result.id)}>
                            <div className="flex items-center justify-between">
                              {/* Left: Test Info */}
                              <div className="flex items-center gap-4 flex-1">
                                {/* Status Icon */}
                                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                                  result.status === 'passed'
                                    ? 'bg-gradient-to-br from-emerald-500 to-green-500'
                                    : 'bg-gradient-to-br from-red-500 to-rose-500'
                                } shadow-lg`}>
                                  <span className="text-white text-xl font-bold">
                                    {result.status === 'passed' ? '✓' : '✗'}
                                  </span>
                                </div>

                                {/* Test Details */}
                                <div className="flex-1">
                                  <h3 className="font-bold text-gray-900 text-base">
                                    {TEST_DEFINITIONS[result.testType].name}
                                  </h3>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-gray-500 font-medium">
                                      {new Date(result.startTime).toLocaleString()}
                                    </span>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-600 font-semibold">
                                      ⏱ {result.duration ? (result.duration / 1000).toFixed(2) : 0}s
                                    </span>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-600 font-semibold">
                                      {result.steps.length} step{result.steps.length !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Right: Status Badge & Expand Button */}
                              <div className="flex items-center gap-3">
                                <span
                                  className={`px-4 py-2 rounded-xl text-xs font-bold ${
                                    result.status === 'passed'
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {result.status === 'passed' ? 'PASSED' : 'FAILED'}
                                </span>

                                {/* Expand Button (show for all tests) */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleResultExpanded(result.id);
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                                >
                                  {isExpanded ? 'Hide' : 'Show'} Details
                                  <svg
                                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Expandable Details (for all tests) */}
                          {isExpanded && (
                            <div className={`border-t border-gray-200 p-5 ${
                              hasFailed 
                                ? 'bg-gradient-to-br from-red-50/50 to-rose-50/30' 
                                : 'bg-gradient-to-br from-emerald-50/50 to-green-50/30'
                            }`}>
                              {/* Main Error (for failed tests) */}
                              {hasFailed && result.error && (
                                <div className="bg-red-100/80 backdrop-blur border border-red-200 rounded-xl p-4 mb-4">
                                  <p className="text-xs text-red-900 font-bold mb-2 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    Error Message:
                                  </p>
                                  <p className="text-sm text-red-800 font-mono">{result.error}</p>
                                </div>
                              )}

                              {/* Test Summary (for passed tests) */}
                              {!hasFailed && result.metadata && (
                                <div className="bg-emerald-100/80 backdrop-blur border border-emerald-200 rounded-xl p-4 mb-4">
                                  <p className="text-xs text-emerald-900 font-bold mb-2 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Test Summary:
                                  </p>
                                  <div className="text-sm text-emerald-800 space-y-1">
                                    {result.metadata.testMode && (
                                      <p><span className="font-semibold">Mode:</span> {result.metadata.testMode}</p>
                                    )}
                                    {result.metadata.productName && (
                                      <p><span className="font-semibold">Product:</span> {result.metadata.productName}</p>
                                    )}
                                    {result.metadata.orderId && (
                                      <p><span className="font-semibold">Order ID:</span> {result.metadata.orderId}</p>
                                    )}
                                    {result.metadata.note && (
                                      <p className="text-xs mt-2 text-emerald-700 italic">{result.metadata.note}</p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Failed Steps (for failed tests only) */}
                              {hasFailed && result.steps.filter(step => step.status === 'failed').length > 0 && (
                                <div className="space-y-2 mb-4">
                                  <p className="text-xs font-bold text-gray-700 mb-3">Failed Steps:</p>
                                  {result.steps.filter(step => step.status === 'failed').map((step, idx) => (
                                    <div key={idx} className="bg-white/80 backdrop-blur border border-red-200/50 rounded-xl p-4">
                                      <div className="flex items-start gap-3">
                                        <span className="text-red-600 text-lg font-bold">✗</span>
                                        <div className="flex-1">
                                          <p className="text-sm font-semibold text-gray-900">{step.name}</p>
                                          {step.error && (
                                            <p className="text-xs text-red-700 mt-2 font-mono bg-red-50 p-2 rounded">{step.error}</p>
                                          )}
                                          {step.details && (
                                            <details className="mt-2">
                                              <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900 font-semibold">
                                                View Technical Details
                                              </summary>
                                              <pre className="text-xs text-gray-700 mt-2 bg-gray-50 p-3 rounded overflow-x-auto font-mono">
                                                {step.details}
                                              </pre>
                                            </details>
                                          )}
                                        </div>
                                        <span className="text-xs text-gray-500 font-semibold">
                                          {(step.duration / 1000).toFixed(2)}s
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* All Steps - Always visible */}
                              <div className="space-y-2">
                                <p className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                  All Steps ({result.steps.length})
                                </p>
                                {result.steps.map((step, idx) => (
                                  <div key={idx} className="bg-white/80 backdrop-blur border border-gray-100 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                      <span className={`text-lg font-bold ${step.status === 'passed' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {step.status === 'passed' ? '✓' : '✗'}
                                      </span>
                                      <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-900">{step.name}</p>
                                        {step.details && (
                                          <details className="mt-2">
                                            <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900 font-semibold">
                                              View Step Details
                                            </summary>
                                            <pre className="text-xs text-gray-700 mt-2 bg-gray-50 p-3 rounded overflow-x-auto font-mono">
                                              {step.details}
                                            </pre>
                                          </details>
                                        )}
                                      </div>
                                      <span className="text-xs text-gray-500 font-semibold">
                                        {(step.duration / 1000).toFixed(2)}s
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Metadata - Always visible if present */}
                              {result.metadata && Object.keys(result.metadata).length > 0 && (
                                <details className="mt-4">
                                  <summary className="text-xs font-semibold text-gray-700 cursor-pointer hover:text-gray-900 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Technical Metadata
                                  </summary>
                                  <pre className="mt-3 text-xs text-gray-700 bg-gray-50 p-3 rounded overflow-x-auto font-mono">
                                    {JSON.stringify(result.metadata, null, 2)}
                                  </pre>
                                </details>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && analytics && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Analytics & Insights
                </h2>

                {/* Last 7 Days Chart */}
                <div className="relative bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl pointer-events-none"></div>
                  <div className="relative">
                    <h3 className="font-bold text-gray-900 mb-6 text-xl">📊 Last 7 Days</h3>
                    <div className="h-72 flex items-end justify-between gap-3 bg-gradient-to-t from-slate-50/50 to-transparent rounded-2xl p-4">
                      {analytics.lastSevenDays.map((day, i) => {
                        const total = day.passed + day.failed;
                        const maxHeight = Math.max(...analytics.lastSevenDays.map(d => d.passed + d.failed));
                        const height = maxHeight > 0 ? (total / maxHeight) * 100 : 0;
                        
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center group">
                            <div className="w-full flex flex-col-reverse gap-1" style={{ height: '220px' }}>
                              {day.passed > 0 && (
                                <div
                                  className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-xl shadow-lg group-hover:shadow-emerald-500/50 transition-all duration-300 relative"
                                  style={{ height: `${(day.passed / Math.max(total, 1)) * height}%` }}
                                  title={`Passed: ${day.passed}`}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 rounded-t-xl"></div>
                                </div>
                              )}
                              {day.failed > 0 && (
                                <div
                                  className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t-xl shadow-lg group-hover:shadow-red-500/50 transition-all duration-300 relative"
                                  style={{ height: `${(day.failed / Math.max(total, 1)) * height}%` }}
                                  title={`Failed: ${day.failed}`}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 rounded-t-xl"></div>
                                </div>
                              )}
                            </div>
                            <div className="mt-3 text-xs font-semibold text-gray-600 text-center bg-white/60 backdrop-blur px-2 py-1 rounded-lg">
                              {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-center gap-8 mt-6">
                      <div className="flex items-center gap-3 bg-white/60 backdrop-blur px-4 py-2 rounded-xl shadow-sm">
                        <div className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-lg shadow-sm"></div>
                        <span className="text-sm font-semibold text-gray-700">Passed</span>
                      </div>
                      <div className="flex items-center gap-3 bg-white/60 backdrop-blur px-4 py-2 rounded-xl shadow-sm">
                        <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-red-400 rounded-lg shadow-sm"></div>
                        <span className="text-sm font-semibold text-gray-700">Failed</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* By Test Type */}
                <div className="relative bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl pointer-events-none"></div>
                  <div className="relative">
                    <h3 className="font-bold text-gray-900 mb-6 text-xl">🎯 Success Rate by Test Type</h3>
                    <div className="space-y-6">
                      {analytics.byTestType.map((item) => (
                        <div key={item.testType} className="group">
                          <div className="flex justify-between text-sm mb-3">
                            <span className="text-gray-800 font-semibold">{TEST_DEFINITIONS[item.testType].name}</span>
                            <span className="text-gray-700 font-bold bg-white/60 backdrop-blur px-3 py-1 rounded-lg shadow-sm">
                              {item.successRate.toFixed(1)}% <span className="text-gray-500 font-normal">({item.totalRuns} runs)</span>
                            </span>
                          </div>
                          <div className="relative w-full bg-gradient-to-r from-gray-200 to-gray-100 rounded-2xl h-4 shadow-inner overflow-hidden">
                            <div
                              className={`h-4 rounded-2xl transition-all duration-500 relative overflow-hidden shadow-lg ${
                                item.successRate >= 90 
                                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-emerald-500/50' 
                                  : item.successRate >= 70 
                                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-amber-500/50' 
                                  : 'bg-gradient-to-r from-red-600 to-red-400 shadow-red-500/50'
                              }`}
                              style={{ width: `${item.successRate}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dev Mode Notice */}
        {!companyId && (
          <div className="mt-8 relative bg-gradient-to-r from-amber-50/80 to-yellow-50/80 backdrop-blur-xl border border-amber-200/50 rounded-3xl p-6 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent rounded-3xl pointer-events-none"></div>
            <div className="relative flex items-start gap-4">
              <div className="text-3xl">⚠️</div>
              <div>
                <p className="text-sm text-amber-900 font-semibold">
                  <strong className="text-base">Development Mode</strong>
                </p>
                <p className="text-sm text-amber-800 mt-1">
                  No company ID detected. In production, Fluid will append the company context to the URL.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {editingTest && (
          <TestSettingsModal
            test={editingTest}
            companyId={companyId}
            authToken={authToken}
            onClose={() => setEditingTest(null)}
            onSave={(settings) => {
              updateTestSettings(editingTest.id, settings);
              setEditingTest(null);
            }}
          />
        )}

        {/* Onboarding Tour */}
        {showTour && (
          <OnboardingTour
            onComplete={handleTourComplete}
            onSkip={handleTourSkip}
            onStepChange={handleTourStepChange}
          />
        )}
      </div>
    </div>
  );
}
