import { prisma } from '../db/prisma.js';

export class ClassService {
  async getAllClasses() {
    return prisma.class.findMany({
      include: {
        _count: {
          select: { students: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getClassById(classId: string) {
    return prisma.class.findUnique({
      where: { id: classId },
      include: {
        _count: {
          select: { students: true },
        },
      },
    });
  }

  async getClassStudents(
    classId: string,
    filters?: {
      search?: string;
      resultStatus?: 'PASS' | 'FAIL';
      letterGrade?: string;
      flag?: 'AB' | 'PRACTICAL_FAIL' | 'OPTIONAL_REVIEW';
      sortBy?: 'roll' | 'name' | 'gpa' | 'grade';
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const students = await prisma.student.findMany({
      where: {
        classId,
        ...(filters?.search
          ? {
              OR: [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { studentId: { contains: filters.search, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(filters?.resultStatus
          ? {
              result: { overallResult: filters.resultStatus },
            }
          : {}),
        ...(filters?.letterGrade
          ? {
              result: { finalLetterGrade: filters.letterGrade },
            }
          : {}),
      },
      include: {
        class: true,
        marks: {
          include: { subject: true },
        },
        result: {
          include: {
            traces: {
              include: { subject: true },
            },
          },
        },
        checkingItems: {
          include: { subject: true },
        },
      },
      orderBy:
        filters?.sortBy === 'gpa'
          ? { result: { finalGPA: filters?.sortOrder || 'desc' } }
          : filters?.sortBy === 'name'
          ? { name: filters?.sortOrder || 'asc' }
          : { roll: filters?.sortOrder || 'asc' },
    });

    if (filters?.flag) {
      return students.filter((s: any) => {
        if (filters.flag === 'AB') {
          return s.marks.some((m: any) => m.isAbsent || m.status === 'ABSENT');
        }
        if (filters.flag === 'PRACTICAL_FAIL') {
          return s.marks.some(
            (m: any) =>
              m.subject.hasPractical &&
              m.practicalMarks !== null &&
              m.practicalMarks < 8
          );
        }
        if (filters.flag === 'OPTIONAL_REVIEW') {
          return s.checkingItems.some((c: any) => c.type === 'OPTIONAL');
        }
        return true;
      });
    }

    return students;
  }
}

export const classService = new ClassService();
