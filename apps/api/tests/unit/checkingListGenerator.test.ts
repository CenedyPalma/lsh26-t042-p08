import { describe, it, expect } from 'vitest';
import { generateCheckingItems } from '../../src/result-engine/checkingListGenerator.js';
import { SubjectResultCalculation } from '@school-result/shared';

describe('Checking List Generator (R-29)', () => {
  const createSubjectResult = (
    code: string,
    gradePoint: number,
    practicalMarks: number | null = null,
    isAbsent = false,
    isOptional = false
  ): SubjectResultCalculation => ({
    subjectCode: code,
    subjectName: code,
    isOptional,
    hasPractical: practicalMarks !== null,
    theoryMarks: isAbsent ? null : 50,
    practicalMarks: isAbsent ? null : practicalMarks,
    totalMarks: isAbsent ? null : 50 + (practicalMarks ?? 0),
    markUsed: isAbsent ? 0 : 50 + (practicalMarks ?? 0),
    status: isAbsent ? 'AB' : gradePoint > 0 ? 'PASS' : 'FAIL',
    grade: isAbsent ? 'F' : gradePoint === 5 ? 'A+' : gradePoint === 0 ? 'F' : 'C',
    gradePoint,
    ruleCode: isAbsent ? 'R-12' : gradePoint === 0 ? 'R-11' : 'NORMAL',
    ruleDescription: 'Mock description',
    isAbsent,
    theoryPassed: !isAbsent,
    practicalPassed: !isAbsent && (practicalMarks === null || practicalMarks >= 8),
  });

  it('Test 15: Student with Optional GP 1, Practical 6, and Compulsory AB appears on ALL THREE lists', () => {
    const subjectResults = [
      createSubjectResult('BAN', 4.0),
      createSubjectResult('ENG', 4.0),
      createSubjectResult('MAT', 0.0, null, true), // Compulsory AB
      createSubjectResult('PHY', 0.0, 6),          // Practical Fail (6 < 8)
      createSubjectResult('CHE', 4.0, 20),
      createSubjectResult('BIO', 4.0, 20),
      createSubjectResult('HMT', 1.0, 10, false, true), // Optional GP 1 (<= 2)
    ];

    const items = generateCheckingItems('S001', subjectResults, 'HMT');
    const types = items.map((i) => i.type);

    expect(types).toContain('OPTIONAL');
    expect(types).toContain('PRACTICAL_FAIL');
    expect(types).toContain('ABSENT');
    expect(items.length).toBe(3);
  });

  it('adds student to OPTIONAL list if optional GP is exactly 2.00', () => {
    const subjectResults = [
      createSubjectResult('BAN', 5.0),
      createSubjectResult('ENG', 5.0),
      createSubjectResult('MAT', 5.0),
      createSubjectResult('PHY', 5.0, 20),
      createSubjectResult('CHE', 5.0, 20),
      createSubjectResult('BIO', 5.0, 20),
      createSubjectResult('HMT', 2.0, 10, false, true), // Optional GP 2.00
    ];

    const items = generateCheckingItems('S002', subjectResults, 'HMT');
    expect(items.map((i) => i.type)).toEqual(['OPTIONAL']);
  });

  it('does NOT add student to checking lists if all criteria are clean and passing with high GP', () => {
    const subjectResults = [
      createSubjectResult('BAN', 5.0),
      createSubjectResult('ENG', 5.0),
      createSubjectResult('MAT', 5.0),
      createSubjectResult('PHY', 5.0, 20),
      createSubjectResult('CHE', 5.0, 20),
      createSubjectResult('BIO', 5.0, 20),
      createSubjectResult('HMT', 5.0, 20, false, true), // Optional GP 5.00
    ];

    const items = generateCheckingItems('S003', subjectResults, 'HMT');
    expect(items.length).toBe(0);
  });
});
