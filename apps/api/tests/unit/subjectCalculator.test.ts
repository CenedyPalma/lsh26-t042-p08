import { describe, it, expect } from 'vitest';
import { calculateSubjectResult } from '../../src/result-engine/subjectCalculator.js';
import { SubjectConfig, RULE_CODES } from '@school-result/shared';

describe('Subject Calculator (R-11 & R-12)', () => {
  const practicalSubject: SubjectConfig = {
    name: 'Physics',
    code: 'PHY',
    isOptional: false,
    hasPractical: true,
    theoryMaximum: 75,
    theoryPassMark: 25,
    practicalMaximum: 25,
    practicalPassMark: 8,
  };

  const theoryOnlySubject: SubjectConfig = {
    name: 'Bangla',
    code: 'BAN',
    isOptional: false,
    hasPractical: false,
    theoryMaximum: 100,
    theoryPassMark: 33,
  };

  it('Test 1: Normal passing student in practical subject', () => {
    const result = calculateSubjectResult(practicalSubject, {
      subjectCode: 'PHY',
      theoryMarks: 60,
      practicalMarks: 20,
    });
    expect(result.status).toBe('PASS');
    expect(result.totalMarks).toBe(80);
    expect(result.markUsed).toBe(80);
    expect(result.grade).toBe('A+');
    expect(result.gradePoint).toBe(5.0);
    expect(result.ruleCode).toBe('NORMAL');
  });

  it('Test 2: Theory exactly 25 (with passing practical)', () => {
    const result = calculateSubjectResult(practicalSubject, {
      subjectCode: 'PHY',
      theoryMarks: 25,
      practicalMarks: 8,
    });
    expect(result.status).toBe('PASS');
    expect(result.totalMarks).toBe(33);
    expect(result.grade).toBe('D');
    expect(result.gradePoint).toBe(1.0);
    expect(result.ruleCode).toBe('NORMAL');
  });

  it('Test 3: Theory 24 (theory failure despite passing practical)', () => {
    const result = calculateSubjectResult(practicalSubject, {
      subjectCode: 'PHY',
      theoryMarks: 24,
      practicalMarks: 20,
    });
    expect(result.status).toBe('FAIL');
    expect(result.totalMarks).toBe(44);
    expect(result.grade).toBe('F');
    expect(result.gradePoint).toBe(0.0);
    expect(result.ruleCode).toBe(RULE_CODES.COMPONENT_PASS_FAIL);
    expect(result.ruleDescription).toContain('below the required pass mark of 25');
  });

  it('Test 4: Practical exactly 8 (with passing theory)', () => {
    const result = calculateSubjectResult(practicalSubject, {
      subjectCode: 'PHY',
      theoryMarks: 50,
      practicalMarks: 8,
    });
    expect(result.status).toBe('PASS');
    expect(result.totalMarks).toBe(58);
    expect(result.grade).toBe('B');
    expect(result.gradePoint).toBe(3.0);
  });

  it('Test 5: Practical 7 (practical failure despite passing theory)', () => {
    const result = calculateSubjectResult(practicalSubject, {
      subjectCode: 'PHY',
      theoryMarks: 60,
      practicalMarks: 7,
    });
    expect(result.status).toBe('FAIL');
    expect(result.grade).toBe('F');
    expect(result.gradePoint).toBe(0.0);
    expect(result.ruleCode).toBe(RULE_CODES.COMPONENT_PASS_FAIL);
    expect(result.ruleDescription).toContain('below the required pass mark of 8');
  });

  it('Test 6: High combined total (76) but practical fail (6 < 8)', () => {
    const result = calculateSubjectResult(practicalSubject, {
      subjectCode: 'PHY',
      theoryMarks: 70,
      practicalMarks: 6,
    });
    expect(result.totalMarks).toBe(76);
    expect(result.status).toBe('FAIL');
    expect(result.grade).toBe('F');
    expect(result.gradePoint).toBe(0.0);
    expect(result.ruleCode).toBe(RULE_CODES.COMPONENT_PASS_FAIL);
  });

  it('Theory-only subject: 33 passes (D), 32 fails (F)', () => {
    const passResult = calculateSubjectResult(theoryOnlySubject, {
      subjectCode: 'BAN',
      theoryMarks: 33,
    });
    expect(passResult.status).toBe('PASS');
    expect(passResult.grade).toBe('D');
    expect(passResult.gradePoint).toBe(1.0);

    const failResult = calculateSubjectResult(theoryOnlySubject, {
      subjectCode: 'BAN',
      theoryMarks: 32,
    });
    expect(failResult.status).toBe('FAIL');
    expect(failResult.grade).toBe('F');
    expect(failResult.gradePoint).toBe(0.0);
    expect(failResult.ruleCode).toBe(RULE_CODES.COMPONENT_PASS_FAIL);
  });

  it('Absence Rule R-12: AB status yields F and 0 GP', () => {
    const absentResult = calculateSubjectResult(practicalSubject, {
      subjectCode: 'PHY',
      isAbsent: true,
      status: 'ABSENT',
    });
    expect(absentResult.status).toBe('AB');
    expect(absentResult.grade).toBe('F');
    expect(absentResult.gradePoint).toBe(0.0);
    expect(absentResult.markUsed).toBe(0);
    expect(absentResult.ruleCode).toBe(RULE_CODES.ABSENCE);
  });
});
