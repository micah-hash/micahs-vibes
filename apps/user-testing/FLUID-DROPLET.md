# Fluid Droplet Setup Guide

This app is ready to be registered as a [Fluid Droplet](https://docs.fluid.app/docs/guides/creating-and-using-droplets).

## 🎯 What You Have

### ✅ `/user-testing` Route
- **Location**: `src/app/user-testing/page.tsx`
- **Purpose**: Main dashboard that will be embedded in Fluid's iframe
- **Features**:
  - Extracts company context from URL parameters
  - Stores authentication token in sessionStorage
  - Full user testing dashboard with Sessions, Feedback, and Analytics tabs
  - Mock data for demonstration

### ✅ Fluid API Integration
- **Location**: `src/lib/fluid-api.ts`
- **Purpose**: Client for making authenticated API calls to Fluid
- **Includes**:
  - `FluidApiClient` class with authentication handling
  - Helper methods for common endpoints (orders, customers, company info)
  - Token storage and retrieval utilities

### ✅ Landing Page
- **Location**: `src/app/page.tsx`
- **Purpose**: Shows droplet features and documentation
- **Includes**: Link to view the embed dashboard locally

## 📋 Registering as a Droplet

### Prerequisites

1. **Fluid Account** with API access
2. **Bearer Token** for authentication
3. **Hosted URL** where your app is publicly accessible (e.g., Vercel, Netlify)

### Step 1: Deploy Your App

Deploy to a hosting provider:

```bash
# Build the app
pnpm build

# Deploy to Vercel (example)
vercel --prod
```

Your embed URL will be: `https://your-domain.com/user-testing`

### Step 2: Create the Droplet

Use this curl command (replace placeholders):

```bash
curl -X POST https://YOUR-COMPANY.fluid.app/api/droplets \
  -H 'Authorization: Bearer YOUR_FLUID_API_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "droplet": {
      "name": "User Testing Tool",
      "embed_url": "https://your-deployed-domain.com/user-testing",
      "active": true,
      "settings": {
        "marketplace_page": {
          "title": "User Testing Tool",
          "summary": "Comprehensive user testing and feedback platform for your products",
          "logo_url": "https://your-domain.com/logo.svg"
        },
        "details_page": {
          "title": "User Testing Tool",
          "summary": "Track user sessions, collect feedback, and analyze behavior patterns in real-time",
          "logo_url": "https://your-domain.com/big-logo.svg",
          "features": [
            {
              "name": "Session Recording",
              "summary": "Record and replay user sessions",
              "details": "Track every user interaction with detailed session recording capabilities. Review sessions to identify pain points and optimize user experience.",
              "image_url": "https://your-domain.com/feature-sessions.png"
            },
            {
              "name": "Feedback Collection",
              "summary": "Gather ratings and comments",
              "details": "Collect user feedback with ratings, comments, and structured surveys. Understand what users love and what needs improvement.",
              "image_url": "https://your-domain.com/feature-feedback.png"
            },
            {
              "name": "Analytics Dashboard",
              "summary": "Visualize trends and metrics",
              "details": "Real-time analytics dashboard showing session trends, completion rates, and key metrics to drive product decisions.",
              "image_url": "https://your-domain.com/feature-analytics.png"
            }
          ]
        },
        "service_operational_countries": ["US", "CA", "UK", "AU"]
      },
      "categories": ["testing", "analytics", "feedback"]
    }
  }'
```

### Step 3: Update the Droplet (if needed)

```bash
curl -X PUT https://YOUR-COMPANY.fluid.app/api/droplets/DROPLET_UUID \
  -H 'Authorization: Bearer YOUR_FLUID_API_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "droplet": {
      "name": "Updated Name",
      "embed_url": "https://your-domain.com/user-testing",
      "active": true
    }
  }'
```

## 🔐 Authentication Flow

When a company installs your droplet:

1. **Fluid creates** a `DropletInstallation` with an authentication token (prefix: `cdrtkn`)
2. **Fluid loads** your `/user-testing` URL in an iframe with company context:
   - `https://your-domain.com/user-testing?company_id=123&token=cdrtkn_abc123`
3. **Your app**:
   - Extracts the company ID and token from URL params
   - Stores the token in sessionStorage
   - Uses the token to make authenticated API calls to Fluid

## 🧪 Testing Locally

### Test the Embed Route

Visit: `http://localhost:3001/user-testing`

To simulate Fluid's iframe loading:
```
http://localhost:3001/user-testing?company_id=test-company&token=test-token
```

### Test with Company Context

The embed page will:
- Display the company ID if provided
- Show a development mode notice if no company ID is detected
- Store any provided token for API calls

## 🔗 Using the Fluid API

Example of using the Fluid API client:

```typescript
import { createFluidClient } from '@/lib/fluid-api';

// In your component
const client = createFluidClient('your-company');
if (client) {
  const orders = await client.getOrders({ page: 1, per_page: 20 });
  const customers = await client.getCustomers();
  const companyInfo = await client.getCompanyInfo();
}
```

## 📚 Resources

- [Fluid Droplet Documentation](https://docs.fluid.app/docs/guides/creating-and-using-droplets)
- [Fluid API Reference](https://docs.fluid.app/docs/apis/swagger/droplets)
- [Authentication Guide](https://docs.fluid.app/docs/guides/creating-and-using-droplets#authenticating-as-a-company-using-a-droplet)

## 🚀 Next Steps

1. **Deploy** your app to production
2. **Create assets**: Logo SVG files for marketplace
3. **Register** the droplet using the curl command above
4. **Wait for approval** from Fluid team
5. **Test** with a real company installation
6. **Integrate** actual Fluid API calls to replace mock data

## 📝 Notes

- Droplets must be **approved by Fluid** before appearing in the marketplace
- The authentication token begins with prefix `cdrtkn`
- All API calls should use the format: `Authorization: Bearer cdrtkn_...`
- The embed URL will be loaded in an iframe, so ensure your app works in that context


