import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { status } = body;

    if (!status || !['new', 'read', 'handled'].includes(status)) {
      return NextResponse.json({ error: '无效的状态' }, { status: 400 });
    }

    const inquiry = await prisma.inquiry.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json({ success: true, inquiry });
  } catch (error) {
    console.error('PATCH /api/inquiries/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.inquiry.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/inquiries/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: 500 });
  }
}
