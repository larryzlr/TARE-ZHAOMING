import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

// GET: 获取OE号列表（支持服务端分页+搜索）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20')));
    const search = searchParams.get('search')?.trim() || '';

    const where: Prisma.OeNumberWhereInput = search ? {
      OR: [
        { oeNumber: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { brand: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { model: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ]
    } : {};

    const [oeNumbers, total] = await Promise.all([
      prisma.oeNumber.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.oeNumber.count({ where }),
    ]);

    return NextResponse.json({
      oeNumbers,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
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
