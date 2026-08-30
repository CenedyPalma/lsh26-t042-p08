import { NextResponse } from 'next/server';
import { memoryStore } from '@/lib/data-store';

export async function POST() {
  const result = memoryStore.recalculateAll();
  return NextResponse.json({ success: true, data: result });
}
