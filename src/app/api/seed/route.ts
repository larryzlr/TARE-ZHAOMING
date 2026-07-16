import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    // 简单验证，防止未授权访问
    if (token !== process.env.NEXTAUTH_SECRET) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const results: string[] = [];

    // 1. 创建管理员用户
    const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@example.com' } });
    const hashedPassword = await bcrypt.hash('Admin123', 10);
    if (!existingAdmin) {
      await prisma.user.create({
        data: { email: 'admin@example.com', name: '管理员', password: hashedPassword, role: 'admin' }
      });
      results.push('管理员用户已创建');
    } else {
      await prisma.user.update({
        where: { email: 'admin@example.com' },
        data: { password: hashedPassword }
      });
      results.push('管理员密码已更新');
    }

    // 2. 创建产品分类
    const categories = [
      { slug: 'disc-brake-pads', icon: '🛞', sortOrder: 1, translations: { zh: '盘式刹车片', en: 'Disc Brake Pads', ru: 'Дисковые тормозные колодки', fr: 'Plaquettes de frein à disque', es: 'Pastillas de freno de disco' } },
      { slug: 'drum-brake-pads', icon: '🔄', sortOrder: 2, translations: { zh: '鼓式刹车片', en: 'Drum Brake Pads', ru: 'Барабанные тормозные колодки', fr: 'Plaquettes de frein à tambour', es: 'Pastillas de freno de tambor' } },
      { slug: 'ceramic-brake-pads', icon: '✨', sortOrder: 3, translations: { zh: '陶瓷刹车片', en: 'Ceramic Brake Pads', ru: 'Керамические тормозные колодки', fr: 'Plaquettes de frein en céramique', es: 'Pastillas de freno cerámicas' } },
      { slug: 'semi-metallic-pads', icon: '⚙️', sortOrder: 4, translations: { zh: '半金属刹车片', en: 'Semi-Metallic Pads', ru: 'Полуметаллические колодки', fr: 'Plaquettes semi-métalliques', es: 'Pastillas semimetálicas' } },
      { slug: 'brake-shoes', icon: '🔩', sortOrder: 5, translations: { zh: '刹车蹄片', en: 'Brake Shoes', ru: 'Тормозные башмаки', fr: 'Sabots de frein', es: 'Zapatas de freno' } },
      { slug: 'brake-rotors', icon: '🔵', sortOrder: 6, translations: { zh: '刹车盘', en: 'Brake Rotors', ru: 'Тормозные диски', fr: 'Disques de frein', es: 'Discos de freno' } },
    ];

    for (const cat of categories) {
      const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
      if (!existing) {
        const created = await prisma.category.create({
          data: { slug: cat.slug, icon: cat.icon, sortOrder: cat.sortOrder }
        });
        for (const [lang, name] of Object.entries(cat.translations)) {
          await prisma.categoryTranslation.create({
            data: { categoryId: created.id, lang, name: name as string }
          });
        }
        results.push(`分类 ${cat.slug} 已创建`);
      } else {
        results.push(`分类 ${cat.slug} 已存在`);
      }
    }

    // 3. 创建站点配置
    const siteConfigs = [
      { key: 'company_name', values: { zh: '赵明刹车片', en: 'Zhaoming Brake Pads', ru: 'Тормозные колодки Zhaoming', fr: 'Plaquettes de frein Zhaoming', es: 'Pastillas de freno Zhaoming' } },
      { key: 'whatsapp', values: { zh: '+8613800138000', en: '+8613800138000', ru: '+8613800138000', fr: '+8613800138000', es: '+8613800138000' } },
      { key: 'wechat', values: { zh: 'zhaoming_brake', en: 'zhaoming_brake', ru: 'zhaoming_brake', fr: 'zhaoming_brake', es: 'zhaoming_brake' } },
    ];

    for (const config of siteConfigs) {
      for (const [lang, value] of Object.entries(config.values)) {
        const existing = await prisma.siteConfig.findUnique({
          where: { key_lang: { key: config.key, lang } }
        });
        if (!existing) {
          await prisma.siteConfig.create({
            data: { key: config.key, value: value as string, lang }
          });
        }
      }
      results.push(`站点配置 ${config.key} 已处理`);
    }

    // 4. 同步5语言翻译文案
    const locales = ['zh', 'en', 'ru', 'fr', 'es'];
    for (const locale of locales) {
      try {
        const messages = await import(`@/messages/${locale}.json`);
        const content = JSON.stringify(messages.default);
        await prisma.translation.upsert({
          where: { lang: locale },
          update: { content },
          create: { lang: locale, content }
        });
        results.push(`翻译 ${locale} 已同步`);
      } catch {
        results.push(`翻译 ${locale} 导入失败`);
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message || '初始化失败' }, { status: 500 });
  }
}

import { NextRequest } from 'next/server';
