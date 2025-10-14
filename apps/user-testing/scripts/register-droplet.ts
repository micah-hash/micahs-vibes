#!/usr/bin/env tsx

/**
 * Script to register this app as a Fluid Droplet
 * 
 * Usage:
 *   tsx scripts/register-droplet.ts
 * 
 * Set these environment variables:
 *   FLUID_COMPANY_SUBDOMAIN - Your company subdomain (e.g., "mycompany" for mycompany.fluid.app)
 *   FLUID_API_TOKEN - Your Fluid API bearer token
 *   EMBED_URL - Your deployed app URL (e.g., "https://your-app.vercel.app/user-testing")
 */

interface DropletPayload {
  droplet: {
    name: string;
    embed_url: string;
    active: boolean;
    settings: {
      marketplace_page: {
        title: string;
        summary: string;
        logo_url: string;
      };
      details_page: {
        title: string;
        summary: string;
        logo_url: string;
        features: Array<{
          name: string;
          summary: string;
          details: string;
          image_url?: string;
          video_url?: string;
        }>;
      };
      service_operational_countries?: string[];
    };
    categories: string[];
  };
}

async function registerDroplet() {
  const companySubdomain = process.env.FLUID_COMPANY_SUBDOMAIN;
  const apiToken = process.env.FLUID_API_TOKEN;
  const embedUrl = process.env.EMBED_URL;

  if (!companySubdomain) {
    console.error('❌ Missing FLUID_COMPANY_SUBDOMAIN environment variable');
    console.log('   Set it to your company subdomain (e.g., "mycompany")');
    process.exit(1);
  }

  if (!apiToken) {
    console.error('❌ Missing FLUID_API_TOKEN environment variable');
    console.log('   Get your API token from Fluid and set it as FLUID_API_TOKEN');
    process.exit(1);
  }

  if (!embedUrl) {
    console.error('❌ Missing EMBED_URL environment variable');
    console.log('   Set it to your deployed app URL (e.g., "https://your-app.vercel.app/user-testing")');
    process.exit(1);
  }

  const payload: DropletPayload = {
    droplet: {
      name: 'User Testing Tool',
      embed_url: embedUrl,
      active: true,
      settings: {
        marketplace_page: {
          title: 'User Testing Tool',
          summary: 'Comprehensive user testing and feedback platform for your products',
          logo_url: `${embedUrl.replace('/user-testing', '')}/logo.svg`,
        },
        details_page: {
          title: 'User Testing Tool',
          summary: 'Track user sessions, collect feedback, and analyze behavior patterns in real-time',
          logo_url: `${embedUrl.replace('/user-testing', '')}/big-logo.svg`,
          features: [
            {
              name: 'Session Recording',
              summary: 'Record and replay user sessions',
              details: 'Track every user interaction with detailed session recording capabilities. Review sessions to identify pain points and optimize user experience.',
              image_url: `${embedUrl.replace('/user-testing', '')}/feature-sessions.png`,
            },
            {
              name: 'Feedback Collection',
              summary: 'Gather ratings and comments',
              details: 'Collect user feedback with ratings, comments, and structured surveys. Understand what users love and what needs improvement.',
              image_url: `${embedUrl.replace('/user-testing', '')}/feature-feedback.png`,
            },
            {
              name: 'Analytics Dashboard',
              summary: 'Visualize trends and metrics',
              details: 'Real-time analytics dashboard showing session trends, completion rates, and key metrics to drive product decisions.',
              image_url: `${embedUrl.replace('/user-testing', '')}/feature-analytics.png`,
            },
          ],
        },
        service_operational_countries: ['US', 'CA', 'UK', 'AU', 'DE', 'FR'],
      },
      categories: ['testing', 'analytics', 'feedback'],
    },
  };

  const apiUrl = `https://${companySubdomain}.fluid.app/api/droplets`;

  console.log('🚀 Registering Droplet with Fluid...');
  console.log(`   Company: ${companySubdomain}.fluid.app`);
  console.log(`   Embed URL: ${embedUrl}`);
  console.log('');

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    console.log('✅ Droplet registered successfully!');
    console.log('');
    console.log('📦 Droplet Details:');
    console.log(JSON.stringify(result, null, 2));
    console.log('');
    console.log('⏳ Next steps:');
    console.log('   1. Wait for Fluid team approval');
    console.log('   2. Your droplet will appear in the Fluid Marketplace');
    console.log('   3. Companies can install and use your droplet');
    console.log('');
    console.log('💡 Save the Droplet UUID from the response above for updates');

  } catch (error) {
    console.error('❌ Failed to register droplet:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the script
registerDroplet();


