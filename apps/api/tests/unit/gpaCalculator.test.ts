import { describe, it, expect } from 'vitest';
import { calculateGPA } from '../../src/result-engine/gpaCalculator.js';
import { SubjectResultCalculation, RULE_CODES } from '@school-result/shared';

describe('GPA Calculator (R-13 & R-10)', () => {
  const createMockSubject = (
    code: string,
    gradePoint: number,
    status: 'PASS' | 'FAIL' | 'AB' = 'PASS',
    isOptional = false
  ): SubjectResultCalculation => ({
    subjectCode: code,
    subjectName: code,
    isOptional,
    hasPractical: false,
    theoryMarks: 80,
    practicalMarks: null,
    totalMarks: 80,
    markUsed: 80,
    status,
    grade: gradePoint === 5 ? 'A+' : gradePoint === 0 ? 'F' : 'B',
    gradePoint,
    ruleCode: status === 'AB' ? RULE_CODES.ABSENCE : status === 'FAIL' ? RULE_CODES.COMPONENT_PASS_FAIL : 'NORMAL',
    ruleDescription: 'Mock trace',
    isAbsent: status === 'AB',
    theoryPassed: status === 'PASS',
    practicalPassed: status === 'PASS',
  });

  it('Test 7-11: Optional contribution calculation max(0, GP - 2)', () => {
    const compulsory = [
      createMockSubject('BAN', 5.0),
      createMockSubject('ENG', 5.0),
      createMockSubject('MAT', 5.0),
      createMockSubject('PHY', 5.0),
      createMockSubject('CHE', 5.0),
      createMockSubject('BIO', 5.0),
    ];

    // GP 5 -> Contribution 3
    const res5 = calculateGPA(compulsory, createMockSubject('HMT', 5.0, 'PASS', true));
    expect(res5.optionalContribution).toBe(3.0);
    expect(res5.uncancelledGPA).toBe(5.0); // (30 + 3) / 6 = 5.5 -> capped at 5.00
    expect(res5.finalGPA).toBe(5.0);
    expect(res5.finalLetterGrade).toBe('A+');

    // GP 4 -> Contribution 2
    const res4 = calculateGPA(compulsory, createMockSubject('HMT', 4.0, 'PASS', true));
    expect(res4.optionalContribution).toBe(2.0);

    // GP 3 -> Contribution 1
    const res3 = calculateGPA(compulsory, createMockSubject('HMT', 3.0, 'PASS', true));
    expect(res3.optionalContribution).toBe(1.0);

    // GP 2 -> Contribution 0
    const res2 = calculateGPA(compulsory, createMockSubject('HMT', 2.0, 'PASS', true));
    expect(res2.optionalContribution).toBe(0.0);

    // GP 1 -> Contribution 0
    const res1 = calculateGPA(compulsory, createMockSubject('HMT', 1.0, 'PASS', true));
    expect(res1.optionalContribution).toBe(0.0);

    // GP 0 -> Contribution 0
    const res0 = calculateGPA(compulsory, createMockSubject('HMT', 0.0, 'FAIL', true));
    expect(res0.optionalContribution).toBe(0.0);
  });

  it('Test 12: Compulsory AB results in Final GPA 0.00 and Final Grade F', () => {
    const compulsoryWithAB = [
      createMockSubject('BAN', 5.0),
      createMockSubject('ENG', 5.0),
      createMockSubject('MAT', 0.0, 'AB'), // Compulsory AB
      createMockSubject('PHY', 5.0),
      createMockSubject('CHE', 5.0),
      createMockSubject('BIO', 5.0),
    ];
    const optional = createMockSubject('HMT', 4.0, 'PASS', true);

    const res = calculateGPA(compulsoryWithAB, optional);
    expect(res.hasCompulsoryFailure).toBe(true);
    expect(res.uncancelledGPA).toBe(4.5); // (25 + 2) / 6 = 4.5
    expect(res.finalGPA).toBe(0.0);
    expect(res.finalLetterGrade).toBe('F');
    expect(res.overallResult).toBe('FAIL');
    expect(res.failedCompulsorySubjects).toContain('MAT');
  });

  it('Test 13: Optional AB does NOT fail student if all compulsory subjects pass', () => {
    const compulsory = [
      createMockSubject('BAN', 4.0),
      createMockSubject('ENG', 4.0),
      createMockSubject('MAT', 4.0),
      createMockSubject('PHY', 4.0),
      createMockSubject('CHE', 4.0),
      createMockSubject('BIO', 4.0),
    ];
    const optionalAB = createMockSubject('HMT', 0.0, 'AB', true);

    const res = calculateGPA(compulsory, optionalAB);
    expect(res.hasCompulsoryFailure).toBe(false);
    expect(res.optionalContribution).toBe(0.0);
    expect(res.uncancelledGPA).toBe(4.0); // 24 / 6 = 4.00
    expect(res.finalGPA).toBe(4.0);
    expect(res.finalLetterGrade).toBe('A');
    expect(res.overallResult).toBe('PASS');
  });

  it('Test 14: High uncancelled GPA + 1 compulsory failure forces final GPA 0.00 but preserves uncancelled GPA', () => {
    const compulsory = [
      createMockSubject('BAN', 5.0),
      createMockSubject('ENG', 5.0),
      createMockSubject('MAT', 4.0),
      createMockSubject('PHY', 5.0),
      createMockSubject('CHE', 4.0),
      createMockSubject('BIO', 0.0, 'FAIL'), // Failed Biology
    ];
    const optional = createMockSubject('HMT', 4.0, 'PASS', true); // Contrib = 2.0

    // Compulsory sum = 23, Optional contrib = 2, Total = 25 -> 25 / 6 = 4.17
    const res = calculateGPA(compulsory, optional);
    expect(res.uncancelledGPA).toBe(4.17);
    expect(res.hasCompulsoryFailure).toBe(true);
    expect(res.finalGPA).toBe(0.0);
    expect(res.finalLetterGrade).toBe('F');
    expect(res.overallResult).toBe('FAIL');
    expect(res.ruleDescription).toContain('uncancelled GPA is 4.17');
    expect(res.ruleDescription).toContain('forces the final GPA to 0.00');
  });
});
