'use client';

import { useState, useEffect } from 'react';
import { TestConfig, FluidProduct, TestType } from '@/types/test-config';

interface TestSettingsModalProps {
  test: TestConfig;
  companyId: string | null;
  authToken: string | null;
  onClose: () => void;
  onSave: (settings: TestConfig['settings']) => void;
}

export default function TestSettingsModal({ 
  test, 
  companyId, 
  authToken,
  onClose, 
  onSave 
}: TestSettingsModalProps) {
  // Debug: Log what test we're opening
  console.log('🔧 TestSettingsModal opened for test:', test.id, test.name);
  console.log('📋 Test object:', test);
  
  const [products, setProducts] = useState<FluidProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    getInitialSelectedProducts()
  );
  const [subscriptionIntervals, setSubscriptionIntervals] = useState<Record<string, string>>(
    test.settings?.subscriptionIntervals || {}
  );
  const [searchTerm, setSearchTerm] = useState('');

  function getInitialSelectedProducts(): string[] {
    switch (test.id) {
      case 'product-purchase':
        return test.settings?.selectedProductIds || [];
      case 'enrollment-purchase':
        return test.settings?.selectedEnrollmentProductIds || [];
      case 'subscription-purchase':
        return test.settings?.selectedSubscriptionProductIds || [];
      default:
        return [];
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    if (!companyId || !authToken) {
      console.log('No companyId or authToken, skipping load');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const productType = getProductType(test.id);
      const isEnrollment = test.id === 'enrollment-purchase';
      
      console.log('=== LOAD PRODUCTS START ===');
      console.log('test.id:', test.id);
      console.log('test.id === "enrollment-purchase":', test.id === 'enrollment-purchase');
      console.log('isEnrollment:', isEnrollment);
      console.log('productType:', productType);
      console.log(`Loading ${isEnrollment ? 'enrollments' : 'products'} for test: ${test.id}`);
      
      const requestBody = {
        companySubdomain: companyId,
        authToken,
        type: productType,
        productType: productType,
      };
      console.log('Request body:', requestBody);
      
      // Use the correct endpoint based on test type
      const endpoint = isEnrollment ? '/api/fluid/enrollments' : '/api/fluid/products';
      console.log(`🎯 Calling endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        
        // Handle different response formats
        const items = data.enrollments || data.enrollment_packs || data.products || [];
        console.log(`Loaded ${items.length} items`);
        setProducts(items);
      } else {
        const errorText = await response.text();
        console.error('API error response:', errorText);
      }
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductType = (testType: TestType): string | undefined => {
    switch (testType) {
      case 'enrollment-purchase':
        return 'enrollment';
      case 'subscription-purchase':
        return 'subscription';
      default:
        return undefined;
    }
  };

  const toggleProduct = (productId: string, product: FluidProduct) => {
    setSelectedProductIds(prev => {
      const isCurrentlySelected = prev.includes(productId);
      
      if (isCurrentlySelected) {
        // Remove product
        // Also remove subscription interval if it's a subscription test
        if (test.id === 'subscription-purchase') {
          const newIntervals = { ...subscriptionIntervals };
          delete newIntervals[productId];
          setSubscriptionIntervals(newIntervals);
        }
        return prev.filter(id => id !== productId);
      } else {
        // Add product
        // Set default subscription interval if it's a subscription test
        if (test.id === 'subscription-purchase' && product.subscription?.default_interval) {
          setSubscriptionIntervals(prev => ({
            ...prev,
            [productId]: product.subscription!.default_interval!
          }));
        }
        return [...prev, productId];
      }
    });
  };

  const updateSubscriptionInterval = (productId: string, interval: string) => {
    setSubscriptionIntervals(prev => ({
      ...prev,
      [productId]: interval
    }));
  };

  const handleSave = () => {
    let settings = { ...test.settings };

    // Save based on test type
    switch (test.id) {
      case 'product-purchase':
        settings.selectedProductIds = selectedProductIds;
        break;
      case 'enrollment-purchase':
        settings.selectedEnrollmentProductIds = selectedProductIds;
        break;
      case 'subscription-purchase':
        settings.selectedSubscriptionProductIds = selectedProductIds;
        settings.subscriptionIntervals = subscriptionIntervals;
        break;
    }

    onSave(settings);
    onClose();
  };

  const filteredProducts = products.filter(product =>
    (product.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (product.sku?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 max-w-3xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur p-6 border-b border-gray-200/50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
          <div className="relative flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {test.name} Settings
              </h2>
              <p className="text-gray-600 mt-1">Configure which products to test</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
          {/* Info Banner for Subscription Tests */}
          {test.id === 'subscription-purchase' && !loading && products.length > 0 && (
            <div className="mb-6 bg-gradient-to-br from-blue-50/80 to-purple-50/60 backdrop-blur rounded-2xl p-4 border border-blue-200/50">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    Subscription Configuration
                  </p>
                  <p className="text-xs text-blue-800">
                    Select products with configured subscription intervals. If a product doesn't show intervals, you'll need to configure them in Fluid first.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Search products by name or SKU..."
              className="w-full px-5 py-3 bg-white/80 backdrop-blur border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-gray-900 font-medium placeholder:text-gray-400"
            />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="text-gray-600 mt-4">Loading products from Fluid...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-3xl border border-gray-200/50 p-8">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-600 text-lg font-semibold mb-2">
                No {getProductType(test.id) || ''} products found
              </p>
              <p className="text-gray-500 text-sm mb-4">
                {test.id === 'subscription-purchase' 
                  ? 'No subscription products are available in your Fluid catalog yet.'
                  : test.id === 'enrollment-purchase'
                  ? 'No enrollment products are available in your Fluid catalog yet.'
                  : 'No products are available in your Fluid catalog yet.'
                }
              </p>
              <div className="bg-blue-50/60 backdrop-blur rounded-2xl p-4 border border-blue-200/50 max-w-md mx-auto">
                <p className="text-xs text-blue-900 font-semibold mb-1">💡 What you can do:</p>
                <p className="text-xs text-blue-800">
                  Add {getProductType(test.id) || ''} products to your Fluid catalog first, then return here to configure automated tests.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  {selectedProductIds.length} of {filteredProducts.length} products selected
                </p>
                <button
                  onClick={() => setSelectedProductIds(
                    selectedProductIds.length === filteredProducts.length 
                      ? [] 
                      : filteredProducts.map(p => p.id)
                  )}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {selectedProductIds.length === filteredProducts.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {filteredProducts.map((product) => {
                const isSelected = selectedProductIds.includes(product.id);
                const isSubscriptionTest = test.id === 'subscription-purchase';
                const hasSubscriptionOptions = product.subscription?.available_intervals && product.subscription.available_intervals.length > 0;

                return (
                  <div
                    key={product.id}
                    className={`group relative bg-white/60 backdrop-blur-lg border rounded-2xl p-4 hover:shadow-lg transition-all duration-300 ${
                      isSelected
                        ? 'border-blue-400 bg-gradient-to-br from-blue-50/50 to-purple-50/30'
                        : 'border-gray-200/50 hover:border-blue-200'
                    }`}
                  >
                    <div 
                      onClick={() => toggleProduct(product.id, product)}
                      className="flex items-center gap-4 cursor-pointer"
                    >
                    {/* Checkbox */}
                    <div className="flex-shrink-0">
                      <div
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          selectedProductIds.includes(product.id)
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 border-blue-600'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {selectedProductIds.includes(product.id) && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Product Image */}
                    {product.image_url && (
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-base">{product.name || product.title || 'Unnamed Product'}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        {product.price && (
                          <span className="text-sm text-gray-700 font-semibold">
                            ${product.price}
                          </span>
                        )}
                        {product.type && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg font-medium">
                            {product.type}
                          </span>
                        )}
                      </div>
                    </div>

                      {/* Status Badge */}
                      {product.status && (
                        <div className="flex-shrink-0">
                          <span
                            className={`px-3 py-1 rounded-xl text-xs font-bold ${
                              product.status === 'active'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {product.status}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Subscription Interval Selector or Configuration Notice */}
                    {isSubscriptionTest && isSelected && (
                      <div 
                        className="mt-4 pt-4 border-t border-gray-200/50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {hasSubscriptionOptions ? (
                          // Show interval selector if configured
                          <>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              🔄 Subscription Interval
                            </label>
                            <select
                              value={subscriptionIntervals[product.id] || product.subscription!.default_interval || ''}
                              onChange={(e) => updateSubscriptionInterval(product.id, e.target.value)}
                              className="w-full px-4 py-2 bg-white/80 backdrop-blur border border-gray-200/50 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                            >
                              {product.subscription!.available_intervals!.map((interval) => (
                                <option key={interval} value={interval}>
                                  {interval.charAt(0).toUpperCase() + interval.slice(1)}
                                </option>
                              ))}
                            </select>
                            {product.subscription?.trial_days && (
                              <p className="text-xs text-gray-500 mt-2">
                                ✨ Includes {product.subscription.trial_days}-day trial
                              </p>
                            )}
                          </>
                        ) : (
                          // Show configuration notice if not configured
                          <div className="bg-gradient-to-br from-amber-50/80 to-yellow-50/60 backdrop-blur rounded-2xl p-4 border border-amber-200/50">
                            <div className="flex items-start gap-3">
                              <div className="text-2xl">⚠️</div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-amber-900 mb-1">
                                  Subscription Intervals Not Configured
                                </p>
                                <p className="text-xs text-amber-800 mb-3">
                                  This product doesn't have subscription intervals set up in Fluid yet.
                                </p>
                                <a
                                  href={`https://${companyId}.fluid.app/products/${product.id}/edit`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  Configure in Fluid
                                  <span className="text-amber-600">→</span>
                                </a>
                                <p className="text-xs text-amber-700 mt-2 bg-white/40 backdrop-blur rounded-lg p-2">
                                  <strong>Where to configure:</strong> Products → {product.name} → Subscription Settings → Available Intervals
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative bg-gradient-to-br from-slate-50 to-blue-50/30 backdrop-blur p-6 border-t border-gray-200/50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {selectedProductIds.length === 0 
                ? 'Select at least one product to test' 
                : `${selectedProductIds.length} product${selectedProductIds.length === 1 ? '' : 's'} will be tested`
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white/80 backdrop-blur border border-gray-200/50 rounded-2xl font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={selectedProductIds.length === 0}
                className="relative bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

