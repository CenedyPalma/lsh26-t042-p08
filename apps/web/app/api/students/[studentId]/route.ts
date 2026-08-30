import { NextRequest, NextResponse } from 'next/server';
import { memoryStore, InternalStudent } from '@/lib/data-store';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const { studentId } = await params;
  const student = memoryStore.students.find(
    (s: InternalStudent) => s.studentId === studentId || s.id === studentId
  );

  if (!student) {
    return NextResponse.json(
      { success: false, error: { message: `Student ${studentId} not found` } },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: student });
}
