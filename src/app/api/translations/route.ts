import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import prisma from '@/lib/db';
import { routing } from '@/lib/i18n/routing';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    const record = await prisma.translation.findUnique({
      where: { lang }
    });

    return NextResponse.json({
      lang,
      content: record?.content || ''
    });
  } catch (error) {
    console.error('GET /api/translations error:', error);
    return NextResponse.json({ error: 'Failed to fetch translations' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { lang, content } = body;

    if (!lang || typeof content !== 'string') {
      return NextResponse.json({ error: 'lang and content are required' }, { status: 400 });
    }

    // Validate JSON format
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (e: any) {
      return NextResponse.json({ error: `JSON 格式错误：${e.message || '解析失败'}。文案未保存。` }, { status: 400 });
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return NextResponse.json({ error: 'JSON 必须为对象类型。文案未保存。' }, { status: 400 });
    }

    await prisma.translation.upsert({
      where: { lang },
      update: { content },
      create: { lang, content }
    });

    revalidateTag('translations');

    routing.locales.forEach(locale => {
      revalidatePath(`/${locale}`);
      revalidatePath(`/${locale}/products`);
      revalidatePath(`/${locale}/admin/translations`);
    });

    return NextResponse.json({ success: true, lang });
  } catch (error) {
    console.error('PUT /api/translations error:', error);
    return NextResponse.json({ error: 'Failed to update translations' }, { status: 500 });
  }
}
