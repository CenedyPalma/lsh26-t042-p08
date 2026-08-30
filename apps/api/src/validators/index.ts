import { z } from 'zod';

export const verifyItemSchema = z.object({
  notes: z.string().optional(),
});

export const rejectItemSchema = z.object({
  notes: z.string().optional(),
});

export const checkingQuerySchema = z.object({
  type: z.enum(['OPTIONAL', 'PRACTICAL_FAIL', 'ABSENT']).optional(),
  status: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).optional(),
  classId: z.string().optional(),
});

export const classStudentsQuerySchema = z.object({
  search: z.string().optional(),
  resultStatus: z.enum(['PASS', 'FAIL']).optional(),
  letterGrade: z.string().optional(),
  flag: z.enum(['AB', 'PRACTICAL_FAIL', 'OPTIONAL_REVIEW']).optional(),
  sortBy: z.enum(['roll', 'name', 'gpa', 'grade']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
