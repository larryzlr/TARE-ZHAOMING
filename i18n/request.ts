import { getRequestConfig } from 'next-intl/server';
import { routing } from '../src/lib/i18n/routing';

// 内存缓存，避免构建时重复查询
let dbAvailable: boolean | null = null;

async function loadMessagesFromDB(locale: string): Promise<Record<string, any> | null> {
  try {
    // 动态导入 prisma，避免构建时初始化
    const prismaModule = await import('../src/lib/db');
    const prisma = prismaModule.default;
    
    const record = await prisma.translation.findUnique({
      where: { lang: locale }
    });
    
    if (record?.content) {
      return JSON.parse(record.content);
    }
    return null;
  } catch (e) {
    console.error(`Failed to load translation from DB for ${locale}:`, e);
    dbAvailable = false;
    return null;
  }
}

async function loadMessagesFromFile(locale: string): Promise<Record<string, any>> {
  try {
    const messages = (await import(`../src/messages/${locale}.json`)).default;
    return messages;
  } catch (e) {
    console.error(`Failed to load translation file for ${locale}:`, e);
    return {};
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  // 验证locale
  if (!locale || !routing.locales.includes(locale as any)) {
    const messages = await loadMessagesFromFile(routing.defaultLocale);
    return {
      locale: routing.defaultLocale,
      messages,
    };
  }

  // 先尝试从数据库加载
  let messages: Record<string, any> | null = null;
  
  // 如果之前数据库不可用，跳过DB查询
  if (dbAvailable !== false) {
    try {
      messages = await loadMessagesFromDB(locale);
    } catch (e) {
      console.error('DB translation load failed:', e);
    }
  }

  // Fallback到文件系统
  if (!messages || Object.keys(messages).length === 0) {
    messages = await loadMessagesFromFile(locale);
  }

  return {
    locale,
    messages
  };
});
