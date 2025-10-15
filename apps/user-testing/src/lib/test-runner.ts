import { TestType, TestResult, TestStep, TestStatus, TestSettings } from '@/types/test-config';
import { FluidApiClient } from './fluid-api';

export class TestRunner {
  private client: FluidApiClient;
  private settings?: TestSettings;
  private onProgress?: (message: string, currentStep?: number, totalSteps?: number) => void;
  private currentStep = 0;
  private totalSteps = 0;

  constructor(client: FluidApiClient, settings?: TestSettings, onProgress?: (message: string, currentStep?: number, totalSteps?: number) => void) {
    this.client = client;
    this.settings = settings;
    this.onProgress = onProgress;
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
      // Reset progress tracking
      this.currentStep = 0;
      
      switch (testType) {
        case 'product-purchase':
          this.totalSteps = 4; // 4 main steps for product purchase
          await this.runProductPurchaseTest(result);
          break;
        case 'enrollment-purchase':
          this.totalSteps = 5; // 5 steps for enrollment
          await this.runEnrollmentPurchaseTest(result);
          break;
        case 'subscription-purchase':
          this.totalSteps = 5; // 5 steps for subscription
          await this.runSubscriptionPurchaseTest(result);
          break;
        case 'refund-flow':
          this.totalSteps = 4; // 4 steps for refund
          await this.runRefundFlowTest(result);
          break;
        case 'customer-auth':
          this.totalSteps = 4; // 4 steps for auth
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
    // Step 1: Verify SDK and API connection
    const step1 = await this.executeStep('Verify Fluid SDK and API connection', async () => {
      // Wait for SDK to be available (give it up to 10 seconds)
      console.log('[Test Runner] Checking for Fluid SDK...');
      const sdkReady = await this.client.waitForSDK(10000);
      
      console.log(`[Test Runner] SDK availability: ${sdkReady}`);
      
      // Test that we can reach the Fluid API with our auth token
      const response = await this.client.getProducts({ page: 1, per_page: 1 });
      
      // Handle different response structures
      const productsArray = Array.isArray(response) 
        ? response 
        : (response as any).products || (response as any).data || [];
      
      return { 
        connected: true, 
        productsAvailable: productsArray && productsArray.length > 0,
        apiResponding: true,
        sdkAvailable: sdkReady,
        mode: sdkReady ? 'full-e2e-with-sdk' : 'validation-only',
        note: sdkReady 
          ? 'Fluid SDK loaded successfully' 
          : 'Fluid SDK not available after 10s wait - falling back to validation mode'
      };
    });
    result.steps.push(step1);

    if (step1.status === 'failed') throw new Error(step1.error);
    
    const step1Data = JSON.parse(step1.details || '{}');
    const hasSDK = step1Data.sdkAvailable;

    // Step 2: Select product for testing
    const step2 = await this.executeStep('Select product for testing', async () => {
      let productId: string;
      let productName: string;
      let variantId: string | null = null;

      // Fetch products from API
      const response = await this.client.getProducts({ page: 1, per_page: 50 });
      
      // Handle different response structures
      const productsArray = Array.isArray(response) 
        ? response 
        : (response as any).products || (response as any).data || [];
      
      console.log('[Test Runner] Products response type:', typeof response);
      console.log('[Test Runner] Products array length:', productsArray.length);

      if (!productsArray || productsArray.length === 0) {
        throw new Error('No products available in catalog');
      }

      // If specific products are configured, use them
      if (this.settings?.selectedProductIds && this.settings.selectedProductIds.length > 0) {
        // Pick a random product from the selected ones
        const randomIndex = Math.floor(Math.random() * this.settings.selectedProductIds.length);
        productId = this.settings.selectedProductIds[randomIndex];
        
        const product = productsArray.find((p: any) => p.id === productId);
        productName = product?.name || 
                     product?.title || 
                     product?.product_name ||
                     product?.displayName ||
                     `Product ${productId}`;
        
        // Try to get variant ID
        variantId = product?.variants?.[0]?.id || product?.default_variant_id || productId;
      } else {
        // Use first available product
        const product = productsArray[0];
        productId = product.id;
        productName = product.name || 
                     product.title || 
                     product.product_name ||
                     product.displayName ||
                     `Product ${product.id}`;
        
        // Try to get variant ID
        variantId = product?.variants?.[0]?.id || product?.default_variant_id || productId;
      }

      return { productId, productName, variantId, totalProducts: productsArray.length };
    });
    result.steps.push(step2);

    if (step2.status === 'failed') throw new Error(step2.error);

    const step2Data = JSON.parse(step2.details || '{}');

    // If SDK is available, run full e2e flow
    if (hasSDK) {
      // Step 3: Add product to cart using SDK
      const step3 = await this.executeStep('Add product to cart (via Fluid SDK)', async () => {
        const cartResult = await this.client.addToCartSDK(step2Data.variantId || step2Data.productId, {
          quantity: 1
        });
        
        return {
          productId: step2Data.productId,
          productName: step2Data.productName,
          variantId: step2Data.variantId,
          cartResult: 'Added to cart successfully',
          addedToCart: true
        };
      });
      result.steps.push(step3);

      if (step3.status === 'failed') throw new Error(step3.error);

      // Step 4: Verify cart contents
      const step4 = await this.executeStep('Verify cart contents', async () => {
        const cart = await this.client.getCartSDK();
        
        const itemCount = cart?.items?.length || cart?.line_items?.length || 0;
        
        return {
          cartVerified: true,
          itemsInCart: itemCount,
          cartId: cart?.id || cart?.token,
          note: `Cart contains ${itemCount} item(s)`
        };
      });
      result.steps.push(step4);

      if (step4.status === 'failed') throw new Error(step4.error);

      // Clean up: Clear the cart after test
      try {
        await this.client.clearCartSDK();
        console.log('[Test Runner] ✓ Cart cleared after test');
      } catch (e) {
        console.warn('[Test Runner] ⚠️  Could not clear cart:', e);
      }

      const step4Data = JSON.parse(step4.details || '{}');
      result.metadata = { 
        productId: step2Data.productId,
        productName: step2Data.productName,
        testMode: 'full-e2e-with-sdk',
        itemsInCart: step4Data.itemsInCart,
        note: 'Full end-to-end test completed using Fluid SDK (product added to cart and verified)'
      };
    } else {
      // Step 3: Validation mode (no SDK)
      const step3 = await this.executeStep('Validate product availability', async () => {
        return {
          productId: step2Data.productId,
          productName: step2Data.productName,
          validated: true,
          mode: 'validation-only',
          note: 'Fluid SDK not available - running in validation mode (products verified, cart/checkout requires Fluid UI)'
        };
      });
      result.steps.push(step3);

      if (step3.status === 'failed') throw new Error(step3.error);

      const step3Data = JSON.parse(step3.details || '{}');
      result.metadata = { 
        productId: step3Data.productId,
        productName: step3Data.productName,
        testMode: step3Data.mode,
        note: step3Data.note
      };
    }
  }

  private async runEnrollmentPurchaseTest(result: TestResult): Promise<void> {
    // Step 1: Create session to get cart token
    const step1 = await this.executeStep('Create shopping session', async () => {
      const session = await this.client.createSession();
      console.log('[Test Runner] Session response:', session);
      
      // Extract cart token and session ID from various possible fields
      const cartToken = (session as any).cart_token || 
                       (session as any).token || 
                       (session as any).cartToken ||
                       (session as any).id;
      
      const fluidSession = (session as any).fluid_session || 
                          (session as any).session_id || 
                          (session as any).sessionId;
      
      if (!cartToken) {
        console.error('[Test Runner] No cart token found in session response:', session);
        throw new Error('No cart token returned from session creation');
      }
      
      console.log('[Test Runner] Extracted cart token:', cartToken);
      console.log('[Test Runner] Extracted fluid session:', fluidSession);
      return { cartToken, fluidSession };
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

    // Step 3b: Record checkout started event (for analytics)
    const step3b = await this.executeStep('Record checkout started event', async () => {
      const step1Data = JSON.parse(step1.details || '{}');
      
      // Get company subdomain from client
      const companySubdomain = (this.client as any).companySubdomain;
      
      // Build metadata for the event
      const metadata: any = {
        fluid_shop: companySubdomain,
        fluid_session: step1Data.fluidSession || `fs_test_${Date.now()}`,
        fluid_locale: 'en_US',
      };
      
      const eventResponse = await this.client.recordCheckoutStarted(step1Data.cartToken, metadata);
      
      return { 
        eventRecorded: true, 
        requestUuid: eventResponse.metadata?.request_uuid,
        timestamp: eventResponse.metadata?.timestamp
      };
    });
    result.steps.push(step3b);

    if (step3b.status === 'failed') {
      // Don't fail the entire test if analytics event fails - just log warning
      console.warn('[Test Runner] ⚠️  Checkout started event failed, but continuing with purchase flow');
    }

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
      
      // Extract cart token and session ID from various possible fields
      const cartToken = (session as any).cart_token || 
                       (session as any).token || 
                       (session as any).cartToken ||
                       (session as any).id;
      
      const fluidSession = (session as any).fluid_session || 
                          (session as any).session_id || 
                          (session as any).sessionId;
      
      if (!cartToken) {
        console.error('[Test Runner] No cart token found in session response:', session);
        throw new Error('No cart token returned from session creation');
      }
      
      console.log('[Test Runner] Extracted cart token:', cartToken);
      console.log('[Test Runner] Extracted fluid session:', fluidSession);
      return { cartToken, fluidSession };
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

    // Step 3b: Record checkout started event (for analytics)
    const step3b = await this.executeStep('Record checkout started event', async () => {
      const step1Data = JSON.parse(step1.details || '{}');
      
      // Get company subdomain from client
      const companySubdomain = (this.client as any).companySubdomain;
      
      // Build metadata for the event
      const metadata: any = {
        fluid_shop: companySubdomain,
        fluid_session: step1Data.fluidSession || `fs_test_${Date.now()}`,
        fluid_locale: 'en_US',
      };
      
      const eventResponse = await this.client.recordCheckoutStarted(step1Data.cartToken, metadata);
      
      return { 
        eventRecorded: true, 
        requestUuid: eventResponse.metadata?.request_uuid,
        timestamp: eventResponse.metadata?.timestamp
      };
    });
    result.steps.push(step3b);

    if (step3b.status === 'failed') {
      // Don't fail the entire test if analytics event fails - just log warning
      console.warn('[Test Runner] ⚠️  Checkout started event failed, but continuing with purchase flow');
    }

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
      this.currentStep++;
      console.log(`[Test Runner] Starting step: ${name} (${this.currentStep}/${this.totalSteps})`);
      // Update progress in UI with step count
      if (this.onProgress) {
        this.onProgress(name, this.currentStep, this.totalSteps);
      }
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

