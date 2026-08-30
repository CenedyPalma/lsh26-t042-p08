export const RULE_CODES = {
  FINAL_LETTER_GRADE: 'R-10',
  COMPONENT_PASS_FAIL: 'R-11',
  ABSENCE: 'R-12',
  GPA_CALCULATION: 'R-13',
  CHECKING_LIST: 'R-29',
} as const;

export const PASS_MARKS = {
  THEORY_PRACTICAL_SUBJECT: {
    THEORY_MAX: 75,
    THEORY_PASS: 25,
    PRACTICAL_MAX: 25,
    PRACTICAL_PASS: 8,
    TOTAL_MAX: 100,
  },
  THEORY_ONLY_SUBJECT: {
    THEORY_MAX: 100,
    THEORY_PASS: 33,
    TOTAL_MAX: 100,
  },
} as const;

export const GRADE_SCALE = [
  { minMark: 80, maxMark: 100, letterGrade: 'A+', gradePoint: 5.0 },
  { minMark: 70, maxMark: 79, letterGrade: 'A', gradePoint: 4.0 },
  { minMark: 60, maxMark: 69, letterGrade: 'A-', gradePoint: 3.5 },
  { minMark: 50, maxMark: 59, letterGrade: 'B', gradePoint: 3.0 },
  { minMark: 40, maxMark: 49, letterGrade: 'C', gradePoint: 2.0 },
  { minMark: 33, maxMark: 39, letterGrade: 'D', gradePoint: 1.0 },
  { minMark: 0, maxMark: 32, letterGrade: 'F', gradePoint: 0.0 },
] as const;

export const GPA_GRADE_BOUNDS = [
  { minGPA: 5.0, letterGrade: 'A+' },
  { minGPA: 4.0, letterGrade: 'A' },
  { minGPA: 3.5, letterGrade: 'A-' },
  { minGPA: 3.0, letterGrade: 'B' },
  { minGPA: 2.0, letterGrade: 'C' },
  { minGPA: 1.0, letterGrade: 'D' },
  { minGPA: 0.0, letterGrade: 'F' },
] as const;

export const DEFAULT_COMPULSORY_SUBJECT_CODES = [
  'BAN',
  'ENG',
  'MAT',
  'PHY',
  'CHE',
  'BIO',
] as const;

export const DEFAULT_OPTIONAL_SUBJECT_CODES = [
  'HMT',
  'AGR',
  'REL',
] as const;
