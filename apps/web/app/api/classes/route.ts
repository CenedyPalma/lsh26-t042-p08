import { NextResponse } from 'next/server';
import { memoryStore, InternalClass, InternalStudent } from '@/lib/data-store';

export async function GET() {
  const classes = memoryStore.classes.map((c: InternalClass) => ({
    id: c.id,
    name: c.name,
    academicYear: c.academicYear,
    _count: {
      students: memoryStore.students.filter((s: InternalStudent) => s.classId === c.id).length,
    },
  }));

  return NextResponse.json({ success: true, data: classes });
}
