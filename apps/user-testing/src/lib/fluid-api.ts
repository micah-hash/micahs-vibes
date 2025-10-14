/**
 * Fluid API Integration Utilities
 * 
 * Authentication uses company droplet tokens (prefix: cdrtkn)
 * These tokens are provided when a company installs the droplet
 */

export interface FluidApiConfig {
  companySubdomain: string;
  authToken: string;
}

export class FluidApiClient {
  private companySubdomain: string;
  private authToken: string;

  constructor(config: FluidApiConfig) {
    this.companySubdomain = config.companySubdomain;
    this.authToken = config.authToken;
  }

  private async request<T>(endpoint: string, apiVersion: 'v1' | 'base' | 'enrollment' | 'public' = 'v1', options: RequestInit = {}): Promise<T> {
    // Build the correct base URL depending on the API version
    let baseUrl: string;
    if (apiVersion === 'v1') {
      baseUrl = `https://${this.companySubdomain}.fluid.app/api/company/v1`;
    } else if (apiVersion === 'enrollment') {
      // Enrollment packs use api.fluid.app (not subdomain)
      baseUrl = `https://api.fluid.app/api`;
    } else if (apiVersion === 'public') {
      // Public SDK API for commerce operations - uses company subdomain!
      baseUrl = `https://${this.companySubdomain}.fluid.app/api/public/v2025-06`;
    } else {
      baseUrl = `https://${this.companySubdomain}.fluid.app/api`;
    }
    
    const url = `${baseUrl}${endpoint}`;
    
    console.log(`🌐 Fluid API Request: ${url}`);
    console.log(`🔑 API Version: ${apiVersion}`);
    
    // Start with base headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Only add Authorization for non-public endpoints
    if (apiVersion !== 'public') {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    // Merge with any custom headers from options (custom headers take precedence)
    const customHeaders = options.headers as Record<string, string> | undefined;
    const finalHeaders = {
      ...headers,
      ...(customHeaders || {}),
    };
    
    console.log(`📋 Request headers:`, Object.keys(finalHeaders));
    
    const response = await fetch(url, {
      ...options,
      headers: finalHeaders,
    });

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Fluid API Error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Fluid API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const jsonResponse = await response.json();
    console.log(`📦 Response data:`, jsonResponse);
    return jsonResponse;
  }

  /**
   * Example: Fetch company information
   */
  async getCompanyInfo() {
    return this.request('/company');
  }

  /**
   * Example: Fetch orders for the company
   */
  async getOrders(params?: { page?: number; per_page?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.per_page) queryParams.set('per_page', params.per_page.toString());
    
    const query = queryParams.toString();
    return this.request(`/orders${query ? `?${query}` : ''}`);
  }

  /**
   * Example: Fetch customers for the company
   */
  async getCustomers(params?: { page?: number; per_page?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.per_page) queryParams.set('per_page', params.per_page.toString());
    
    const query = queryParams.toString();
    return this.request(`/customers${query ? `?${query}` : ''}`);
  }

  /**
   * Fetch products
   */
  async getProducts(params?: { page?: number; per_page?: number; type?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.per_page) queryParams.set('per_page', params.per_page.toString());
    if (params?.type) queryParams.set('type', params.type);
    
    const query = queryParams.toString();
    return this.request(`/products${query ? `?${query}` : ''}`);
  }

  /**
   * Fetch enrollment packs
   * Uses api.fluid.app (not subdomain.fluid.app)
   */
  async getEnrollmentPacks(params?: { page?: number; per_page?: number; status?: string; search_query?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.set('page', params.page.toString());
    if (params?.per_page) queryParams.set('per_page', params.per_page.toString());
    if (params?.status) queryParams.set('status', params.status);
    if (params?.search_query) queryParams.set('search_query', params.search_query);
    
    const query = queryParams.toString();
    // Use 'enrollment' API version to call api.fluid.app
    return this.request(`/enrollment_packs${query ? `?${query}` : ''}`, 'enrollment');
  }

  /**
   * Create a session to get a cart token
   * POST https://{company}.fluid.app/api/public/v2025-06/session
   * 
   * Company context is in the subdomain URL
   */
  async createSession() {
    console.log(`🎫 Creating session for company: ${this.companySubdomain}`);
    
    if (!this.companySubdomain) {
      throw new Error('Company subdomain is required to create a session');
    }
    
    console.log(`📤 Sending session request to: https://${this.companySubdomain}.fluid.app/api/public/v2025-06/session`);
    
    // Company context is in the URL subdomain, so we just need an empty POST
    const result = await this.request('/session', 'public', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    
    console.log(`✅ Session created:`, result);
    return result;
  }

  /**
   * Add product to cart using Fluid Public API
   * POST /api/public/v2025-06/commerce/carts/{cart_token}/items
   */
  async addToCart(cartToken: string, data: { product_id: string; quantity?: number; variant_id?: string }) {
    console.log(`🛒 Adding to cart with token: ${cartToken}`);
    console.log(`📦 Product data:`, data);
    
    return this.request(`/commerce/carts/${cartToken}/items`, 'public', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        quantity: data.quantity || 1,
      }),
    });
  }

  /**
   * Get cart information
   * GET /api/public/v2025-06/commerce/carts/{cart_token}/cart_info
   */
  async getCartInfo(cartToken: string) {
    return this.request(`/commerce/carts/${cartToken}/cart_info`, 'public');
  }

  /**
   * Complete checkout using Fluid Public API
   * POST /api/public/v2025-06/commerce/carts/{cart_token}/checkout
   */
  async processCheckout(cartToken: string, data: any) {
    return this.request(`/commerce/carts/${cartToken}/checkout`, 'public', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Initiate refund
   * Note: This might not be a real Fluid API endpoint. Using simulated response for testing.
   */
  async initiateRefund(data: any) {
    console.log('⚠️  initiateRefund: Using simulated response (endpoint may not exist in Fluid API)');
    
    // Simulate refund initiation with delay
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 200));
    
    // Return simulated refund response
    return {
      id: `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderId: data.orderId,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Process refund
   * Note: This might not be a real Fluid API endpoint. Using simulated response for testing.
   */
  async processRefund(data: any) {
    console.log('⚠️  processRefund: Using simulated response (endpoint may not exist in Fluid API)');
    
    // Simulate refund processing with delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 300));
    
    // Return simulated processing response
    return {
      id: data.refundId,
      status: 'processing',
      processed_at: new Date().toISOString(),
    };
  }

  /**
   * Get refund details
   * Note: This might not be a real Fluid API endpoint. Using simulated response for testing.
   */
  async getRefundDetails(data: any) {
    console.log('⚠️  getRefundDetails: Using simulated response (endpoint may not exist in Fluid API)');
    
    // Simulate fetching refund details with delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 150));
    
    // Return simulated refund details with completed status
    return {
      id: data.refundId,
      status: 'completed',
      completed_at: new Date().toISOString(),
    };
  }

  /**
   * Register customer
   * Note: This might not be a real Fluid API endpoint. Using simulated response for testing.
   */
  async registerCustomer(data: any) {
    console.log('⚠️  registerCustomer: Using simulated response (endpoint may not exist in Fluid API)');
    
    // Simulate customer registration with delay
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 250));
    
    // Return simulated customer response
    return {
      id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Customer login
   * Note: This might not be a real Fluid API endpoint. Using simulated response for testing.
   */
  async loginCustomer(data: any) {
    console.log('⚠️  loginCustomer: Using simulated response (endpoint may not exist in Fluid API)');
    
    // Simulate login with delay
    await new Promise(resolve => setTimeout(resolve, 350 + Math.random() * 200));
    
    // Return simulated auth token
    return {
      token: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: data.email,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  /**
   * Get customer profile
   * Note: This might not be a real Fluid API endpoint. Using simulated response for testing.
   */
  async getCustomerProfile(token: string) {
    console.log('⚠️  getCustomerProfile: Using simulated response (endpoint may not exist in Fluid API)');
    
    // Simulate profile fetch with delay
    await new Promise(resolve => setTimeout(resolve, 250 + Math.random() * 150));
    
    // Extract customer ID from token (for consistency in testing)
    const custId = token.includes('_') ? token.split('_')[1] : Date.now().toString();
    
    // Return simulated profile
    return {
      id: `cust_${custId}`,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Customer logout
   * Note: This might not be a real Fluid API endpoint. Using simulated response for testing.
   */
  async logoutCustomer(token: string) {
    console.log('⚠️  logoutCustomer: Using simulated response (endpoint may not exist in Fluid API)');
    
    // Simulate logout with delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 100));
    
    // Return success response
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}

/**
 * Helper to create a client from stored auth token
 */
export function createFluidClient(companySubdomain: string): FluidApiClient | null {
  if (typeof window === 'undefined') return null;
  
  const authToken = sessionStorage.getItem('fluid_auth_token');
  if (!authToken) return null;

  return new FluidApiClient({
    companySubdomain,
    authToken,
  });
}


