import { z } from 'zod';
import { RULE_CODES } from './constants.js';

export type SubjectStatus = 'PRESENT' | 'ABSENT';
export type ResultStatus = 'PASS' | 'FAIL';
export type CheckingType = 'OPTIONAL' | 'PRACTICAL_FAIL' | 'ABSENT';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type RuleCode = (typeof RULE_CODES)[keyof typeof RULE_CODES] | 'NORMAL' | 'VALIDATION_ERROR';

export interface SubjectConfig {
  id?: string;
  name: string;
  code: string;
  isOptional: boolean;
  hasPractical: boolean;
  theoryMaximum: number;
  theoryPassMark: number;
  practicalMaximum?: number | null;
  practicalPassMark?: number | null;
}

export type MarkValue = number | { theory: number; practical: number } | 'AB';

export interface RawMarkInput {
  subjectCode: string;
  theoryMarks?: number | null;
  practicalMarks?: number | null;
  status?: SubjectStatus;
  isAbsent?: boolean;
}

export interface SubjectResultCalculation {
  subjectCode: string;
  subjectName: string;
  isOptional: boolean;
  hasPractical: boolean;
  theoryMarks: number | null;
  practicalMarks: number | null;
  totalMarks: number | null;
  markUsed: number | null;
  status: 'PASS' | 'FAIL' | 'AB';
  grade: string;
  gradePoint: number;
  ruleCode: RuleCode;
  ruleDescription: string;
  isAbsent: boolean;
  theoryPassed: boolean;
  practicalPassed: boolean;
}

export interface GPAResultCalculation {
  compulsoryGradePoints: { subjectCode: string; gradePoint: number }[];
  compulsoryGradePointSum: number;
  optionalGradePoint: number;
  optionalContribution: number;
  uncancelledGPA: number;
  hasCompulsoryFailure: boolean;
  failedCompulsorySubjects: string[];
  finalGPA: number;
  finalLetterGrade: string;
  overallResult: ResultStatus;
  ruleCode: RuleCode;
  ruleDescription: string;
}

export interface CheckingItemCalculation {
  studentId: string;
  subjectCode?: string;
  type: CheckingType;
  reason: string;
  ruleCode: string;
  status: VerificationStatus;
}

export interface StudentResultCalculation {
  studentId: string;
  studentName: string;
  className: string;
  roll: number;
  optionalSubjectCode: string;
  subjectResults: SubjectResultCalculation[];
  gpaResult: GPAResultCalculation;
  checkingItems: CheckingItemCalculation[];
}

export interface StudentSubjectMarkDTO {
  id: string;
  studentId: string;
  subjectId: string;
  theoryMarks: number | null;
  practicalMarks: number | null;
  status: SubjectStatus;
  isAbsent: boolean;
  subject: {
    id: string;
    name: string;
    code: string;
    isOptional: boolean;
    hasPractical: boolean;
  };
}

export interface ResultTraceDTO {
  id: string;
  studentResultId: string;
  subjectId: string;
  theoryMarks: number | null;
  practicalMarks: number | null;
  totalMarks: number | null;
  markUsed: number | null;
  grade: string;
  gradePoint: number;
  status: string;
  ruleCode: string;
  ruleDescription: string;
  subject: {
    id: string;
    name: string;
    code: string;
    isOptional: boolean;
    hasPractical: boolean;
  };
}

export interface CheckingItemDTO {
  id: string;
  studentId: string;
  studentResultId: string;
  subjectId: string | null;
  type: CheckingType;
  reason: string;
  status: VerificationStatus;
  verificationNotes: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    studentId: string;
    roll: number;
    name: string;
    class: {
      id: string;
      name: string;
    };
  };
  subject?: {
    id: string;
    name: string;
    code: string;
  } | null;
}

export interface StudentResultDTO {
  id: string;
  studentId: string;
  compulsoryGradePointSum: number;
  optionalGradePoint: number;
  optionalContribution: number;
  uncancelledGPA: number;
  finalGPA: number;
  finalLetterGrade: string;
  overallResult: ResultStatus;
  calculationVersion: number;
  calculatedAt: string;
  updatedAt: string;
  traces: ResultTraceDTO[];
  checkingItems: CheckingItemDTO[];
}

export interface StudentDTO {
  id: string;
  studentId: string;
  roll: number;
  name: string;
  classId: string;
  class: {
    id: string;
    name: string;
    academicYear: string;
  };
  marks: StudentSubjectMarkDTO[];
  result?: StudentResultDTO | null;
  checkingItems?: CheckingItemDTO[];
}

export interface ClassDTO {
  id: string;
  name: string;
  academicYear: string;
  _count?: {
    students: number;
  };
}

export interface DashboardStatsDTO {
  totalStudents: number;
  totalClasses: number;
  passedCount: number;
  failedCount: number;
  passPercentage: number;
  averageGPA: number;
  highestGPA: number;
  absentCount: number;
  practicalFailCount: number;
  optionalReviewCount: number;
  gradeDistribution: Record<string, number>;
  pendingVerifications: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}
