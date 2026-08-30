import {
  SubjectConfig,
  MarkValue,
  RawMarkInput,
  StudentResultCalculation,
  SubjectResultCalculation,
} from '@school-result/shared';
import { calculateSubjectResult } from './subjectCalculator.js';
import { calculateGPA } from './gpaCalculator.js';
import { generateCheckingItems } from './checkingListGenerator.js';

export interface CalculateStudentResultInput {
  studentId: string;
  studentName: string;
  className: string;
  roll: number;
  subjects: SubjectConfig[];
  compulsoryCodes: string[];
  optionalCode: string;
  marks: Record<string, MarkValue>;
}

export function calculateStudentResult(
  input: CalculateStudentResultInput
): StudentResultCalculation {
  const subjectsMap = new Map<string, SubjectConfig>(
    input.subjects.map((s) => [s.code, s])
  );

  const subjectResults: SubjectResultCalculation[] = [];
  const compulsoryResults: SubjectResultCalculation[] = [];
  let optionalResult: SubjectResultCalculation | null = null;

  // Process all subjects in the student's mark sheet
  const allCodesToProcess = [
    ...input.compulsoryCodes,
    input.optionalCode,
  ];

  for (const code of allCodesToProcess) {
    const subject = subjectsMap.get(code);
    if (!subject) continue;

    const rawVal = input.marks[code];
    let markInput: RawMarkInput;

    if (rawVal === 'AB') {
      markInput = {
        subjectCode: code,
        status: 'ABSENT',
        isAbsent: true,
      };
    } else if (typeof rawVal === 'number') {
      markInput = {
        subjectCode: code,
        theoryMarks: rawVal,
        practicalMarks: null,
        status: 'PRESENT',
        isAbsent: false,
      };
    } else if (typeof rawVal === 'object' && rawVal !== null) {
      markInput = {
        subjectCode: code,
        theoryMarks: rawVal.theory,
        practicalMarks: rawVal.practical,
        status: 'PRESENT',
        isAbsent: false,
      };
    } else {
      // Missing or invalid -> treated as Absent / 0
      markInput = {
        subjectCode: code,
        theoryMarks: 0,
        practicalMarks: 0,
        status: 'PRESENT',
        isAbsent: false,
      };
    }

    const calculated = calculateSubjectResult(subject, markInput);
    subjectResults.push(calculated);

    if (input.compulsoryCodes.includes(code)) {
      compulsoryResults.push(calculated);
    } else if (code === input.optionalCode) {
      optionalResult = calculated;
    }
  }

  // Calculate GPA and Final Result
  const gpaResult = calculateGPA(compulsoryResults, optionalResult);

  // Generate Checking Items
  const checkingItems = generateCheckingItems(
    input.studentId,
    subjectResults,
    input.optionalCode
  );

  return {
    studentId: input.studentId,
    studentName: input.studentName,
    className: input.className,
    roll: input.roll,
    optionalSubjectCode: input.optionalCode,
    subjectResults,
    gpaResult,
    checkingItems,
  };
}
