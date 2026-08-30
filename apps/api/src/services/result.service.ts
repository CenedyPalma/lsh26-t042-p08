import { prisma } from '../db/prisma.js';
import {
  calculateSubjectResult,
  calculateGPA,
  generateCheckingItems,
} from '../result-engine/index.js';
import {
  SubjectConfig,
  RawMarkInput,
  SubjectResultCalculation,
  DashboardStatsDTO,
} from '@school-result/shared';

export class ResultService {
  /**
   * Recalculates all results for every student in the database within a PostgreSQL transaction.
   * Authoritative raw marks are preserved and results/traces/checking-items are refreshed transactionally.
   */
  async recalculateAllResults() {
    const subjects = await prisma.subject.findMany();
    const subjectMap = new Map<string, SubjectConfig>(
      subjects.map((s: any) => [
        s.id,
        {
          id: s.id,
          name: s.name,
          code: s.code,
          isOptional: s.isOptional,
          hasPractical: s.hasPractical,
          theoryMaximum: s.theoryMaximum,
          theoryPassMark: s.theoryPassMark,
          practicalMaximum: s.practicalMaximum,
          practicalPassMark: s.practicalPassMark,
        },
      ])
    );

    const subjectByCodeMap = new Map<string, SubjectConfig>(
      subjects.map((s: any) => [s.code, subjectMap.get(s.id)!])
    );

    const students = await prisma.student.findMany({
      include: {
        class: true,
        marks: {
          include: { subject: true },
        },
      },
    });

    const compulsorySubjects = subjects.filter((s: any) => !s.isOptional);
    const compulsoryCodes = compulsorySubjects.map((s: any) => s.code);

    let calculatedCount = 0;

    await prisma.$transaction(async (tx: any) => {
      for (const student of students) {
        const subjectResults: (SubjectResultCalculation & { subjectId: string })[] = [];
        const compulsoryResults: SubjectResultCalculation[] = [];
        let optionalResult: SubjectResultCalculation | null = null;
        let optionalSubjectCode = '';

        for (const mark of student.marks) {
          const config = subjectMap.get(mark.subjectId);
          if (!config) continue;

          const markInput: RawMarkInput = {
            subjectCode: config.code,
            theoryMarks: mark.theoryMarks,
            practicalMarks: mark.practicalMarks,
            status: mark.status,
            isAbsent: mark.isAbsent,
          };

          const calculated = calculateSubjectResult(config, markInput);
          subjectResults.push({ ...calculated, subjectId: mark.subjectId });

          if (!config.isOptional) {
            compulsoryResults.push(calculated);
          } else {
            optionalResult = calculated;
            optionalSubjectCode = config.code;
          }
        }

        const gpaResult = calculateGPA(compulsoryResults, optionalResult);
        const checkingCalculations = generateCheckingItems(
          student.id,
          subjectResults,
          optionalSubjectCode
        );

        // Delete existing checking items for this student result or student
        await tx.checkingItem.deleteMany({
          where: { studentId: student.id },
        });

        // Upsert student result
        const savedResult = await tx.studentResult.upsert({
          where: { studentId: student.id },
          create: {
            studentId: student.id,
            compulsoryGradePointSum: gpaResult.compulsoryGradePointSum,
            optionalGradePoint: gpaResult.optionalGradePoint,
            optionalContribution: gpaResult.optionalContribution,
            uncancelledGPA: gpaResult.uncancelledGPA,
            finalGPA: gpaResult.finalGPA,
            finalLetterGrade: gpaResult.finalLetterGrade,
            overallResult: gpaResult.overallResult,
            calculationVersion: 1,
            calculatedAt: new Date(),
          },
          update: {
            compulsoryGradePointSum: gpaResult.compulsoryGradePointSum,
            optionalGradePoint: gpaResult.optionalGradePoint,
            optionalContribution: gpaResult.optionalContribution,
            uncancelledGPA: gpaResult.uncancelledGPA,
            finalGPA: gpaResult.finalGPA,
            finalLetterGrade: gpaResult.finalLetterGrade,
            overallResult: gpaResult.overallResult,
            calculationVersion: { increment: 1 },
            calculatedAt: new Date(),
          },
        });

        // Refresh traces
        await tx.resultTrace.deleteMany({
          where: { studentResultId: savedResult.id },
        });

        await tx.resultTrace.createMany({
          data: subjectResults.map((sr: any) => ({
            studentResultId: savedResult.id,
            subjectId: sr.subjectId,
            theoryMarks: sr.theoryMarks,
            practicalMarks: sr.practicalMarks,
            totalMarks: sr.totalMarks,
            markUsed: sr.markUsed,
            grade: sr.grade,
            gradePoint: sr.gradePoint,
            status: sr.status,
            ruleCode: sr.ruleCode,
            ruleDescription: sr.ruleDescription,
          })),
        });

        // Insert new checking items
        if (checkingCalculations.length > 0) {
          await tx.checkingItem.createMany({
            data: checkingCalculations.map((ci: any) => {
              const matchingSub = ci.subjectCode
                ? subjectByCodeMap.get(ci.subjectCode)
                : undefined;
              return {
                studentId: student.id,
                studentResultId: savedResult.id,
                subjectId: matchingSub?.id ?? null,
                type: ci.type,
                reason: ci.reason,
                status: 'PENDING',
              };
            }),
          });
        }

        calculatedCount++;
      }
    });

    return { calculatedCount };
  }

  async getStudentResult(studentId: string) {
    const student = await prisma.student.findFirst({
      where: {
        OR: [{ id: studentId }, { studentId }],
      },
      include: {
        class: true,
        result: {
          include: {
            traces: {
              include: { subject: true },
              orderBy: { subject: { name: 'asc' } },
            },
            checkingItems: {
              include: { subject: true },
            },
          },
        },
      },
    });

    return student?.result ?? null;
  }

  async getStudentTrace(studentId: string) {
    const student = await prisma.student.findFirst({
      where: {
        OR: [{ id: studentId }, { studentId }],
      },
      include: {
        class: true,
        result: {
          include: {
            traces: {
              include: { subject: true },
              orderBy: [{ subject: { isOptional: 'asc' } }, { subject: { name: 'asc' } }],
            },
            checkingItems: {
              include: { subject: true },
            },
          },
        },
      },
    });

    if (!student || !student.result) return null;

    const traces = student.result.traces;
    const compulsoryTraces = traces.filter((t: any) => !t.subject.isOptional);
    const optionalTrace = traces.find((t: any) => t.subject.isOptional) || null;

    return {
      student: {
        id: student.id,
        studentId: student.studentId,
        roll: student.roll,
        name: student.name,
        class: student.class.name,
      },
      result: {
        id: student.result.id,
        compulsoryGradePointSum: student.result.compulsoryGradePointSum,
        optionalGradePoint: student.result.optionalGradePoint,
        optionalContribution: student.result.optionalContribution,
        uncancelledGPA: student.result.uncancelledGPA,
        finalGPA: student.result.finalGPA,
        finalLetterGrade: student.result.finalLetterGrade,
        overallResult: student.result.overallResult,
        calculatedAt: student.result.calculatedAt,
        calculationVersion: student.result.calculationVersion,
      },
      traces,
      compulsoryTraces,
      optionalTrace,
      checkingItems: student.result.checkingItems,
    };
  }

  async getDashboardStats(): Promise<DashboardStatsDTO> {
    const [totalStudents, totalClasses, results, absentMarks, practicalFailMarks, optionalCheckingItems, pendingCount] =
      await Promise.all([
        prisma.student.count(),
        prisma.class.count(),
        prisma.studentResult.findMany({
          select: {
            finalGPA: true,
            finalLetterGrade: true,
            overallResult: true,
          },
        }),
        prisma.studentSubjectMark.findMany({
          where: { OR: [{ isAbsent: true }, { status: 'ABSENT' }] },
          distinct: ['studentId'],
        }),
        prisma.studentSubjectMark.findMany({
          where: {
            subject: { hasPractical: true },
            practicalMarks: { lt: 8 },
          },
          distinct: ['studentId'],
        }),
        prisma.checkingItem.findMany({
          where: { type: 'OPTIONAL' },
          distinct: ['studentId'],
        }),
        prisma.checkingItem.count({
          where: { status: 'PENDING' },
        }),
      ]);

    const passedCount = results.filter((r: any) => r.overallResult === 'PASS').length;
    const failedCount = results.filter((r: any) => r.overallResult === 'FAIL').length;
    const passPercentage =
      results.length > 0 ? Number(((passedCount / results.length) * 100).toFixed(1)) : 0;

    const gpas = results.map((r: any) => r.finalGPA);
    const highestGPA = gpas.length > 0 ? Math.max(...gpas) : 0;
    const averageGPA =
      gpas.length > 0
        ? Number((gpas.reduce((acc: number, g: number) => acc + g, 0) / gpas.length).toFixed(2))
        : 0;

    const gradeDistribution: Record<string, number> = {
      'A+': 0,
      A: 0,
      'A-': 0,
      B: 0,
      C: 0,
      D: 0,
      F: 0,
    };

    results.forEach((r: any) => {
      gradeDistribution[r.finalLetterGrade] =
        (gradeDistribution[r.finalLetterGrade] || 0) + 1;
    });

    return {
      totalStudents,
      totalClasses,
      passedCount,
      failedCount,
      passPercentage,
      averageGPA,
      highestGPA,
      absentCount: absentMarks.length,
      practicalFailCount: practicalFailMarks.length,
      optionalReviewCount: optionalCheckingItems.length,
      gradeDistribution,
      pendingVerifications: pendingCount,
    };
  }
}

export const resultService = new ResultService();
