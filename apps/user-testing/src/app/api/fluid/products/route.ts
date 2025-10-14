import { NextRequest, NextResponse } from 'next/server';
import { FluidApiClient } from '@/lib/fluid-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companySubdomain, authToken, type, productType } = body;

    if (!companySubdomain || !authToken) {
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

    // Check if we're fetching enrollment packs
    const isEnrollmentPacks = productType === 'enrollment';
    console.log('=== API ROUTE START ===');
    console.log('isEnrollmentPacks:', isEnrollmentPacks);
    console.log('productType:', productType);
    console.log('type:', type);

    // Fetch ALL items from Fluid - loop through all pages
    let allProducts: any[] = [];
    const perPage = 100; // Request 100 per page
    const maxPages = 50; // Safety limit to prevent infinite loops

    for (let page = 0; page < maxPages; page++) {
      try {
        let response: any;
        
        if (isEnrollmentPacks) {
          console.log(`📦 Fetching ENROLLMENT PACKS - page ${page}, per_page: ${perPage}, status: active`);
          // Fetch enrollment packs (page starts at 0)
          response = await client.getEnrollmentPacks({ 
            page, 
            per_page: perPage,
            status: 'active'
          });
        } else {
          console.log(`📦 Fetching PRODUCTS - page ${page + 1}, per_page: ${perPage}, type: ${type}`);
          // Fetch regular products (page starts at 1)
          response = await client.getProducts({ 
            page: page + 1, 
            per_page: perPage,
            type 
          });
        }

        // Extract items array from response
        const respObj = response as any;
        
        // Debug: Log the response structure
        console.log(`📊 Response for page ${page}:`);
        console.log('  - Response keys:', Object.keys(respObj));
        console.log('  - respObj.enrollment_packs:', Array.isArray(respObj.enrollment_packs) ? `Array(${respObj.enrollment_packs.length})` : typeof respObj.enrollment_packs);
        console.log('  - respObj.enrollments:', Array.isArray(respObj.enrollments) ? `Array(${respObj.enrollments.length})` : typeof respObj.enrollments);
        console.log('  - respObj.packs:', Array.isArray(respObj.packs) ? `Array(${respObj.packs.length})` : typeof respObj.packs);
        console.log('  - respObj.products:', Array.isArray(respObj.products) ? `Array(${respObj.products.length})` : typeof respObj.products);
        console.log('  - respObj.data:', Array.isArray(respObj.data) ? `Array(${respObj.data.length})` : typeof respObj.data);
        
        const pageProducts = respObj.enrollment_packs || respObj.enrollments || respObj.packs || respObj.products || respObj.data || [];
        
        console.log(`✅ Page ${page}: Found ${pageProducts.length} items`);

        // Stop if no more items
        if (!pageProducts || pageProducts.length === 0) {
          console.log(`Finished: Total ${allProducts.length} items fetched`);
          break;
        }

        // Add to collection
        allProducts = [...allProducts, ...pageProducts];
        
      } catch (error) {
        console.error(`Error on page ${page}:`, error);
        break;
      }
    }

    console.log(`✓ Fetched ${allProducts.length} total ${isEnrollmentPacks ? 'enrollment packs' : 'products'} from Fluid`);

    return NextResponse.json({ 
      products: allProducts || [],
      count: allProducts?.length || 0 
    });
  } catch (error) {
    console.error('Failed to fetch items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items from Fluid' },
      { status: 500 }
    );
  }
}

