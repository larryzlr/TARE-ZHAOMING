import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

// GET: 获取所有OE号列表（后台管理用）
export async function GET() {
  try {
    const oeNumbers = await prisma.oeNumber.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    return NextResponse.json({ oeNumbers });
  } catch (error: any) {
    return NextResponse.json({ error: '获取OE号列表失败' }, { status: 500 });
  }
}

// POST: 新增OE号
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { oeNumber, brand, model, resultType, sortOrder } = body;
    
    if (!oeNumber) {
      return NextResponse.json({ error: 'OE号不能为空' }, { status: 400 });
    }
    
    const existing = await prisma.oeNumber.findUnique({ where: { oeNumber } });
    if (existing) {
      return NextResponse.json({ error: '该OE号已存在' }, { status: 400 });
    }
    
    const created = await prisma.oeNumber.create({
      data: {
        oeNumber,
        brand: brand || '',
        model: model || '',
        resultType: resultType || 'supported',
        sortOrder: sortOrder || 0,
      }
    });
    
    try { revalidatePath('/', 'layout'); } catch {}
    return NextResponse.json({ success: true, oeNumber: created });
  } catch (error: any) {
    console.error('POST /api/oe-numbers error:', error);
    return NextResponse.json({ error: `创建OE号失败: ${error?.message || '未知错误'}` }, { status: 500 });
  }
}

// PUT: 更新OE号
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, oeNumber, brand, model, resultType, sortOrder } = body;
    
    if (!id) {
      return NextResponse.json({ error: '缺少ID' }, { status: 400 });
    }
    
    const updated = await prisma.oeNumber.update({
      where: { id },
      data: {
        oeNumber,
        brand: brand || '',
        model: model || '',
        resultType: resultType || 'supported',
        sortOrder: sortOrder || 0,
      }
    });
    
    try { revalidatePath('/', 'layout'); } catch {}
    return NextResponse.json({ success: true, oeNumber: updated });
  } catch (error: any) {
    return NextResponse.json({ error: '更新OE号失败' }, { status: 500 });
  }
}

// DELETE: 删除OE号
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: '缺少ID' }, { status: 400 });
    }
    
    await prisma.oeNumber.delete({ where: { id } });
    
    try { revalidatePath('/', 'layout'); } catch {}
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: '删除OE号失败' }, { status: 500 });
  }
}
