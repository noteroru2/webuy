/**
 * On-Demand Revalidation API
 * 
 * Endpoint สำหรับ WordPress webhook ยิงมาเมื่อมีการอัปเดตข้อมูล
 * จะ revalidate เฉพาะหน้าที่เปลี่ยนแปลงแทนที่จะ rebuild ทั้งหมด
 * 
 * Usage:
 * POST /api/revalidate
 * Headers: Authorization: Bearer YOUR_SECRET_TOKEN
 * Body: { type: "service", slug: "buy-notebook-ubon-ratchathani" }
 * 
 * Supported types: service, location, price, category
 */

import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || 'change-me-in-production';

interface RevalidateRequest {
  type: 'service' | 'location' | 'price' | 'category' | 'all';
  slug?: string;
  secret?: string; // Deprecated: ใช้ Authorization header แทน
}

export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบ Authentication
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    const body: RevalidateRequest = await request.json();
    const secret = token || body.secret;
    
    if (secret !== REVALIDATE_SECRET) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid secret token',
          message: 'Please provide a valid secret token in Authorization header or body'
        },
        { status: 401 }
      );
    }

    const { type, slug } = body;

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: type' },
        { status: 400 }
      );
    }

    console.log(`🔄 [Revalidate] Request received: type=${type}, slug=${slug}`);

    // ล้าง cache ข้อมูลจาก WordPress ด้วย (unstable_cache ใช้ tag "wp")
    revalidateTag('wp');

    // Revalidate ตาม type
    switch (type) {
      case 'service':
        if (slug) {
          revalidatePath(`/services/${slug}`);
          console.log(`✅ [Revalidate] Revalidated service: /services/${slug}`);
        }
        // Revalidate homepage (แสดง services)
        revalidatePath('/');
        break;

      case 'location':
        if (slug) {
          revalidatePath(`/locations/${slug}`);
          console.log(`✅ [Revalidate] Revalidated location: /locations/${slug}`);
        }
        // Revalidate locations index
        revalidatePath('/locations');
        break;

      case 'price':
        if (slug) {
          revalidatePath(`/prices/${slug}`);
          console.log(`✅ [Revalidate] Revalidated price: /prices/${slug}`);
        }
        revalidatePath('/');
        break;

      case 'category':
        if (slug) {
          revalidatePath(`/categories/${slug}`);
          console.log(`✅ [Revalidate] Revalidated category: /categories/${slug}`);
        }
        revalidatePath('/categories');
        break;

      case 'all':
        // Revalidate ทุกหน้าหลัก
        revalidatePath('/');
        revalidatePath('/services');
        revalidatePath('/locations');
        revalidatePath('/prices');
        revalidatePath('/categories');
        console.log('✅ [Revalidate] Revalidated all main pages');
        break;

      default:
        return NextResponse.json(
          { 
            success: false, 
            error: `Unknown type: ${type}`,
            supportedTypes: ['service', 'location', 'price', 'category', 'all']
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      revalidated: true,
      type,
      slug: slug || 'all',
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ [Revalidate] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// GET method สำหรับทดสอบ
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get('secret');
  
  if (secret !== REVALIDATE_SECRET) {
    return NextResponse.json(
      { 
        error: 'Unauthorized',
        message: 'Revalidation API is working. Use POST method with valid secret token.'
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    message: 'Revalidation API is ready',
    usage: {
      method: 'POST',
      endpoint: '/api/revalidate',
      headers: {
        'Authorization': 'Bearer YOUR_SECRET_TOKEN',
        'Content-Type': 'application/json',
      },
      body: {
        type: 'service | location | price | category | all',
        slug: 'optional-slug',
      },
      examples: [
        {
          description: 'Revalidate a specific service',
          body: { type: 'service', slug: 'buy-notebook-ubon-ratchathani' },
        },
        {
          description: 'Revalidate a specific location',
          body: { type: 'location', slug: 'bangkok' },
        },
        {
          description: 'Revalidate all pages',
          body: { type: 'all' },
        },
      ],
    },
  });
}
