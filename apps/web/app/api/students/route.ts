import { NextRequest, NextResponse } from 'next/server';
import { memoryStore, InternalStudent } from '@/lib/data-store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.toLowerCase();
  const classId = searchParams.get('classId');

  let students = memoryStore.students;

  if (classId) {
    students = students.filter(
      (s: InternalStudent) => s.classId === classId || s.class.name === classId
    );
  }

  if (search) {
    students = students.filter(
      (s: InternalStudent) =>
        s.name.toLowerCase().includes(search) ||
        s.studentId.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({ success: true, data: students });
}
