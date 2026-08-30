import {
  SubjectResultCalculation,
  CheckingItemCalculation,
  RULE_CODES,
} from '@school-result/shared';

/**
 * Rule R-29: Generates checking list items for teacher verification
 * 1. OPTIONAL: Any student with optionalGradePoint <= 2 (GP 2, 1, 0, AB)
 * 2. PRACTICAL_FAIL: Any student with practicalMarks < 8 in ANY subject
 * 3. ABSENT: Any student marked AB in ANY subject
 *
 * Supports multi-list membership without deduplication across different list types.
 */
export function generateCheckingItems(
  studentId: string,
  subjectResults: SubjectResultCalculation[],
  optionalSubjectCode: string
): CheckingItemCalculation[] {
  const items: CheckingItemCalculation[] = [];

  // 1. Check Optional Subject (Rule R-29)
  const optionalResult = subjectResults.find(
    (s) => s.subjectCode === optionalSubjectCode || s.isOptional
  );

  if (optionalResult) {
    if (optionalResult.isAbsent) {
      items.push({
        studentId,
        subjectCode: optionalResult.subjectCode,
        type: 'OPTIONAL',
        reason: `Student was absent (AB) in optional subject ${optionalResult.subjectName} (${optionalResult.subjectCode}) with 0.00 GP.`,
        ruleCode: RULE_CODES.CHECKING_LIST,
        status: 'PENDING',
      });
    } else if (optionalResult.gradePoint <= 2.0) {
      items.push({
        studentId,
        subjectCode: optionalResult.subjectCode,
        type: 'OPTIONAL',
        reason: `Optional subject ${optionalResult.subjectName} (${
          optionalResult.subjectCode
        }) achieved ${optionalResult.gradePoint.toFixed(
          2
        )} GP (<= 2.00 threshold), contributing 0.00 to GPA. Requires verification.`,
        ruleCode: RULE_CODES.CHECKING_LIST,
        status: 'PENDING',
      });
    }
  }

  // 2. Check Practical Failures (Rule R-29 + R-11)
  for (const result of subjectResults) {
    if (
      result.hasPractical &&
      result.practicalMarks !== null &&
      result.practicalMarks < 8
    ) {
      items.push({
        studentId,
        subjectCode: result.subjectCode,
        type: 'PRACTICAL_FAIL',
        reason: `Practical mark ${result.practicalMarks} is below pass mark of 8 in ${
          result.subjectName
        } (${result.subjectCode}) [Theory: ${result.theoryMarks ?? 0}, Total: ${
          result.totalMarks ?? 0
        }]. Subject failed under Rule R-11.`,
        ruleCode: RULE_CODES.CHECKING_LIST,
        status: 'PENDING',
      });
    }
  }

  // 3. Check Absent Cases (Rule R-29 + R-12)
  for (const result of subjectResults) {
    if (result.isAbsent || result.status === 'AB') {
      items.push({
        studentId,
        subjectCode: result.subjectCode,
        type: 'ABSENT',
        reason: `Student was marked ABSENT in ${
          result.isOptional ? 'optional' : 'compulsory'
        } subject ${result.subjectName} (${result.subjectCode}). ${
          result.isOptional
            ? 'Requires manual verification.'
            : 'Resulted in automatic compulsory failure.'
        }`,
        ruleCode: RULE_CODES.CHECKING_LIST,
        status: 'PENDING',
      });
    }
  }

  return items;
}
