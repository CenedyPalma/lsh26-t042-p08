import { NextResponse } from 'next/server';
import { memoryStore } from '@/lib/data-store';

export async function GET() {
  const stats = memoryStore.getDashboardStats();
  return NextResponse.json({ success: true, data: stats });
}
