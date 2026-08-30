import { GRADE_SCALE, GPA_GRADE_BOUNDS } from '@school-result/shared';

export interface GradePointResult {
  grade: string;
  gradePoint: number;
}

/**
 * Calculates letter grade and grade point from a total mark out of 100
 */
export function getSubjectGradeAndPoint(markUsed: number): GradePointResult {
  if (markUsed < 0 || isNaN(markUsed)) {
    return { grade: 'F', gradePoint: 0.0 };
  }

  for (const scale of GRADE_SCALE) {
    if (markUsed >= scale.minMark && markUsed <= scale.maxMark) {
      return {
        grade: scale.letterGrade,
        gradePoint: scale.gradePoint,
      };
    }
  }

  // Fallback
  return { grade: 'F', gradePoint: 0.0 };
}

/**
 * Rule R-10: Calculates the final letter grade based on final GPA
 * If there is a compulsory failure, grade is unconditionally 'F'
 */
export function getFinalLetterGrade(
  finalGPA: number,
  hasCompulsoryFailure: boolean
): string {
  if (hasCompulsoryFailure || finalGPA <= 0.0) {
    return 'F';
  }

  for (const bound of GPA_GRADE_BOUNDS) {
    if (finalGPA >= bound.minGPA) {
      return bound.letterGrade;
    }
  }

  return 'F';
}
