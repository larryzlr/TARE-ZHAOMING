import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET: 公开查询OE号
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').trim().toUpperCase();
    
    if (!query) {
      return NextResponse.json({ found: false, resultType: null });
    }
    
    // 精确匹配
    const exact = await prisma.oeNumber.findUnique({
      where: { oeNumber: query }
    });
    
    if (exact) {
      return NextResponse.json({
        found: true,
        resultType: exact.resultType,
        oeNumber: exact.oeNumber,
        brand: exact.brand,
        model: exact.model,
      });
    }
    
    // 模糊匹配 - 搜索包含该关键词的OE号
    const fuzzy = await prisma.oeNumber.findMany({
      where: { oeNumber: { contains: query } },
      take: 5
    });
    
    if (fuzzy.length > 0) {
      return NextResponse.json({
        found: true,
        resultType: fuzzy[0].resultType,
        oeNumber: fuzzy[0].oeNumber,
        brand: fuzzy[0].brand,
        model: fuzzy[0].model,
        suggestions: fuzzy.slice(1).map(f => ({ oeNumber: f.oeNumber, brand: f.brand, model: f.model })),
      });
    }
    
    // 未找到 - 默认返回"可定制"
    return NextResponse.json({
      found: false,
      resultType: 'custom',
      oeNumber: query,
    });
  } catch (error: any) {
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}
