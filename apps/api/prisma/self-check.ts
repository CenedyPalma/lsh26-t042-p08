import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function runSelfCheck() {
  console.log('🔍 Running Result Engine & Dataset Self-Check...');
  let passedAssertions = 0;
  let failedAssertions = 0;

  function assert(condition: boolean, description: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${description}`);
      passedAssertions++;
    } else {
      console.error(`  ❌ FAIL: ${description}`);
      failedAssertions++;
    }
  }

  // 1. Check Student & Class count
  const studentCount = await prisma.student.count();
  const classCount = await prisma.class.count();
  assert(studentCount >= 60, `Students >= 60 (Found: ${studentCount})`);
  assert(classCount >= 2, `Classes >= 2 (Found: ${classCount})`);

  // 2. Check Subject Counts per student
  const studentsWithMarks = await prisma.student.findMany({
    include: {
      marks: {
        include: { subject: true },
      },
      result: {
        include: {
          traces: {
            include: { subject: true },
          },
        },
      },
      checkingItems: true,
    },
  });

  let allHave7Marks = true;
  let allHave6Compulsory = true;
  let allHave1Optional = true;

  for (const s of studentsWithMarks) {
    const compCount = s.marks.filter((m) => !m.subject.isOptional).length;
    const optCount = s.marks.filter((m) => m.subject.isOptional).length;
    if (s.marks.length !== 7) allHave7Marks = false;
    if (compCount !== 6) allHave6Compulsory = false;
    if (optCount !== 1) allHave1Optional = false;
  }

  assert(allHave7Marks, 'Every student has exactly 7 subjects');
  assert(allHave6Compulsory, 'Every student has exactly 6 compulsory subjects');
  assert(allHave1Optional, 'Every student has exactly 1 optional subject');

  // 3. Verify Edge Case 1: High average + compulsory failure
  const edge1 = studentsWithMarks.find((s) => s.studentId === 'S-EDGE-01');
  assert(
    !!edge1 &&
      !!edge1.result &&
      edge1.result.uncancelledGPA > 4.0 &&
      edge1.result.finalGPA === 0.0 &&
      edge1.result.finalLetterGrade === 'F' &&
      edge1.result.overallResult === 'FAIL',
    'Edge Case 1: High average + compulsory failure (Uncancelled GPA > 4, Final GPA 0.00, Grade F)'
  );

  // 4. Verify Edge Case 2: Practical fail (Theory 60, Practical 7)
  const edge2 = studentsWithMarks.find((s) => s.studentId === 'S-EDGE-02');
  const edge2PhyTrace = edge2?.result?.traces.find((t) => t.subject.code === 'PHY');
  assert(
    !!edge2PhyTrace &&
      edge2PhyTrace.practicalMarks === 7 &&
      edge2PhyTrace.grade === 'F' &&
      edge2PhyTrace.gradePoint === 0.0 &&
      edge2PhyTrace.ruleCode === 'R-11',
    'Edge Case 2: Practical fail (Theory 60, Practical 7 -> F, 0 GP, Rule R-11)'
  );

  // 5. Verify Edge Case 3: Practical fail high total (Theory 70, Practical 6, Total 76)
  const edge3 = studentsWithMarks.find((s) => s.studentId === 'S-EDGE-03');
  const edge3PhyTrace = edge3?.result?.traces.find((t) => t.subject.code === 'PHY');
  assert(
    !!edge3PhyTrace &&
      edge3PhyTrace.totalMarks === 76 &&
      edge3PhyTrace.practicalMarks === 6 &&
      edge3PhyTrace.grade === 'F' &&
      edge3PhyTrace.gradePoint === 0.0 &&
      edge3PhyTrace.ruleCode === 'R-11',
    'Edge Case 3: Practical fail despite high total 76 (Theory 70, Practical 6 -> F, 0 GP, Rule R-11)'
  );

  // 6. Verify Edge Case 4: Theory fail passing practical (Theory 24, Practical 20, Total 44)
  const edge4 = studentsWithMarks.find((s) => s.studentId === 'S-EDGE-04');
  const edge4PhyTrace = edge4?.result?.traces.find((t) => t.subject.code === 'PHY');
  assert(
    !!edge4PhyTrace &&
      edge4PhyTrace.theoryMarks === 24 &&
      edge4PhyTrace.practicalMarks === 20 &&
      edge4PhyTrace.grade === 'F' &&
      edge4PhyTrace.gradePoint === 0.0 &&
      edge4PhyTrace.ruleCode === 'R-11',
    'Edge Case 4: Theory fail passing practical (Theory 24, Practical 20 -> F, 0 GP, Rule R-11)'
  );

  // 7. Verify Edge Case 5: Optional GP exactly 2.00
  const edge5 = studentsWithMarks.find((s) => s.studentId === 'S-EDGE-05');
  assert(
    !!edge5 &&
      !!edge5.result &&
      edge5.result.optionalGradePoint === 2.0 &&
      edge5.result.optionalContribution === 0.0 &&
      edge5.checkingItems.some((c) => c.type === 'OPTIONAL'),
    'Edge Case 5: Optional GP exactly 2.00 -> Contribution 0.00 and on Optional Checking List'
  );

  // 8. Verify Edge Case 6: Optional GP below 2.00 (GP 1.00)
  const edge6 = studentsWithMarks.find((s) => s.studentId === 'S-EDGE-06');
  assert(
    !!edge6 &&
      !!edge6.result &&
      edge6.result.optionalGradePoint === 1.0 &&
      edge6.result.optionalContribution === 0.0 &&
      edge6.checkingItems.some((c) => c.type === 'OPTIONAL'),
    'Edge Case 6: Optional GP below 2.00 (GP 1.00) -> Contribution 0.00 and on Optional Checking List'
  );

  // 9. Verify Edge Case 7: Compulsory AB
  const edge7 = studentsWithMarks.find((s) => s.studentId === 'S-EDGE-07');
  assert(
    !!edge7 &&
      !!edge7.result &&
      edge7.result.finalGPA === 0.0 &&
      edge7.result.finalLetterGrade === 'F' &&
      edge7.result.overallResult === 'FAIL' &&
      edge7.checkingItems.some((c) => c.type === 'ABSENT'),
    'Edge Case 7: Compulsory AB -> Final GPA 0.00, Grade F, on Absent Checking List'
  );

  // 10. Verify Edge Case 8: Optional AB
  const edge8 = studentsWithMarks.find((s) => s.studentId === 'S-EDGE-08');
  assert(
    !!edge8 &&
      !!edge8.result &&
      edge8.result.optionalContribution === 0.0 &&
      edge8.result.overallResult === 'PASS' &&
      edge8.result.finalGPA > 0 &&
      edge8.checkingItems.some((c) => c.type === 'OPTIONAL') &&
      edge8.checkingItems.some((c) => c.type === 'ABSENT'),
    'Edge Case 8: Optional AB -> Contribution 0.00, Passes overall, on Optional & Absent lists'
  );

  // 11. Verify Edge Case 9: Multi-List Member
  const edge9 = studentsWithMarks.find((s) => s.studentId === 'S-EDGE-09');
  const edge9Types = edge9?.checkingItems.map((c) => c.type) || [];
  assert(
    edge9Types.includes('OPTIONAL') &&
      edge9Types.includes('PRACTICAL_FAIL') &&
      edge9Types.includes('ABSENT'),
    'Edge Case 9: Multi-list member appears on all 3 checking lists (OPTIONAL, PRACTICAL_FAIL, ABSENT)'
  );

  // 12. Check traces completeness
  let allTracesComplete = true;
  for (const s of studentsWithMarks) {
    if (!s.result || s.result.traces.length !== 7) {
      allTracesComplete = false;
    }
  }
  assert(allTracesComplete, 'Every student has exactly 7 auditable subject traces');

  // 13. Summary Report
  console.log('\n📊 Self-Check Summary:');
  console.log(`  Passed: ${passedAssertions}`);
  console.log(`  Failed: ${failedAssertions}`);

  if (failedAssertions > 0) {
    console.error('❌ Self-check failed!');
    process.exit(1);
  } else {
    console.log('✨ All self-check assertions passed with 100% compliance!\n');
  }
}

runSelfCheck()
  .catch((e) => {
    console.error('Self check error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
