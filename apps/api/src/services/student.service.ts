import { prisma } from '../db/prisma.js';

export class StudentService {
  async getAllStudents(query?: {
    classId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const where = {
      ...(query?.classId ? { classId: query.classId } : {}),
      ...(query?.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' as const } },
              { studentId: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [total, students] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        include: {
          class: true,
          marks: {
            include: { subject: true },
          },
          result: true,
          checkingItems: {
            include: { subject: true },
          },
        },
        orderBy: [{ classId: 'asc' }, { roll: 'asc' }],
        skip: query?.offset ?? 0,
        take: query?.limit ?? 100,
      }),
    ]);

    return { total, students };
  }

  async getStudentById(studentId: string) {
    return prisma.student.findFirst({
      where: {
        OR: [{ id: studentId }, { studentId: studentId }],
      },
      include: {
        class: true,
        marks: {
          include: { subject: true },
          orderBy: { subject: { name: 'asc' } },
        },
        result: {
          include: {
            traces: {
              include: { subject: true },
              orderBy: { subject: { name: 'asc' } },
            },
          },
        },
        checkingItems: {
          include: { subject: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }
}

export const studentService = new StudentService();
