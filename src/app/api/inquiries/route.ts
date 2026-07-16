import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const where = status ? { status } : {};
    const inquiries = await prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error('GET /api/inquiries error:', error);
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, whatsapp, product, message, lang } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: '姓名为必填项', field: 'name' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: '邮箱格式不正确', field: 'email' }, { status: 400 });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        whatsapp: whatsapp?.trim() || null,
        product: product?.trim() || null,
        message: message?.trim() || null,
        lang: lang || 'en',
        status: 'new',
      },
    });

    return NextResponse.json({ success: true, inquiry });
  } catch (error) {
    console.error('POST /api/inquiries error:', error);
    return NextResponse.json({ error: 'Failed to create inquiry' }, { status: 500 });
  }
}
