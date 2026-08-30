import { describe, it, expect } from 'vitest';
import {
  getSubjectGradeAndPoint,
  getFinalLetterGrade,
} from '../../src/result-engine/gradeScale.js';

describe('Grade Scale (R-10 & Mark Conversion)', () => {
  it('correctly maps marks to letter grades and grade points', () => {
    expect(getSubjectGradeAndPoint(95)).toEqual({ grade: 'A+', gradePoint: 5.0 });
    expect(getSubjectGradeAndPoint(80)).toEqual({ grade: 'A+', gradePoint: 5.0 });
    expect(getSubjectGradeAndPoint(79)).toEqual({ grade: 'A', gradePoint: 4.0 });
    expect(getSubjectGradeAndPoint(70)).toEqual({ grade: 'A', gradePoint: 4.0 });
    expect(getSubjectGradeAndPoint(69)).toEqual({ grade: 'A-', gradePoint: 3.5 });
    expect(getSubjectGradeAndPoint(60)).toEqual({ grade: 'A-', gradePoint: 3.5 });
    expect(getSubjectGradeAndPoint(59)).toEqual({ grade: 'B', gradePoint: 3.0 });
    expect(getSubjectGradeAndPoint(50)).toEqual({ grade: 'B', gradePoint: 3.0 });
    expect(getSubjectGradeAndPoint(49)).toEqual({ grade: 'C', gradePoint: 2.0 });
    expect(getSubjectGradeAndPoint(40)).toEqual({ grade: 'C', gradePoint: 2.0 });
    expect(getSubjectGradeAndPoint(39)).toEqual({ grade: 'D', gradePoint: 1.0 });
    expect(getSubjectGradeAndPoint(33)).toEqual({ grade: 'D', gradePoint: 1.0 });
    expect(getSubjectGradeAndPoint(32)).toEqual({ grade: 'F', gradePoint: 0.0 });
    expect(getSubjectGradeAndPoint(0)).toEqual({ grade: 'F', gradePoint: 0.0 });
  });

  it('Rule R-10: maps final GPA to final letter grade', () => {
    expect(getFinalLetterGrade(5.0, false)).toBe('A+');
    expect(getFinalLetterGrade(4.75, false)).toBe('A');
    expect(getFinalLetterGrade(4.0, false)).toBe('A');
    expect(getFinalLetterGrade(3.75, false)).toBe('A-');
    expect(getFinalLetterGrade(3.5, false)).toBe('A-');
    expect(getFinalLetterGrade(3.25, false)).toBe('B');
    expect(getFinalLetterGrade(3.0, false)).toBe('B');
    expect(getFinalLetterGrade(2.5, false)).toBe('C');
    expect(getFinalLetterGrade(2.0, false)).toBe('C');
    expect(getFinalLetterGrade(1.5, false)).toBe('D');
    expect(getFinalLetterGrade(1.0, false)).toBe('D');
    expect(getFinalLetterGrade(0.0, false)).toBe('F');
  });

  it('Rule R-10: returns F whenever there is a compulsory failure regardless of GPA value', () => {
    expect(getFinalLetterGrade(4.8, true)).toBe('F');
    expect(getFinalLetterGrade(5.0, true)).toBe('F');
    expect(getFinalLetterGrade(0.0, true)).toBe('F');
  });
});
