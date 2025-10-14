# Fluid Checkout Started Event Integration

## Overview

This document describes the integration of Fluid's checkout started event tracking API into the automated testing system. This event is used for analytics to track when customers begin the checkout process.

## API Endpoint

**Endpoint**: `POST /api/public/v2025-06/events/checkout/started`

**Documentation**: https://docs.fluid.app/docs/apis/public/checkout

## What Was Implemented

### 1. New API Method: `recordCheckoutStarted()`

**Location**: `src/lib/fluid-api.ts`

```typescript
async recordCheckoutStarted(cartToken: string, metadata: {
  fluid_shop: string;
  fluid_session: string;
  fluid_locale?: string;
  fluid_journey?: string;
  attribution?: {
    email?: string;
    username?: string;
    shared_guid?: string;
    fluid_rep_id?: string;
    external_id?: string;
  };
})
```

**Purpose**: Records an analytics event when a checkout begins.

**Request Body**:
- `cart_token` (required): The shopping cart token
- `metadata` (required):
  - `fluid_shop` (required): Company subdomain
  - `fluid_session` (required): Session ID (format: `fs_...`)
  - `fluid_locale` (optional): Locale code (e.g., `en_US`)
  - `fluid_journey` (optional): Customer journey identifier
  - `attribution` (optional): Attribution information

**Response** (201 Created):
```json
{
  "status": 201,
  "metadata": {
    "fluid_shop": "company",
    "fluid_session": "fs_...",
    "fluid_locale": "en_US",
    "request_uuid": "uuid",
    "timestamp": "2025-01-01T00:00:00Z"
  }
}
```

### 2. Enhanced Session Creation

**Location**: `src/lib/fluid-api.ts`

Updated `createSession()` method to:
- Extract and log both `cart_token` and `fluid_session` from the session response
- Support multiple possible field names for flexibility
- Return the complete session object with all fields

### 3. Integrated into Test Flows

**Location**: `src/lib/test-runner.ts`

The checkout started event is now integrated into **all three purchase test flows**:

#### Product Purchase Test Flow
1. Create shopping session (extract `cart_token` and `fluid_session`)
2. Select product for testing
3. Add product to cart
4. **→ Record checkout started event** ← NEW STEP
5. Complete product purchase

#### Enrollment Purchase Test Flow
1. Create shopping session (extract `cart_token` and `fluid_session`)
2. Select enrollment product
3. Add enrollment to cart
4. **→ Record checkout started event** ← NEW STEP
5. Complete enrollment purchase

#### Subscription Purchase Test Flow
1. Create shopping session (extract `cart_token` and `fluid_session`)
2. Select subscription product
3. Add subscription to cart
4. **→ Record checkout started event** ← NEW STEP
5. Complete subscription purchase

### 4. Error Handling

The checkout started event is treated as a **non-critical step**:
- If the event recording fails, a warning is logged
- The test continues with the purchase flow
- This ensures analytics failures don't break the core purchase functionality

## Usage Example

```typescript
import { FluidApiClient } from '@/lib/fluid-api';

const client = new FluidApiClient({
  companySubdomain: 'mycompany',
  authToken: 'cdrtkn_...'
});

// Create session
const session = await client.createSession();
const cartToken = session.cart_token;
const fluidSession = session.fluid_session;

// Add items to cart
await client.addToCart(cartToken, {
  product_id: 'prod_123',
  quantity: 1
});

// Record checkout started event
await client.recordCheckoutStarted(cartToken, {
  fluid_shop: 'mycompany',
  fluid_session: fluidSession,
  fluid_locale: 'en_US'
});

// Process checkout
await client.processCheckout(cartToken, {});
```

## Testing

To test the integration:

1. **Start the user-testing app**:
   ```bash
   cd apps/user-testing
   pnpm dev
   # App runs on http://localhost:3001
   ```

2. **Run any purchase test** (all three now include checkout tracking):
   - **Product Purchase Test**
   - **Enrollment Purchase Test**
   - **Subscription Purchase Test**
   
   Configure the test in the UI and click "Run Now"

3. **Check test results**:
   - Navigate to "Test Results" tab
   - Find your completed test
   - Look for the "Record checkout started event" step (Step 4)
   - Verify it shows `eventRecorded: true` with `requestUuid` and `timestamp`
   
4. **Example successful event output**:
   ```json
   {
     "eventRecorded": true,
     "requestUuid": "a699086b-c336-457e-9191-0c825d6efbc8",
     "timestamp": "2025-10-14T12:34:56Z"
   }
   ```

## API Version Notes

- **Session creation** uses `v1`: `/api/public/v1/session`
- **Cart operations** use `v1`: `/api/public/v1/commerce/carts/...`
- **Checkout event** uses `v2025-06`: `/api/public/v2025-06/events/checkout/started`

The different API versions are handled automatically by the implementation.

## Additional Event Fields

The checkout started event supports optional attribution tracking:

```typescript
await client.recordCheckoutStarted(cartToken, {
  fluid_shop: 'mycompany',
  fluid_session: fluidSession,
  fluid_locale: 'en_US',
  fluid_journey: 'monthly-subscription',
  attribution: {
    email: 'salesrep@example.com'
    // or username, shared_guid, fluid_rep_id, external_id
  }
});
```

This allows tracking which sales representative or affiliate should be credited for the conversion.

## Future Enhancements

Potential future additions:
1. Track other events (page visits, product views, etc.)
2. Add journey tracking throughout the customer flow
3. Include attribution data from URL parameters
4. Add custom metadata for A/B testing

## Related Documentation

- [Fluid SDK API Docs](https://docs.fluid.app/docs/apis/public/checkout)
- [Test Runner Documentation](./README.md)
- [Fluid API Integration](./SETUP-GUIDE.md)

