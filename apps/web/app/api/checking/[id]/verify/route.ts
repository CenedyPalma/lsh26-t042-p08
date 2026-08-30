import { NextRequest, NextResponse } from 'next/server';
import { memoryStore, InternalCheckingItem } from '@/lib/data-store';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const item = memoryStore.checkingItems.find((i: InternalCheckingItem) => i.id === id);

  if (!item) {
    return NextResponse.json(
      { success: false, error: { message: `Checking item ${id} not found` } },
      { status: 404 }
    );
  }

  item.status = 'VERIFIED';
  item.verificationNotes = body?.notes || null;
  item.verifiedAt = new Date().toISOString();

  return NextResponse.json({ success: true, data: item });
}
