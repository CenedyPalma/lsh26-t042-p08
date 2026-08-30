import {
  SubjectResultCalculation,
  GPAResultCalculation,
  RULE_CODES,
} from '@school-result/shared';
import { getFinalLetterGrade } from './gradeScale';

/**
 * Calculates GPA from compulsory subjects and 1 optional subject
 * Rules applied:
 * - R-13: Optional contribution = max(0, optionalGP - 2)
 * - R-13: Uncancelled GPA = (sum(compulsoryGP) + optionalContribution) / 6, max 5.00
 * - R-13: Compulsory Failure Override: Any failed/AB compulsory subject forces final GPA 0.00 and F,
 *         while preserving uncancelled GPA
 * - R-10: Final letter grade from final GPA
 */
export function calculateGPA(
  compulsoryResults: SubjectResultCalculation[],
  optionalResult?: SubjectResultCalculation | null
): GPAResultCalculation {
  const compulsoryGradePoints = compulsoryResults.map((r) => ({
    subjectCode: r.subjectCode,
    gradePoint: r.gradePoint,
  }));

  const compulsoryGradePointSum = Number(
    compulsoryGradePoints
      .reduce((sum, item) => sum + item.gradePoint, 0)
      .toFixed(2)
  );

  const optionalGradePoint = optionalResult ? optionalResult.gradePoint : 0;
  // Rule R-13: Optional contribution
  const optionalContribution = Number(
    Math.max(0, optionalGradePoint - 2).toFixed(2)
  );

  // Rule R-13: Uncancelled GPA (divided by 6 compulsory subjects, capped at 5.00)
  const rawGPA = (compulsoryGradePointSum + optionalContribution) / 6;
  const uncancelledGPA = Math.min(5.0, Number(rawGPA.toFixed(2)));

  // Identify failed compulsory subjects
  const failedCompulsorySubjects = compulsoryResults
    .filter(
      (r) => r.gradePoint === 0 || r.status === 'FAIL' || r.status === 'AB'
    )
    .map((r) => r.subjectName || r.subjectCode);

  const hasCompulsoryFailure = failedCompulsorySubjects.length > 0;

  if (hasCompulsoryFailure) {
    return {
      compulsoryGradePoints,
      compulsoryGradePointSum,
      optionalGradePoint,
      optionalContribution,
      uncancelledGPA,
      hasCompulsoryFailure: true,
      failedCompulsorySubjects,
      finalGPA: 0.0,
      finalLetterGrade: 'F',
      overallResult: 'FAIL',
      ruleCode: RULE_CODES.GPA_CALCULATION,
      ruleDescription: `Student failed compulsory subject(s): ${failedCompulsorySubjects.join(
        ', '
      )}. The uncancelled GPA is ${uncancelledGPA.toFixed(
        2
      )}, but compulsory subject failure forces the final GPA to 0.00 and Final Grade F (Rule R-13).`,
    };
  }

  // All compulsory subjects passed
  const finalGPA = uncancelledGPA;
  const finalLetterGrade = getFinalLetterGrade(finalGPA, false);

  return {
    compulsoryGradePoints,
    compulsoryGradePointSum,
    optionalGradePoint,
    optionalContribution,
    uncancelledGPA,
    hasCompulsoryFailure: false,
    failedCompulsorySubjects: [],
    finalGPA,
    finalLetterGrade,
    overallResult: 'PASS',
    ruleCode: RULE_CODES.GPA_CALCULATION,
    ruleDescription: `All 6 compulsory subjects passed. Compulsory GP sum: ${compulsoryGradePointSum.toFixed(
      2
    )}, Optional GP: ${optionalGradePoint.toFixed(
      2
    )} (Contribution: ${optionalContribution.toFixed(
      2
    )}). Final GPA: ${finalGPA.toFixed(
      2
    )} (${finalLetterGrade}) under Rule R-13.`,
  };
}
