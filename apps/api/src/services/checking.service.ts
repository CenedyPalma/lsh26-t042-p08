import { prisma } from '../db/prisma.js';
import { CheckingType, VerificationStatus } from '@school-result/shared';

export class CheckingService {
  async getCheckingItems(query?: {
    type?: CheckingType;
    status?: VerificationStatus;
    classId?: string;
  }) {
    return prisma.checkingItem.findMany({
      where: {
        ...(query?.type ? { type: query.type } : {}),
        ...(query?.status ? { status: query.status } : {}),
        ...(query?.classId ? { student: { classId: query.classId } } : {}),
      },
      include: {
        student: {
          include: {
            class: true,
          },
        },
        subject: true,
        studentResult: {
          include: {
            traces: {
              include: { subject: true },
            },
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async verifyCheckingItem(id: string, verificationNotes?: string) {
    return prisma.checkingItem.update({
      where: { id },
      data: {
        status: 'VERIFIED',
        verificationNotes: verificationNotes || null,
        verifiedAt: new Date(),
      },
      include: {
        student: {
          include: { class: true },
        },
        subject: true,
      },
    });
  }

  async rejectCheckingItem(id: string, verificationNotes?: string) {
    return prisma.checkingItem.update({
      where: { id },
      data: {
        status: 'REJECTED',
        verificationNotes: verificationNotes || null,
        verifiedAt: new Date(),
      },
      include: {
        student: {
          include: { class: true },
        },
        subject: true,
      },
    });
  }
}

export const checkingService = new CheckingService();
