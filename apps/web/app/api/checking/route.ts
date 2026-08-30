import { NextRequest, NextResponse } from 'next/server';
import { memoryStore, InternalCheckingItem } from '@/lib/data-store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const status = searchParams.get('status');
  const classId = searchParams.get('classId');

  let items = memoryStore.checkingItems;

  if (type) {
    items = items.filter((i: InternalCheckingItem) => i.type === type);
  }

  if (status) {
    items = items.filter((i: InternalCheckingItem) => i.status === status);
  }

  if (classId) {
    items = items.filter(
      (i: InternalCheckingItem) =>
        i.student?.class?.id === classId || i.student?.class?.name === classId
    );
  }

  return NextResponse.json({ success: true, data: items });
}
