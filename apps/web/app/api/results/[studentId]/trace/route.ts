import { NextRequest, NextResponse } from 'next/server';
import { memoryStore, InternalStudent, InternalTrace } from '@/lib/data-store';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const { studentId } = await params;
  const student = memoryStore.students.find(
    (s: InternalStudent) => s.studentId === studentId || s.id === studentId
  );

  if (!student || !student.result) {
    return NextResponse.json(
      { success: false, error: { message: `Student ${studentId} not found` } },
      { status: 404 }
    );
  }

  const traces = student.result.traces;
  const compulsoryTraces = traces.filter((t: InternalTrace) => !t.subject.isOptional);
  const optionalTrace = traces.find((t: InternalTrace) => t.subject.isOptional) || null;

  return NextResponse.json({
    success: true,
    data: {
      student: {
        id: student.id,
        studentId: student.studentId,
        roll: student.roll,
        name: student.name,
        class: student.class.name,
      },
      result: {
        id: student.result.id,
        studentId: student.id,
        compulsoryGradePointSum: student.result.compulsoryGradePointSum,
        optionalGradePoint: student.result.optionalGradePoint,
        optionalContribution: student.result.optionalContribution,
        uncancelledGPA: student.result.uncancelledGPA,
        finalGPA: student.result.finalGPA,
        finalLetterGrade: student.result.finalLetterGrade,
        overallResult: student.result.overallResult,
        calculationVersion: student.result.calculationVersion,
        calculatedAt: student.result.calculatedAt,
      },
      traces,
      compulsoryTraces,
      optionalTrace,
      checkingItems: student.checkingItems,
    },
  });
}
