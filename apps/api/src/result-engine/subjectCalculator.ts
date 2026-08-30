import {
  SubjectConfig,
  RawMarkInput,
  SubjectResultCalculation,
  RULE_CODES,
  PASS_MARKS,
} from '@school-result/shared';
import { getSubjectGradeAndPoint } from './gradeScale.js';

/**
 * Calculates subject grade, grade point, status, markUsed, and auditable trace
 * Rules applied:
 * - R-12: Absence handling (AB -> 0 GP, status AB, grade F)
 * - R-11: Component Pass/Fail validation
 *   - Practical subjects: Theory pass >= 25/75, Practical pass >= 8/25. If either fails -> F / 0 GP.
 *   - Theory-only subjects: Theory pass >= 33/100.
 */
export function calculateSubjectResult(
  subject: SubjectConfig,
  markInput: RawMarkInput
): SubjectResultCalculation {
  const isAbsent =
    markInput.isAbsent === true || markInput.status === 'ABSENT';

  // Rule R-12: Absence Handling
  if (isAbsent) {
    return {
      subjectCode: subject.code,
      subjectName: subject.name,
      isOptional: subject.isOptional,
      hasPractical: subject.hasPractical,
      theoryMarks: null,
      practicalMarks: null,
      totalMarks: null,
      markUsed: 0,
      status: 'AB',
      grade: 'F',
      gradePoint: 0.0,
      ruleCode: RULE_CODES.ABSENCE,
      ruleDescription: `Student was absent (AB) in ${subject.name} (${subject.code}). Awarded F / 0.00 GP under Rule R-12.`,
      isAbsent: true,
      theoryPassed: false,
      practicalPassed: false,
    };
  }

  // Rule R-11: Practical Subject calculation
  if (subject.hasPractical) {
    const theoryMarks = markInput.theoryMarks ?? 0;
    const practicalMarks = markInput.practicalMarks ?? 0;
    const theoryPassMark =
      subject.theoryPassMark ||
      PASS_MARKS.THEORY_PRACTICAL_SUBJECT.THEORY_PASS;
    const practicalPassMark =
      subject.practicalPassMark ||
      PASS_MARKS.THEORY_PRACTICAL_SUBJECT.PRACTICAL_PASS;
    const theoryMax =
      subject.theoryMaximum ||
      PASS_MARKS.THEORY_PRACTICAL_SUBJECT.THEORY_MAX;
    const practicalMax =
      subject.practicalMaximum ||
      PASS_MARKS.THEORY_PRACTICAL_SUBJECT.PRACTICAL_MAX;

    const theoryPassed = theoryMarks >= theoryPassMark;
    const practicalPassed = practicalMarks >= practicalPassMark;
    const totalMarks = theoryMarks + practicalMarks;

    // Both components must pass
    if (!theoryPassed && !practicalPassed) {
      return {
        subjectCode: subject.code,
        subjectName: subject.name,
        isOptional: subject.isOptional,
        hasPractical: true,
        theoryMarks,
        practicalMarks,
        totalMarks,
        markUsed: totalMarks,
        status: 'FAIL',
        grade: 'F',
        gradePoint: 0.0,
        ruleCode: RULE_CODES.COMPONENT_PASS_FAIL,
        ruleDescription: `Theory mark (${theoryMarks}/${theoryMax}) is below ${theoryPassMark} and practical mark (${practicalMarks}/${practicalMax}) is below ${practicalPassMark}. Both components failed. Result: F / 0.00 GP (Rule R-11).`,
        isAbsent: false,
        theoryPassed: false,
        practicalPassed: false,
      };
    }

    if (!theoryPassed) {
      return {
        subjectCode: subject.code,
        subjectName: subject.name,
        isOptional: subject.isOptional,
        hasPractical: true,
        theoryMarks,
        practicalMarks,
        totalMarks,
        markUsed: totalMarks,
        status: 'FAIL',
        grade: 'F',
        gradePoint: 0.0,
        ruleCode: RULE_CODES.COMPONENT_PASS_FAIL,
        ruleDescription: `Theory mark ${theoryMarks} is below the required pass mark of ${theoryPassMark} (Practical: ${practicalMarks}/${practicalMax}). Therefore this subject receives F / 0.00 grade point (Rule R-11).`,
        isAbsent: false,
        theoryPassed: false,
        practicalPassed: true,
      };
    }

    if (!practicalPassed) {
      return {
        subjectCode: subject.code,
        subjectName: subject.name,
        isOptional: subject.isOptional,
        hasPractical: true,
        theoryMarks,
        practicalMarks,
        totalMarks,
        markUsed: totalMarks,
        status: 'FAIL',
        grade: 'F',
        gradePoint: 0.0,
        ruleCode: RULE_CODES.COMPONENT_PASS_FAIL,
        ruleDescription: `Practical mark ${practicalMarks} is below the required pass mark of ${practicalPassMark} (Theory: ${theoryMarks}/${theoryMax}, Total: ${totalMarks}). Therefore this subject receives F / 0.00 grade point (Rule R-11).`,
        isAbsent: false,
        theoryPassed: true,
        practicalPassed: false,
      };
    }

    // Both passed -> markUsed = totalMarks
    const { grade, gradePoint } = getSubjectGradeAndPoint(totalMarks);
    const passed = gradePoint > 0;

    return {
      subjectCode: subject.code,
      subjectName: subject.name,
      isOptional: subject.isOptional,
      hasPractical: true,
      theoryMarks,
      practicalMarks,
      totalMarks,
      markUsed: totalMarks,
      status: passed ? 'PASS' : 'FAIL',
      grade,
      gradePoint,
      ruleCode: 'NORMAL',
      ruleDescription: `Theory (${theoryMarks}/${theoryMax}) and practical (${practicalMarks}/${practicalMax}) both passed. Total mark used: ${totalMarks}/100. Grade: ${grade} (${gradePoint.toFixed(2)} GP).`,
      isAbsent: false,
      theoryPassed: true,
      practicalPassed: true,
    };
  }

  // Rule R-11: Theory-Only Subject calculation
  const theoryMarks = markInput.theoryMarks ?? 0;
  const theoryPassMark =
    subject.theoryPassMark ||
    PASS_MARKS.THEORY_ONLY_SUBJECT.THEORY_PASS;
  const theoryMax =
    subject.theoryMaximum ||
    PASS_MARKS.THEORY_ONLY_SUBJECT.THEORY_MAX;
  const theoryPassed = theoryMarks >= theoryPassMark;

  if (!theoryPassed) {
    return {
      subjectCode: subject.code,
      subjectName: subject.name,
      isOptional: subject.isOptional,
      hasPractical: false,
      theoryMarks,
      practicalMarks: null,
      totalMarks: theoryMarks,
      markUsed: theoryMarks,
      status: 'FAIL',
      grade: 'F',
      gradePoint: 0.0,
      ruleCode: RULE_CODES.COMPONENT_PASS_FAIL,
      ruleDescription: `Theory mark ${theoryMarks} is below the required pass mark of ${theoryPassMark}/${theoryMax}. Therefore this subject receives F / 0.00 grade point (Rule R-11).`,
      isAbsent: false,
      theoryPassed: false,
      practicalPassed: true,
    };
  }

  const { grade, gradePoint } = getSubjectGradeAndPoint(theoryMarks);
  const passed = gradePoint > 0;

  return {
    subjectCode: subject.code,
    subjectName: subject.name,
    isOptional: subject.isOptional,
    hasPractical: false,
    theoryMarks,
    practicalMarks: null,
    totalMarks: theoryMarks,
    markUsed: theoryMarks,
    status: passed ? 'PASS' : 'FAIL',
    grade,
    gradePoint,
    ruleCode: 'NORMAL',
    ruleDescription: `Theory mark ${theoryMarks}/${theoryMax} passed. Grade: ${grade} (${gradePoint.toFixed(2)} GP).`,
    isAbsent: false,
    theoryPassed: true,
    practicalPassed: true,
  };
}
