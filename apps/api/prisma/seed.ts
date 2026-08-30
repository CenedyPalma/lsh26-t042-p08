import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { resultService } from '../src/services/result.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

interface SampleSubject {
  code: string;
  name: string;
  practical: boolean;
}

interface SampleStudent {
  id: string;
  name: string;
  class: string;
  optional: string;
  marks: Record<string, number | { theory: number; practical: number } | 'AB'>;
}

interface SampleData {
  schema_version: string;
  problem_id: string;
  cases: {
    case_id: string;
    subjects: SampleSubject[];
    compulsory: string[];
    students: SampleStudent[];
  }[];
}

export async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  // Locate sample_data.json
  const samplePath = path.resolve(__dirname, '../../../sample_data.json');
  if (!fs.existsSync(samplePath)) {
    throw new Error(`sample_data.json not found at ${samplePath}`);
  }

  const rawJson = fs.readFileSync(samplePath, 'utf8');
  const sampleData: SampleData = JSON.parse(rawJson);
  const primaryCase = sampleData.cases[0];

  console.log(`📦 Loaded case: ${primaryCase.case_id} with ${primaryCase.students.length} students.`);

  // Clean existing records in correct order
  console.log('🧹 Cleaning existing data...');
  await prisma.checkingItem.deleteMany();
  await prisma.resultTrace.deleteMany();
  await prisma.studentResult.deleteMany();
  await prisma.studentSubjectMark.deleteMany();
  await prisma.student.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.class.deleteMany();

  // 1. Create Subjects
  console.log('📚 Creating subjects...');
  const subjectMap = new Map<string, string>(); // code -> id

  for (const s of primaryCase.subjects) {
    const isOptional = !primaryCase.compulsory.includes(s.code);
    const createdSubject = await prisma.subject.create({
      data: {
        code: s.code,
        name: s.name,
        isOptional,
        hasPractical: s.practical,
        theoryMaximum: s.practical ? 75 : 100,
        theoryPassMark: s.practical ? 25 : 33,
        practicalMaximum: s.practical ? 25 : null,
        practicalPassMark: s.practical ? 8 : null,
      },
    });
    subjectMap.set(s.code, createdSubject.id);
  }

  // 2. Create Classes
  console.log('🏫 Creating classes...');
  const classNames = Array.from(new Set(primaryCase.students.map((s) => s.class)));
  const classMap = new Map<string, string>(); // name -> id

  for (const name of classNames) {
    const createdClass = await prisma.class.create({
      data: {
        name,
        academicYear: '2026',
      },
    });
    classMap.set(name, createdClass.id);
  }

  // 3. Prepare Students & Roll numbers
  console.log('👨‍🎓 Creating students and authoritative raw marks...');
  const rollCounters = new Map<string, number>();

  // Process sample students from JSON
  for (const student of primaryCase.students) {
    const classId = classMap.get(student.class)!;
    const currentRoll = (rollCounters.get(student.class) || 0) + 1;
    rollCounters.set(student.class, currentRoll);

    const createdStudent = await prisma.student.create({
      data: {
        studentId: student.id,
        roll: currentRoll,
        name: student.name,
        classId,
      },
    });

    // Create Raw marks for this student
    for (const [code, markVal] of Object.entries(student.marks)) {
      const subjectId = subjectMap.get(code);
      if (!subjectId) continue;

      if (markVal === 'AB') {
        await prisma.studentSubjectMark.create({
          data: {
            studentId: createdStudent.id,
            subjectId,
            theoryMarks: null,
            practicalMarks: null,
            status: 'ABSENT',
            isAbsent: true,
          },
        });
      } else if (typeof markVal === 'number') {
        await prisma.studentSubjectMark.create({
          data: {
            studentId: createdStudent.id,
            subjectId,
            theoryMarks: markVal,
            practicalMarks: null,
            status: 'PRESENT',
            isAbsent: false,
          },
        });
      } else if (typeof markVal === 'object' && markVal !== null) {
        await prisma.studentSubjectMark.create({
          data: {
            studentId: createdStudent.id,
            subjectId,
            theoryMarks: markVal.theory,
            practicalMarks: markVal.practical,
            status: 'PRESENT',
            isAbsent: false,
          },
        });
      }
    }
  }

  // 4. Ensure Explicit 8 Edge Cases are Present with Dedicated Edge Case Students
  console.log('🧪 Inserting explicit deliberate edge-case students...');
  const class9Id = classMap.get('Class 9') || Array.from(classMap.values())[0];

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

  for (const edge of edgeCases) {
    const currentRoll = (rollCounters.get('Class 9') || 0) + 1;
    rollCounters.set('Class 9', currentRoll);

    const createdStudent = await prisma.student.create({
      data: {
        studentId: edge.studentId,
        roll: currentRoll,
        name: edge.name,
        classId: class9Id,
      },
    });

    for (const [code, markVal] of Object.entries(edge.marks)) {
      const subjectId = subjectMap.get(code);
      if (!subjectId) continue;

      if (markVal === 'AB') {
        await prisma.studentSubjectMark.create({
          data: {
            studentId: createdStudent.id,
            subjectId,
            theoryMarks: null,
            practicalMarks: null,
            status: 'ABSENT',
            isAbsent: true,
          },
        });
      } else if (typeof markVal === 'number') {
        await prisma.studentSubjectMark.create({
          data: {
            studentId: createdStudent.id,
            subjectId,
            theoryMarks: markVal,
            practicalMarks: null,
            status: 'PRESENT',
            isAbsent: false,
          },
        });
      } else if (typeof markVal === 'object' && markVal !== null) {
        await prisma.studentSubjectMark.create({
          data: {
            studentId: createdStudent.id,
            subjectId,
            theoryMarks: markVal.theory,
            practicalMarks: markVal.practical,
            status: 'PRESENT',
            isAbsent: false,
          },
        });
      }
    }
  }

  // 5. Run Centralized Recalculation Engine
  console.log('⚙️ Executing Result Engine to calculate all results, traces, and checking items...');
  const result = await resultService.recalculateAllResults();
  console.log(`✅ Calculated results for ${result.calculatedCount} students.`);

  console.log('🎉 Database seeding completed successfully!');
}

seedDatabase()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
