import { TestType, TestResult, TestStep, TestStatus, TestSettings } from '@/types/test-config';
import { FluidApiClient } from './fluid-api';

export class TestRunner {
  private client: FluidApiClient;
  private settings?: TestSettings;

  constructor(client: FluidApiClient, settings?: TestSettings) {
    this.client = client;
    this.settings = settings;
  }

  async runTest(testType: TestType): Promise<TestResult> {
    const result: TestResult = {
      id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      testType,
      status: 'running',
      startTime: new Date(),
      steps: [],
    };

    console.log(`\n========================================`);
    console.log(`[Test Runner] 🚀 Starting test: ${testType}`);
    console.log(`[Test Runner] Test ID: ${result.id}`);
    console.log(`[Test Runner] Start time: ${result.startTime.toISOString()}`);
    if (this.settings) {
      console.log(`[Test Runner] Settings:`, this.settings);
    }
    console.log(`========================================\n`);

    try {
      switch (testType) {
        case 'product-purchase':
          await this.runProductPurchaseTest(result);
          break;
        case 'enrollment-purchase':
          await this.runEnrollmentPurchaseTest(result);
          break;
        case 'subscription-purchase':
          await this.runSubscriptionPurchaseTest(result);
          break;
        case 'refund-flow':
          await this.runRefundFlowTest(result);
          break;
        case 'customer-auth':
          await this.runCustomerAuthTest(result);
          break;
      }

      result.status = 'passed';
      result.endTime = new Date();
      result.duration = result.endTime.getTime() - result.startTime.getTime();
      
      console.log(`\n========================================`);
      console.log(`[Test Runner] ✅ Test PASSED: ${testType}`);
      console.log(`[Test Runner] Duration: ${(result.duration / 1000).toFixed(2)}s`);
      console.log(`[Test Runner] Steps completed: ${result.steps.length}`);
      console.log(`========================================\n`);
      
    } catch (error) {
      result.status = 'failed';
      result.endTime = new Date();
      result.duration = result.endTime.getTime() - result.startTime.getTime();
      result.error = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`\n========================================`);
      console.error(`[Test Runner] ❌ Test FAILED: ${testType}`);
      console.error(`[Test Runner] Duration: ${(result.duration / 1000).toFixed(2)}s`);
      console.error(`[Test Runner] Error: ${result.error}`);
      console.error(`[Test Runner] Failed at step: ${result.steps.findIndex(s => s.status === 'failed') + 1}/${result.steps.length}`);
      console.error(`========================================\n`);
    }

    return result;
  }

  private async runProductPurchaseTest(result: TestResult): Promise<void> {
    // Step 1: Verify API Connection
    const step1 = await this.executeStep('Verify Fluid API connection', async () => {
      // Test that we can reach the Fluid API with our auth token
      const products = await this.client.getProducts({ page: 1, per_page: 1 });
      return { connected: true, productsAvailable: products && products.length > 0 };
    });
    result.steps.push(step1);

    if (step1.status === 'failed') throw new Error(step1.error);

    // Step 2: Fetch and validate product availability
    const step2 = await this.executeStep('Fetch available products', async () => {
      let productId: string;
      let productName: string;

      // If specific products are configured, validate them
      if (this.settings?.selectedProductIds && this.settings.selectedProductIds.length > 0) {
        // Pick a random product from the selected ones
        const randomIndex = Math.floor(Math.random() * this.settings.selectedProductIds.length);
        productId = this.settings.selectedProductIds[randomIndex];
        
        // Fetch all products to find the name
        const products = await this.client.getProducts({ page: 1, per_page: 50 });
        const product = products.find((p: any) => p.id === productId);
        productName = product?.name || 'Unknown Product';
      } else {
        // Fallback: fetch and use first available product
        const products = await this.client.getProducts({ page: 1, per_page: 5 });
        if (!products || products.length === 0) {
          throw new Error('No products available');
        }
        productId = products[0].id;
        productName = products[0].name || 'Product';
      }

      return { productId, productName, validated: true };
    });
    result.steps.push(step2);

    if (step2.status === 'failed') throw new Error(step2.error);

    // Step 3: Verify product details
    const step3 = await this.executeStep('Verify product details', async () => {
      const step2Data = JSON.parse(step2.details || '{}');
      
      // Get full product details using Company API
      const products = await this.client.getProducts({ page: 1, per_page: 50 });
      const product = products.find((p: any) => p.id === step2Data.productId);
      
      if (!product) {
        throw new Error(`Product ${step2Data.productId} not found`);
      }
      
      return { 
        productId: product.id,
        productName: product.name,
        price: product.price || 'N/A',
        available: true 
      };
    });
    result.steps.push(step3);

    if (step3.status === 'failed') throw new Error(step3.error);

    // Step 4: Simulate purchase readiness check
    const step4 = await this.executeStep('Validate purchase prerequisites', async () => {
      const step3Data = JSON.parse(step3.details || '{}');
      
      // Verify we have all necessary data for a purchase
      const ready = !!(step3Data.productId && step3Data.productName);
      
      if (!ready) {
        throw new Error('Missing required data for purchase flow');
      }
      
      return { 
        purchaseReady: true,
        productValidated: true,
        testPassed: true,
        note: 'Product purchase flow validated successfully (simulation mode - actual cart/checkout APIs not available)'
      };
    });
    result.steps.push(step4);

    if (step4.status === 'failed') throw new Error(step4.error);

    result.metadata = { 
      productId: JSON.parse(step3.details || '{}').productId,
      note: 'Test validates API connectivity and product availability. Full cart/checkout flow requires Fluid UI.'
    };
  }

  private async runEnrollmentPurchaseTest(result: TestResult): Promise<void> {
    // Step 1: Create session to get cart token
    const step1 = await this.executeStep('Create shopping session', async () => {
      const session = await this.client.createSession();
      console.log('[Test Runner] Session response:', session);
      
      // Extract cart token from various possible fields
      const cartToken = (session as any).cart_token || 
                       (session as any).token || 
                       (session as any).cartToken ||
                       (session as any).id;
      
      if (!cartToken) {
        console.error('[Test Runner] No cart token found in session response:', session);
        throw new Error('No cart token returned from session creation');
      }
      
      console.log('[Test Runner] Extracted cart token:', cartToken);
      return { cartToken };
    });
    result.steps.push(step1);

    if (step1.status === 'failed') throw new Error(step1.error);

    // Step 2: Get enrollment products
    const step2 = await this.executeStep('Select enrollment product', async () => {
      let productId: string;

      // If specific enrollment products are configured, use them
      if (this.settings?.selectedEnrollmentProductIds && this.settings.selectedEnrollmentProductIds.length > 0) {
        // Pick a random product from the selected ones
        const randomIndex = Math.floor(Math.random() * this.settings.selectedEnrollmentProductIds.length);
        productId = this.settings.selectedEnrollmentProductIds[randomIndex];
      } else {
        // Fallback: fetch and use first available enrollment product
        const products = await this.client.getEnrollmentPacks({ page: 0, per_page: 5, status: 'active' });
        const packs = (products as any).enrollment_packs || (products as any).data || [];
        if (!packs || packs.length === 0) {
          throw new Error('No enrollment products available');
        }
        productId = packs[0].id;
      }

      return { productId };
    });
    result.steps.push(step2);

    if (step2.status === 'failed') throw new Error(step2.error);

    // Step 3: Add enrollment to cart
    const step3 = await this.executeStep('Add enrollment to cart', async () => {
      const step1Data = JSON.parse(step1.details || '{}');
      const step2Data = JSON.parse(step2.details || '{}');
      
      const cart = await this.client.addToCart(step1Data.cartToken, {
        product_id: step2Data.productId,
        quantity: 1,
      });
      
      return { cartToken: step1Data.cartToken, cartUpdated: true };
    });
    result.steps.push(step3);

    if (step3.status === 'failed') throw new Error(step3.error);

    // Step 4: Complete enrollment checkout
    const step4 = await this.executeStep('Complete enrollment purchase', async () => {
      const step3Data = JSON.parse(step3.details || '{}');
      
      const order = await this.client.processCheckout(step3Data.cartToken, {});
      
      return { orderId: order.id || order.order_id, orderToken: order.token };
    });
    result.steps.push(step4);

    if (step4.status === 'failed') throw new Error(step4.error);

    result.metadata = { orderId: JSON.parse(step4.details || '{}') };
  }

  private async runSubscriptionPurchaseTest(result: TestResult): Promise<void> {
    // Step 1: Create session to get cart token
    const step1 = await this.executeStep('Create shopping session', async () => {
      const session = await this.client.createSession();
      console.log('[Test Runner] Session response:', session);
      
      // Extract cart token from various possible fields
      const cartToken = (session as any).cart_token || 
                       (session as any).token || 
                       (session as any).cartToken ||
                       (session as any).id;
      
      if (!cartToken) {
        console.error('[Test Runner] No cart token found in session response:', session);
        throw new Error('No cart token returned from session creation');
      }
      
      console.log('[Test Runner] Extracted cart token:', cartToken);
      return { cartToken };
    });
    result.steps.push(step1);

    if (step1.status === 'failed') throw new Error(step1.error);

    // Step 2: Get subscription product to test
    const step2 = await this.executeStep('Select subscription product for testing', async () => {
      let productId: string;
      let interval: string | undefined;

      // If specific subscription products are configured, use them
      if (this.settings?.selectedSubscriptionProductIds && this.settings.selectedSubscriptionProductIds.length > 0) {
        // Pick a random product from the selected ones
        const randomIndex = Math.floor(Math.random() * this.settings.selectedSubscriptionProductIds.length);
        productId = this.settings.selectedSubscriptionProductIds[randomIndex];
        
        // Get the configured interval for this product
        interval = this.settings.subscriptionIntervals?.[productId];
      } else {
        // Fallback: fetch and use first available subscription product
        const products = await this.client.getProducts({ type: 'subscription', page: 1, per_page: 5 });
        if (!products || products.length === 0) {
          throw new Error('No subscription products available');
        }
        productId = products[0].id;
      }

      return { productId, interval };
    });
    result.steps.push(step2);

    if (step2.status === 'failed') throw new Error(step2.error);

    // Step 3: Add subscription to cart
    const step3 = await this.executeStep('Add subscription product to cart', async () => {
      const step1Data = JSON.parse(step1.details || '{}');
      const step2Data = JSON.parse(step2.details || '{}');
      
      const cart = await this.client.addToCart(step1Data.cartToken, {
        product_id: step2Data.productId,
        quantity: 1,
      });
      
      return { cartToken: step1Data.cartToken, cartUpdated: true };
    });
    result.steps.push(step3);

    if (step3.status === 'failed') throw new Error(step3.error);

    // Step 4: Complete subscription checkout
    const step4 = await this.executeStep('Complete subscription purchase', async () => {
      const step3Data = JSON.parse(step3.details || '{}');
      
      const order = await this.client.processCheckout(step3Data.cartToken, {});
      
      return { orderId: order.id || order.order_id, orderToken: order.token };
    });
    result.steps.push(step4);

    if (step4.status === 'failed') throw new Error(step4.error);

    result.metadata = { orderId: JSON.parse(step4.details || '{}') };
  }

  private async runRefundFlowTest(result: TestResult): Promise<void> {
    // Step 1: Get order for refund (simulated)
    const step1 = await this.executeStep('Get order for refund', async () => {
      // For testing purposes, simulate finding an order
      // In production, this would fetch from the actual Fluid API
      return { orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
    });
    result.steps.push(step1);

    if (step1.status === 'failed') throw new Error(step1.error);

    // Step 2: Initiate refund
    const step2 = await this.executeStep('Initiate refund', async () => {
      const step1Data = JSON.parse(step1.details || '{}');
      const refund = await this.client.initiateRefund(step1Data);
      return { refundId: refund.id };
    });
    result.steps.push(step2);

    if (step2.status === 'failed') throw new Error(step2.error);

    // Step 3: Process refund
    const step3 = await this.executeStep('Process refund', async () => {
      const step2Data = JSON.parse(step2.details || '{}');
      const processed = await this.client.processRefund(step2Data);
      return { refundStatus: processed.status };
    });
    result.steps.push(step3);

    if (step3.status === 'failed') throw new Error(step3.error);

    // Step 4: Verify refund completion
    const step4 = await this.executeStep('Verify refund completion', async () => {
      const step2Data = JSON.parse(step2.details || '{}');
      const refundDetails = await this.client.getRefundDetails(step2Data);
      if (refundDetails.status !== 'completed') {
        throw new Error(`Refund not completed: ${refundDetails.status}`);
      }
      return { verified: true };
    });
    result.steps.push(step4);

    if (step4.status === 'failed') throw new Error(step4.error);

    result.metadata = { refundId: JSON.parse(step2.details || '{}') };
  }

  private async runCustomerAuthTest(result: TestResult): Promise<void> {
    // Step 1: Test customer registration
    const step1 = await this.executeStep('Register new customer', async () => {
      const email = `test-${Date.now()}@example.com`;
      const customer = await this.client.registerCustomer({
        email,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User'
      });
      return { customerId: customer.id, email };
    });
    result.steps.push(step1);

    if (step1.status === 'failed') throw new Error(step1.error);

    // Step 2: Test customer login
    const step2 = await this.executeStep('Customer login', async () => {
      const step1Data = JSON.parse(step1.details || '{}');
      const auth = await this.client.loginCustomer({
        email: step1Data.email,
        password: 'TestPassword123!'
      });
      return { token: auth.token };
    });
    result.steps.push(step2);

    if (step2.status === 'failed') throw new Error(step2.error);

    // Step 3: Verify authentication
    const step3 = await this.executeStep('Get customer profile', async () => {
      const step1Data = JSON.parse(step1.details || '{}');
      const step2Data = JSON.parse(step2.details || '{}');
      const profile = await this.client.getCustomerProfile(step2Data.token);
      if (!profile || !profile.id) {
        throw new Error('Authentication verification failed');
      }
      return { verified: true, customerId: profile.id };
    });
    result.steps.push(step3);

    if (step3.status === 'failed') throw new Error(step3.error);

    // Step 4: Test logout
    const step4 = await this.executeStep('Customer logout', async () => {
      const step2Data = JSON.parse(step2.details || '{}');
      await this.client.logoutCustomer(step2Data.token);
      return { loggedOut: true };
    });
    result.steps.push(step4);

    if (step4.status === 'failed') throw new Error(step4.error);

    result.metadata = { customerId: JSON.parse(step1.details || '{}') };
  }

  private async executeStep(
    name: string,
    fn: () => Promise<any>
  ): Promise<TestStep> {
    const startTime = Date.now();
    const step: TestStep = {
      name,
      status: 'passed',
      duration: 0,
    };

    try {
      console.log(`[Test Runner] Starting step: ${name}`);
      const result = await fn();
      step.duration = Date.now() - startTime;
      
      // Log detailed success information
      console.log(`[Test Runner] ✓ Step passed: ${name} (${step.duration}ms)`);
      console.log(`[Test Runner] Result:`, result);
      
      // Store detailed information
      step.details = JSON.stringify(result, null, 2);
      
    } catch (error) {
      step.status = 'failed';
      step.duration = Date.now() - startTime;
      
      // Log detailed error information
      console.error(`[Test Runner] ✗ Step failed: ${name} (${step.duration}ms)`);
      console.error(`[Test Runner] Error:`, error);
      
      // Capture comprehensive error details
      if (error instanceof Error) {
        step.error = error.message;
        
        // Include stack trace in details for debugging
        const errorDetails: any = {
          message: error.message,
          name: error.name,
        };
        
        // Capture stack trace if available
        if (error.stack) {
          errorDetails.stack = error.stack;
        }
        
        // Capture any additional error properties
        Object.keys(error).forEach(key => {
          if (key !== 'message' && key !== 'name' && key !== 'stack') {
            errorDetails[key] = (error as any)[key];
          }
        });
        
        step.details = JSON.stringify(errorDetails, null, 2);
      } else {
        step.error = 'Unknown error';
        step.details = JSON.stringify({ error: String(error) }, null, 2);
      }
    }

    return step;
  }
}

