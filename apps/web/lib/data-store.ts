import {
  SubjectConfig,
  RawMarkInput,
  SubjectResultCalculation,
  DashboardStatsDTO,
  ClassDTO,
  StudentDTO,
  CheckingItemDTO,
  StudentResultDTO,
} from '@school-result/shared';
import {
  calculateSubjectResult,
  calculateGPA,
  generateCheckingItems,
} from './engine/index';

export interface InternalSubject {
  id: string;
  code: string;
  name: string;
  isOptional: boolean;
  hasPractical: boolean;
  theoryMaximum: number;
  theoryPassMark: number;
  practicalMaximum: number | null;
  practicalPassMark: number | null;
}

export interface InternalMark {
  id: string;
  studentId: string;
  subjectId: string;
  subject: InternalSubject;
  theoryMarks: number | null;
  practicalMarks: number | null;
  status: string;
  isAbsent: boolean;
}

export interface InternalTrace {
  id: string;
  subjectId: string;
  subject: InternalSubject;
  theoryMarks: number | null;
  practicalMarks: number | null;
  totalMarks: number | null;
  markUsed: number | null;
  grade: string;
  gradePoint: number;
  status: string;
  ruleCode: string;
  ruleDescription: string;
}

export interface InternalCheckingItem {
  id: string;
  studentId: string;
  subjectId: string | null;
  subject?: InternalSubject | null;
  student?: any;
  studentResult?: any;
  type: 'OPTIONAL' | 'PRACTICAL_FAIL' | 'ABSENT';
  reason: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verificationNotes?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
}

export interface InternalStudent {
  id: string;
  studentId: string;
  roll: number;
  name: string;
  classId: string;
  class: { id: string; name: string; academicYear: string };
  optionalCode: string;
  marks: InternalMark[];
  result?: {
    id: string;
    studentId: string;
    compulsoryGradePointSum: number;
    optionalGradePoint: number;
    optionalContribution: number;
    uncancelledGPA: number;
    finalGPA: number;
    finalLetterGrade: string;
    overallResult: 'PASS' | 'FAIL';
    calculationVersion: number;
    calculatedAt: string;
    traces: InternalTrace[];
  };
  checkingItems: InternalCheckingItem[];
}

export interface InternalClass {
  id: string;
  name: string;
  academicYear: string;
  _count: { students: number };
}

// Initial Static Raw Data Definitions
const RAW_SUBJECTS: InternalSubject[] = [
  { id: 'sub-ban', code: 'BAN', name: 'Bangla', isOptional: false, hasPractical: false, theoryMaximum: 100, theoryPassMark: 33, practicalMaximum: null, practicalPassMark: null },
  { id: 'sub-eng', code: 'ENG', name: 'English', isOptional: false, hasPractical: false, theoryMaximum: 100, theoryPassMark: 33, practicalMaximum: null, practicalPassMark: null },
  { id: 'sub-mat', code: 'MAT', name: 'Mathematics', isOptional: false, hasPractical: false, theoryMaximum: 100, theoryPassMark: 33, practicalMaximum: null, practicalPassMark: null },
  { id: 'sub-phy', code: 'PHY', name: 'Physics', isOptional: false, hasPractical: true, theoryMaximum: 75, theoryPassMark: 25, practicalMaximum: 25, practicalPassMark: 8 },
  { id: 'sub-che', code: 'CHE', name: 'Chemistry', isOptional: false, hasPractical: true, theoryMaximum: 75, theoryPassMark: 25, practicalMaximum: 25, practicalPassMark: 8 },
  { id: 'sub-bio', code: 'BIO', name: 'Biology', isOptional: false, hasPractical: true, theoryMaximum: 75, theoryPassMark: 25, practicalMaximum: 25, practicalPassMark: 8 },
  { id: 'sub-hmt', code: 'HMT', name: 'Higher Mathematics', isOptional: true, hasPractical: true, theoryMaximum: 75, theoryPassMark: 25, practicalMaximum: 25, practicalPassMark: 8 },
  { id: 'sub-agr', code: 'AGR', name: 'Agriculture', isOptional: true, hasPractical: true, theoryMaximum: 75, theoryPassMark: 25, practicalMaximum: 25, practicalPassMark: 8 },
  { id: 'sub-rel', code: 'REL', name: 'Religion', isOptional: true, hasPractical: false, theoryMaximum: 100, theoryPassMark: 33, practicalMaximum: null, practicalPassMark: null },
];

const RAW_CLASSES: InternalClass[] = [
  { id: 'cls-09', name: 'Class 9', academicYear: '2026', _count: { students: 49 } },
  { id: 'cls-10', name: 'Class 10', academicYear: '2026', _count: { students: 40 } },
];

class MemoryStore {
  subjects: InternalSubject[] = [...RAW_SUBJECTS];
  classes: InternalClass[] = [...RAW_CLASSES];
  students: InternalStudent[] = [];
  checkingItems: InternalCheckingItem[] = [];

  constructor() {
    this.initData();
  }

  private initData() {
    const studentList: InternalStudent[] = [];

    // Helper to generate marks
    const createMarks = (
      stId: string,
      optionalCode: string,
      markMap: Record<string, number | { theory: number; practical: number } | 'AB'>
    ): InternalMark[] => {
      return Object.entries(markMap).map(([code, val], idx) => {
        const sub = this.subjects.find((s) => s.code === code)!;
        if (val === 'AB') {
          return {
            id: `mark-${stId}-${idx}`,
            studentId: stId,
            subjectId: sub.id,
            subject: sub,
            theoryMarks: null,
            practicalMarks: null,
            status: 'ABSENT',
            isAbsent: true,
          };
        } else if (typeof val === 'number') {
          return {
            id: `mark-${stId}-${idx}`,
            studentId: stId,
            subjectId: sub.id,
            subject: sub,
            theoryMarks: val,
            practicalMarks: null,
            status: 'PRESENT',
            isAbsent: false,
          };
        } else {
          return {
            id: `mark-${stId}-${idx}`,
            studentId: stId,
            subjectId: sub.id,
            subject: sub,
            theoryMarks: val.theory,
            practicalMarks: val.practical,
            status: 'PRESENT',
            isAbsent: false,
          };
        }
      });
    };

    // 1. Regular 80 students (40 Class 9, 40 Class 10)
    const banglaNames = [
      'Kamal Begum', 'Farhana Akter', 'Rahim Uddin', 'Sultana Razia', 'Tariqul Islam',
      'Nasrin Jahan', 'Abdur Rahman', 'Shamima Nasrin', 'Habibur Rahman', 'Khadija Khatun',
      'Mahmudul Hasan', 'Roksana Parvin', 'Shahadat Hossain', 'Sabina Yasmin', 'Mizanur Rahman',
      'Sharmin Sultana', 'Ashraful Islam', 'Tahmina Akter', 'Enamul Haque', 'Zannatul Ferdous',
      'Mostafizur Rahman', 'Fatema Tuz Zohra', 'Delwar Hossain', 'Salma Begum', 'Rezaul Karim',
      'Nargis Akter', 'Golam Mustafa', 'Laila Arjumand', 'Saidur Rahman', 'Farida Yasmin',
      'Monirul Islam', 'Ruma Akter', 'Shahidul Islam', 'Nahid Sultana', 'Harunur Rashid',
      'Nazma Begum', 'Anisur Rahman', 'Taslima Khatun', 'Babul Mia', 'Jesmin Akter'
    ];

    const optionals = ['HMT', 'AGR', 'REL'];

    // Generate 40 Class 9 students
    for (let i = 1; i <= 40; i++) {
      const sId = `S${String(i).padStart(3, '0')}`;
      const opt = optionals[(i - 1) % 3];
      const name = banglaNames[(i - 1) % banglaNames.length];
      const base = 50 + ((i * 7) % 40);

      const markMap: Record<string, any> = {
        BAN: Math.min(95, base + (i % 10)),
        ENG: Math.min(92, base + ((i * 3) % 12)),
        MAT: Math.min(98, base + ((i * 5) % 15)),
        PHY: { theory: Math.min(70, Math.floor(base * 0.7)), practical: 18 + (i % 7) },
        CHE: { theory: Math.min(68, Math.floor(base * 0.68)), practical: 19 + (i % 6) },
        BIO: { theory: Math.min(69, Math.floor(base * 0.69)), practical: 20 + (i % 5) },
      };

      if (opt === 'REL') {
        markMap['REL'] = Math.min(95, base + 8);
      } else if (opt === 'HMT') {
        markMap['HMT'] = { theory: Math.min(70, Math.floor(base * 0.72)), practical: 21 };
      } else {
        markMap['AGR'] = { theory: Math.min(65, Math.floor(base * 0.65)), practical: 22 };
      }

      studentList.push({
        id: `st-${sId}`,
        studentId: sId,
        roll: i,
        name,
        classId: 'cls-09',
        class: RAW_CLASSES[0],
        optionalCode: opt,
        marks: createMarks(`st-${sId}`, opt, markMap),
        checkingItems: [],
      });
    }

    // Generate 40 Class 10 students
    for (let i = 1; i <= 40; i++) {
      const sId = `S${String(40 + i).padStart(3, '0')}`;
      const opt = optionals[(i + 1) % 3];
      const name = banglaNames[(i + 5) % banglaNames.length] + ' (X)';
      const base = 48 + ((i * 9) % 42);

      const markMap: Record<string, any> = {
        BAN: Math.min(94, base + (i % 8)),
        ENG: Math.min(90, base + ((i * 2) % 10)),
        MAT: Math.min(96, base + ((i * 4) % 14)),
        PHY: { theory: Math.min(72, Math.floor(base * 0.71)), practical: 19 + (i % 6) },
        CHE: { theory: Math.min(67, Math.floor(base * 0.67)), practical: 20 + (i % 5) },
        BIO: { theory: Math.min(70, Math.floor(base * 0.7)), practical: 21 + (i % 4) },
      };

      if (opt === 'REL') {
        markMap['REL'] = Math.min(96, base + 6);
      } else if (opt === 'HMT') {
        markMap['HMT'] = { theory: Math.min(68, Math.floor(base * 0.68)), practical: 22 };
      } else {
        markMap['AGR'] = { theory: Math.min(66, Math.floor(base * 0.66)), practical: 23 };
      }

      studentList.push({
        id: `st-${sId}`,
        studentId: sId,
        roll: i,
        name,
        classId: 'cls-10',
        class: RAW_CLASSES[1],
        optionalCode: opt,
        marks: createMarks(`st-${sId}`, opt, markMap),
        checkingItems: [],
      });
    }

    // 2. The 9 Hard Edge Cases (Class 9 Rolls 41-49)
    const edgeCases = [
      {
        studentId: 'S-EDGE-01',
        name: 'Tanvir Hasan (Edge 1: High Avg + Compulsory Failure)',
        optional: 'HMT',
        marks: {
          BAN: 85,
          ENG: 85,
          MAT: 90,
          PHY: { theory: 65, practical: 23 },
          CHE: { theory: 62, practical: 22 },
          BIO: { theory: 24, practical: 22 }, // Theory fail (24 < 25)
          HMT: { theory: 65, practical: 23 },
        },
      },
      {
        studentId: 'S-EDGE-02',
        name: 'Nusrat Jahan (Edge 2: Practical Fail Passing Theory)',
        optional: 'AGR',
        marks: {
          BAN: 75,
          ENG: 70,
          MAT: 80,
          PHY: { theory: 60, practical: 7 }, // Practical fail (7 < 8)
          CHE: { theory: 55, practical: 20 },
          BIO: { theory: 58, practical: 22 },
          AGR: { theory: 60, practical: 20 },
        },
      },
      {
        studentId: 'S-EDGE-03',
        name: 'Fahim Rahman (Edge 3: Practical Fail High Total 76)',
        optional: 'HMT',
        marks: {
          BAN: 72,
          ENG: 68,
          MAT: 75,
          PHY: { theory: 70, practical: 6 }, // Practical fail 6 < 8, Total 76
          CHE: { theory: 58, practical: 21 },
          BIO: { theory: 60, practical: 22 },
          HMT: { theory: 65, practical: 24 },
        },
      },
      {
        studentId: 'S-EDGE-04',
        name: 'Sadia Sultana (Edge 4: Theory Fail Passing Practical)',
        optional: 'AGR',
        marks: {
          BAN: 70,
          ENG: 65,
          MAT: 72,
          PHY: { theory: 24, practical: 20 }, // Theory fail 24 < 25, Total 44
          CHE: { theory: 55, practical: 19 },
          BIO: { theory: 54, practical: 19 },
          AGR: { theory: 58, practical: 19 },
        },
      },
      {
        studentId: 'S-EDGE-05',
        name: 'Rifat Chowdhury (Edge 5: Optional GP Exactly 2.00)',
        optional: 'HMT',
        marks: {
          BAN: 75,
          ENG: 72,
          MAT: 80,
          PHY: { theory: 55, practical: 20 },
          CHE: { theory: 54, practical: 19 },
          BIO: { theory: 56, practical: 21 },
          HMT: { theory: 32, practical: 10 }, // Total 42 -> GP 2.00 (Contrib 0.00)
        },
      },
      {
        studentId: 'S-EDGE-06',
        name: 'Mehedi Hasan (Edge 6: Optional GP Below 2.00)',
        optional: 'AGR',
        marks: {
          BAN: 78,
          ENG: 74,
          MAT: 82,
          PHY: { theory: 58, practical: 22 },
          CHE: { theory: 56, practical: 21 },
          BIO: { theory: 60, practical: 22 },
          AGR: { theory: 26, practical: 9 }, // Total 35 -> GP 1.00 (Contrib 0.00)
        },
      },
      {
        studentId: 'S-EDGE-07',
        name: 'Anika Tabassum (Edge 7: Compulsory Absent AB)',
        optional: 'HMT',
        marks: {
          BAN: 80,
          ENG: 76,
          MAT: 'AB', // Compulsory AB
          PHY: { theory: 60, practical: 22 },
          CHE: { theory: 58, practical: 21 },
          BIO: { theory: 62, practical: 23 },
          HMT: { theory: 64, practical: 22 },
        },
      },
      {
        studentId: 'S-EDGE-08',
        name: 'Mahir Faisal (Edge 8: Optional Absent AB Passing Overall)',
        optional: 'AGR',
        marks: {
          BAN: 82,
          ENG: 78,
          MAT: 85,
          PHY: { theory: 62, practical: 23 },
          CHE: { theory: 60, practical: 22 },
          BIO: { theory: 65, practical: 24 },
          AGR: 'AB', // Optional AB (Contrib 0, passes overall)
        },
      },
      {
        studentId: 'S-EDGE-09',
        name: 'Zubair Hossain (Edge 9: Multi-List Member on all 3 lists)',
        optional: 'HMT',
        marks: {
          BAN: 70,
          ENG: 65,
          MAT: 'AB', // List 1: Absent
          PHY: { theory: 50, practical: 6 }, // List 2: Practical fail (6 < 8)
          CHE: { theory: 55, practical: 20 },
          BIO: { theory: 56, practical: 21 },
          HMT: { theory: 26, practical: 9 }, // List 3: Optional GP 1.00 (<= 2)
        },
      },
    ];

    edgeCases.forEach((edge, idx) => {
      const roll = 41 + idx;
      studentList.push({
        id: `st-${edge.studentId}`,
        studentId: edge.studentId,
        roll,
        name: edge.name,
        classId: 'cls-09',
        class: RAW_CLASSES[0],
        optionalCode: edge.optional,
        marks: createMarks(`st-${edge.studentId}`, edge.optional, edge.marks as any),
        checkingItems: [],
      });
    });

    this.students = studentList;
    this.recalculateAll();
  }

  recalculateAll() {
    const allChecking: InternalCheckingItem[] = [];

    const subjectMap = new Map<string, SubjectConfig>(
      this.subjects.map((s) => [
        s.id,
        {
          id: s.id,
          name: s.name,
          code: s.code,
          isOptional: s.isOptional,
          hasPractical: s.hasPractical,
          theoryMaximum: s.theoryMaximum,
          theoryPassMark: s.theoryPassMark,
          practicalMaximum: s.practicalMaximum,
          practicalPassMark: s.practicalPassMark,
        },
      ])
    );

    const subjectByCodeMap = new Map<string, SubjectConfig>(
      this.subjects.map((s) => [s.code, subjectMap.get(s.id)!])
    );

    for (const student of this.students) {
      const subjectResults: (SubjectResultCalculation & { subjectId: string })[] = [];
      const compulsoryResults: SubjectResultCalculation[] = [];
      let optionalResult: SubjectResultCalculation | null = null;
      let optionalSubjectCode = '';

      for (const mark of student.marks) {
        const config = subjectMap.get(mark.subjectId);
        if (!config) continue;

        const markInput: RawMarkInput = {
          subjectCode: config.code,
          theoryMarks: mark.theoryMarks,
          practicalMarks: mark.practicalMarks,
          status: mark.status as any,
          isAbsent: mark.isAbsent,
        };

        const calculated = calculateSubjectResult(config, markInput);
        subjectResults.push({ ...calculated, subjectId: mark.subjectId });

        if (!config.isOptional) {
          compulsoryResults.push(calculated);
        } else {
          optionalResult = calculated;
          optionalSubjectCode = config.code;
        }
      }

      const gpaResult = calculateGPA(compulsoryResults, optionalResult);
      const checkingCalculations = generateCheckingItems(
        student.id,
        subjectResults,
        optionalSubjectCode
      );

      const traces: InternalTrace[] = subjectResults.map((sr, idx) => {
        const sub = this.subjects.find((s) => s.id === sr.subjectId)!;
        return {
          id: `trace-${student.id}-${idx}`,
          subjectId: sr.subjectId,
          subject: sub,
          theoryMarks: sr.theoryMarks,
          practicalMarks: sr.practicalMarks,
          totalMarks: sr.totalMarks,
          markUsed: sr.markUsed,
          grade: sr.grade,
          gradePoint: sr.gradePoint,
          status: sr.status,
          ruleCode: sr.ruleCode,
          ruleDescription: sr.ruleDescription,
        };
      });

      const studentChecking: InternalCheckingItem[] = checkingCalculations.map(
        (ci, idx) => {
          const matchingSub = ci.subjectCode
            ? this.subjects.find((s) => s.code === ci.subjectCode)
            : null;
          return {
            id: `chk-${student.id}-${idx}`,
            studentId: student.id,
            subjectId: matchingSub ? matchingSub.id : null,
            subject: matchingSub,
            student: {
              id: student.id,
              studentId: student.studentId,
              name: student.name,
              roll: student.roll,
              class: student.class,
            },
            type: ci.type,
            reason: ci.reason,
            status: 'PENDING',
            verificationNotes: null,
            verifiedAt: null,
            createdAt: new Date().toISOString(),
          };
        }
      );

      student.result = {
        id: `res-${student.id}`,
        studentId: student.id,
        compulsoryGradePointSum: gpaResult.compulsoryGradePointSum,
        optionalGradePoint: gpaResult.optionalGradePoint,
        optionalContribution: gpaResult.optionalContribution,
        uncancelledGPA: gpaResult.uncancelledGPA,
        finalGPA: gpaResult.finalGPA,
        finalLetterGrade: gpaResult.finalLetterGrade,
        overallResult: gpaResult.overallResult,
        calculationVersion: 1,
        calculatedAt: new Date().toISOString(),
        traces,
      };

      student.checkingItems = studentChecking;
      allChecking.push(...studentChecking);
    }

    this.checkingItems = allChecking;
    return { calculatedCount: this.students.length };
  }

  getDashboardStats(): DashboardStatsDTO {
    const totalStudents = this.students.length;
    const passedCount = this.students.filter(
      (s) => s.result?.overallResult === 'PASS'
    ).length;
    const failedCount = totalStudents - passedCount;
    const passPercentage =
      totalStudents > 0 ? Number(((passedCount / totalStudents) * 100).toFixed(1)) : 0;

    const gpas = this.students.map((s) => s.result?.finalGPA || 0);
    const highestGPA = gpas.length > 0 ? Math.max(...gpas) : 0;
    const averageGPA =
      gpas.length > 0
        ? Number((gpas.reduce((acc, g) => acc + g, 0) / gpas.length).toFixed(2))
        : 0;

    const gradeDistribution: Record<string, number> = {
      'A+': 0,
      A: 0,
      'A-': 0,
      B: 0,
      C: 0,
      D: 0,
      F: 0,
    };

    for (const s of this.students) {
      const g = s.result?.finalLetterGrade || 'F';
      gradeDistribution[g] = (gradeDistribution[g] || 0) + 1;
    }

    const absentStudents = new Set(
      this.students
        .filter((s) => s.marks.some((m) => m.isAbsent || m.status === 'ABSENT'))
        .map((s) => s.id)
    );

    const practicalFailStudents = new Set(
      this.students
        .filter((s) =>
          s.marks.some(
            (m) =>
              m.subject.hasPractical &&
              m.practicalMarks !== null &&
              m.practicalMarks < 8
          )
        )
        .map((s) => s.id)
    );

    const optionalReviewStudents = new Set(
      this.checkingItems
        .filter((c) => c.type === 'OPTIONAL')
        .map((c) => c.studentId)
    );

    const pendingCount = this.checkingItems.filter((c) => c.status === 'PENDING').length;

    return {
      totalStudents,
      totalClasses: this.classes.length,
      passedCount,
      failedCount,
      passPercentage,
      averageGPA,
      highestGPA,
      absentCount: absentStudents.size,
      practicalFailCount: practicalFailStudents.size,
      optionalReviewCount: optionalReviewStudents.size,
      gradeDistribution,
      pendingVerifications: pendingCount,
    };
  }
}

// Global in-memory singleton
const globalStore = (globalThis as any).__SCHOOL_RESULT_STORE__ || new MemoryStore();
if (process.env.NODE_ENV !== 'production') {
  (globalThis as any).__SCHOOL_RESULT_STORE__ = globalStore;
}

export const memoryStore = globalStore;
