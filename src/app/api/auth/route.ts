import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: '请填写用户名和密码' }, { status: 400 });
    }

    // 查找用户（支持用 email 或 name 登录）
    const email = username.includes('@') ? username : `${username}@example.com`;
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    // 生成简单 token（时间戳 + 用户ID 的 base64）
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    return NextResponse.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error: any) {
    console.error('Auth error:', error);
    // 返回更详细的错误信息便于排查
    const errorMsg = error?.message || '登录失败，请重试';
    return NextResponse.json({ 
      error: '登录失败，请重试',
      detail: process.env.NODE_ENV === 'development' ? errorMsg : undefined
    }, { status: 500 });
  }
}
