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
  } catch (error: any) {
    console.error('GET /api/translations error:', error?.message || error);
    return NextResponse.json({ error: `获取文案失败：${error?.message || '数据库连接错误'}` }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { lang, content } = body;

    if (!lang || typeof content !== 'string') {
      return NextResponse.json({ error: '缺少 lang 或 content 参数' }, { status: 400 });
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

    // 写入数据库
    await prisma.translation.upsert({
      where: { lang },
      update: { content },
      create: { lang, content }
    });

    // 验证写入成功：读回刚保存的数据
    const saved = await prisma.translation.findUnique({ where: { lang } });
    if (!saved || saved.content !== content) {
      console.error('Verification failed: saved content does not match');
      return NextResponse.json({ error: '保存验证失败，数据可能未正确写入。请重试。' }, { status: 500 });
    }

    // 刷新缓存
    try {
      revalidateTag('translations');
      routing.locales.forEach(locale => {
        revalidatePath(`/${locale}`);
        revalidatePath(`/${locale}/products`);
        revalidatePath(`/${locale}/admin/translations`);
      });
    } catch (e) {
      console.warn('Revalidation warning:', e);
    }

    return NextResponse.json({ success: true, lang, verified: true });
  } catch (error: any) {
    console.error('PUT /api/translations error:', error);
    const errorMsg = error?.message || '未知错误';
    return NextResponse.json({ error: `保存失败：${errorMsg}` }, { status: 500 });
  }
}
