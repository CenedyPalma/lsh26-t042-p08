import { NextRequest, NextResponse } from 'next/server';
import { memoryStore, InternalStudent, InternalMark, InternalCheckingItem } from '@/lib/data-store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  const { classId } = await params;
  const { searchParams } = new URL(req.url);

  const search = searchParams.get('search')?.toLowerCase();
  const resultStatus = searchParams.get('resultStatus');
  const letterGrade = searchParams.get('letterGrade');
  const flag = searchParams.get('flag');
  const sortBy = searchParams.get('sortBy') || 'roll';
  const sortOrder = searchParams.get('sortOrder') || 'asc';

  let students = memoryStore.students.filter(
    (s: InternalStudent) => s.classId === classId || s.class.name === classId
  );

  if (search) {
    students = students.filter(
      (s: InternalStudent) =>
        s.name.toLowerCase().includes(search) ||
        s.studentId.toLowerCase().includes(search)
    );
  }

  if (resultStatus) {
    students = students.filter(
      (s: InternalStudent) => s.result?.overallResult === resultStatus
    );
  }

  if (letterGrade) {
    students = students.filter(
      (s: InternalStudent) => s.result?.finalLetterGrade === letterGrade
    );
  }

  if (flag) {
    students = students.filter((s: InternalStudent) => {
      if (flag === 'AB') {
        return s.marks.some((m: InternalMark) => m.isAbsent || m.status === 'ABSENT');
      }
      if (flag === 'PRACTICAL_FAIL') {
        return s.marks.some(
          (m: InternalMark) =>
            m.subject.hasPractical &&
            m.practicalMarks !== null &&
            m.practicalMarks < 8
        );
      }
      if (flag === 'OPTIONAL_REVIEW') {
        return s.checkingItems.some((c: InternalCheckingItem) => c.type === 'OPTIONAL');
      }
      return true;
    });
  }

  students.sort((a: InternalStudent, b: InternalStudent) => {
    if (sortBy === 'gpa') {
      const gpaA = a.result?.finalGPA || 0;
      const gpaB = b.result?.finalGPA || 0;
      return sortOrder === 'desc' ? gpaB - gpaA : gpaA - gpaB;
    }
    if (sortBy === 'name') {
      return sortOrder === 'desc'
        ? b.name.localeCompare(a.name)
        : a.name.localeCompare(b.name);
    }
    return sortOrder === 'desc' ? b.roll - a.roll : a.roll - b.roll;
  });

  const formatted = students.map((s: InternalStudent) => ({
    id: s.id,
    studentId: s.studentId,
    roll: s.roll,
    name: s.name,
    classId: s.classId,
    class: s.class,
    marks: s.marks,
    result: s.result,
    checkingItems: s.checkingItems,
  }));

  return NextResponse.json({ success: true, data: formatted });
}
