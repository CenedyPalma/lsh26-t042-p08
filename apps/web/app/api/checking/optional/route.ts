import { NextResponse } from 'next/server';
import { memoryStore, InternalCheckingItem } from '@/lib/data-store';

export async function GET() {
  const items = memoryStore.checkingItems.filter((i: InternalCheckingItem) => i.type === 'OPTIONAL');
  return NextResponse.json({ success: true, data: items });
}
