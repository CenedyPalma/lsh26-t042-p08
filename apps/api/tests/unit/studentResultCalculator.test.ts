import { describe, it, expect } from 'vitest';
import { calculateStudentResult } from '../../src/result-engine/studentResultCalculator.js';
import { SubjectConfig } from '@school-result/shared';

describe('Student Result Calculator', () => {
  const subjects: SubjectConfig[] = [
    { name: 'Bangla', code: 'BAN', isOptional: false, hasPractical: false, theoryMaximum: 100, theoryPassMark: 33 },
    { name: 'English', code: 'ENG', isOptional: false, hasPractical: false, theoryMaximum: 100, theoryPassMark: 33 },
    { name: 'Mathematics', code: 'MAT', isOptional: false, hasPractical: false, theoryMaximum: 100, theoryPassMark: 33 },
    { name: 'Physics', code: 'PHY', isOptional: false, hasPractical: true, theoryMaximum: 75, theoryPassMark: 25, practicalMaximum: 25, practicalPassMark: 8 },
    { name: 'Chemistry', code: 'CHE', isOptional: false, hasPractical: true, theoryMaximum: 75, theoryPassMark: 25, practicalMaximum: 25, practicalPassMark: 8 },
    { name: 'Biology', code: 'BIO', isOptional: false, hasPractical: true, theoryMaximum: 75, theoryPassMark: 25, practicalMaximum: 25, practicalPassMark: 8 },
    { name: 'Higher Math', code: 'HMT', isOptional: true, hasPractical: true, theoryMaximum: 75, theoryPassMark: 25, practicalMaximum: 25, practicalPassMark: 8 },
  ];

  const compulsoryCodes = ['BAN', 'ENG', 'MAT', 'PHY', 'CHE', 'BIO'];

  it('calculates complete result with traces for a top student (A+ / GPA 5.00)', () => {
    const res = calculateStudentResult({
      studentId: 'S001',
      studentName: 'Top Student',
      className: 'Class 9',
      roll: 1,
      subjects,
      compulsoryCodes,
      optionalCode: 'HMT',
      marks: {
        BAN: 85,
        ENG: 82,
        MAT: 95,
        PHY: { theory: 65, practical: 24 }, // Total 89 -> 5.0
        CHE: { theory: 62, practical: 22 }, // Total 84 -> 5.0
        BIO: { theory: 60, practical: 25 }, // Total 85 -> 5.0
        HMT: { theory: 68, practical: 24 }, // Total 92 -> 5.0, Contrib = 3.0
      },
    });

    expect(res.gpaResult.overallResult).toBe('PASS');
    expect(res.gpaResult.compulsoryGradePointSum).toBe(30.0);
    expect(res.gpaResult.optionalGradePoint).toBe(5.0);
    expect(res.gpaResult.optionalContribution).toBe(3.0);
    expect(res.gpaResult.uncancelledGPA).toBe(5.0);
    expect(res.gpaResult.finalGPA).toBe(5.0);
    expect(res.gpaResult.finalLetterGrade).toBe('A+');
    expect(res.subjectResults.length).toBe(7);
    expect(res.checkingItems.length).toBe(0);
  });

  it('calculates complete result for student with practical fail in compulsory subject', () => {
    const res = calculateStudentResult({
      studentId: 'S002',
      studentName: 'Practical Fail Student',
      className: 'Class 9',
      roll: 2,
      subjects,
      compulsoryCodes,
      optionalCode: 'HMT',
      marks: {
        BAN: 85,
        ENG: 82,
        MAT: 95,
        PHY: { theory: 70, practical: 6 }, // Practical Fail!
        CHE: { theory: 62, practical: 22 },
        BIO: { theory: 60, practical: 25 },
        HMT: { theory: 68, practical: 24 },
      },
    });

    expect(res.gpaResult.overallResult).toBe('FAIL');
    expect(res.gpaResult.hasCompulsoryFailure).toBe(true);
    expect(res.gpaResult.finalGPA).toBe(0.0);
    expect(res.gpaResult.finalLetterGrade).toBe('F');
    expect(res.gpaResult.uncancelledGPA).toBe(4.67); // (25 + 3) / 6 = 4.67
    expect(res.checkingItems.some((i) => i.type === 'PRACTICAL_FAIL')).toBe(true);
  });
});
