import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';

const SUPPORTED_LOCALES = ['en', 'zh', 'ru', 'fr', 'es'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    const configs = await prisma.siteConfig.findMany({
      where: { lang }
    });

    const configMap: Record<string, string> = {};
    configs.forEach(config => {
      configMap[config.key] = config.value;
    });

    return NextResponse.json({ config: configMap });
  } catch (error) {
    console.error('GET /api/settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { lang, configs } = body;

    if (!lang || !configs) {
      return NextResponse.json({ error: 'lang and configs are required' }, { status: 400 });
    }

    for (const [key, value] of Object.entries(configs)) {
      await prisma.siteConfig.upsert({
        where: {
          key_lang: { key, lang }
        },
        update: { value: value as string },
        create: { key, value: value as string, lang }
      });
    }

    const updatedConfigs = await prisma.siteConfig.findMany({ where: { lang } });
    const configMap: Record<string, string> = {};
    updatedConfigs.forEach(config => {
      configMap[config.key] = config.value;
    });

    SUPPORTED_LOCALES.forEach(locale => {
      revalidatePath(`/${locale}`);
      revalidatePath(`/${locale}/products`);
    });

    return NextResponse.json({ config: configMap });
  } catch (error) {
    console.error('PUT /api/settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}