import {
  SubjectConfig,
  MarkValue,
  PASS_MARKS,
} from '@school-result/shared';

export interface ValidationErrorItem {
  field: string;
  message: string;
  code: string;
}

export interface StudentDataToValidate {
  studentId: string;
  name: string;
  className: string;
  roll: number;
  optionalSubjectCode: string;
  marks: Record<string, MarkValue>;
}

export function validateStudentMarksData(
  student: StudentDataToValidate,
  subjectsByCode: Map<string, SubjectConfig>,
  compulsoryCodes: string[]
): { valid: boolean; errors: ValidationErrorItem[] } {
  const errors: ValidationErrorItem[] = [];

  if (!student.studentId || student.studentId.trim() === '') {
    errors.push({
      field: 'studentId',
      message: 'Student ID is required.',
      code: 'MISSING_STUDENT_ID',
    });
  }

  if (typeof student.roll !== 'number' || student.roll <= 0) {
    errors.push({
      field: 'roll',
      message: 'Roll must be a positive integer.',
      code: 'INVALID_ROLL',
    });
  }

  if (!student.optionalSubjectCode) {
    errors.push({
      field: 'optionalSubjectCode',
      message: 'Optional subject is required.',
      code: 'MISSING_OPTIONAL_SUBJECT',
    });
  }

  // Validate compulsory subjects presence
  for (const compCode of compulsoryCodes) {
    if (!(compCode in student.marks)) {
      errors.push({
        field: `marks.${compCode}`,
        message: `Missing mark for compulsory subject: ${compCode}`,
        code: 'MISSING_COMPULSORY_SUBJECT',
      });
    }
  }

  // Validate optional subject presence
  if (
    student.optionalSubjectCode &&
    !(student.optionalSubjectCode in student.marks)
  ) {
    errors.push({
      field: `marks.${student.optionalSubjectCode}`,
      message: `Missing mark for optional subject: ${student.optionalSubjectCode}`,
      code: 'MISSING_OPTIONAL_MARK',
    });
  }

  // Validate individual subject marks
  for (const [code, val] of Object.entries(student.marks)) {
    const subject = subjectsByCode.get(code);
    if (!subject) {
      errors.push({
        field: `marks.${code}`,
        message: `Unknown subject code: ${code}`,
        code: 'UNKNOWN_SUBJECT',
      });
      continue;
    }

    if (val === 'AB') {
      // Valid absence
      continue;
    }

    if (typeof val === 'number') {
      if (subject.hasPractical) {
        errors.push({
          field: `marks.${code}`,
          message: `Subject ${code} requires theory and practical components, but received a single number.`,
          code: 'INVALID_MARK_FORMAT',
        });
      } else {
        const max =
          subject.theoryMaximum ||
          PASS_MARKS.THEORY_ONLY_SUBJECT.THEORY_MAX;
        if (val < 0 || val > max) {
          errors.push({
            field: `marks.${code}`,
            message: `Theory mark ${val} for subject ${code} must be between 0 and ${max}.`,
            code: 'MARK_OUT_OF_RANGE',
          });
        }
      }
    } else if (typeof val === 'object' && val !== null) {
      if (!subject.hasPractical) {
        errors.push({
          field: `marks.${code}`,
          message: `Subject ${code} is theory-only, but received practical marks.`,
          code: 'UNEXPECTED_PRACTICAL_MARK',
        });
      } else {
        const theoryMax =
          subject.theoryMaximum ||
          PASS_MARKS.THEORY_PRACTICAL_SUBJECT.THEORY_MAX;
        const practicalMax =
          subject.practicalMaximum ||
          PASS_MARKS.THEORY_PRACTICAL_SUBJECT.PRACTICAL_MAX;

        if (
          typeof val.theory !== 'number' ||
          val.theory < 0 ||
          val.theory > theoryMax
        ) {
          errors.push({
            field: `marks.${code}.theory`,
            message: `Theory mark ${val.theory} for subject ${code} must be between 0 and ${theoryMax}.`,
            code: 'THEORY_MARK_OUT_OF_RANGE',
          });
        }

        if (
          typeof val.practical !== 'number' ||
          val.practical < 0 ||
          val.practical > practicalMax
        ) {
          errors.push({
            field: `marks.${code}.practical`,
            message: `Practical mark ${val.practical} for subject ${code} must be between 0 and ${practicalMax}.`,
            code: 'PRACTICAL_MARK_OUT_OF_RANGE',
          });
        }
      }
    } else {
      errors.push({
        field: `marks.${code}`,
        message: `Invalid mark value for subject ${code}.`,
        code: 'INVALID_MARK_VALUE',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
