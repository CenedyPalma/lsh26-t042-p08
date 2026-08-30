import React from 'react';
import { StudentTraceResponse } from '../../services/api.service';
import { GradeBadge } from '../results/GradeBadge';
import { StatusBadge } from '../results/StatusBadge';
import { formatGPA } from '../../lib/utils';
import {
  Calculator,
  AlertTriangle,
  HelpCircle,
  BookOpen,
} from 'lucide-react';

interface CalculationTraceViewProps {
  traceData: StudentTraceResponse;
}

export function CalculationTraceView({ traceData }: CalculationTraceViewProps) {
  const { student, result, compulsoryTraces, optionalTrace, checkingItems } =
    traceData;

  const hasCompulsoryFailure = result.overallResult === 'FAIL';
  const failedCompulsorySubjects = compulsoryTraces.filter(
    (t) => t.gradePoint === 0 || t.status === 'FAIL' || t.status === 'AB'
  );

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="archivo-title text-xl text-zinc-950">{student.name}</h2>
              <StatusBadge status={result.overallResult} />
            </div>
            <p className="archivo-regular text-xs text-zinc-500 mt-1.5">
              Roll: <span className="font-semibold text-zinc-800">{student.roll}</span> &bull; Student ID:{' '}
              <span className="font-mono text-zinc-800">{student.studentId}</span> &bull; Class:{' '}
              <span className="font-semibold text-zinc-800">{student.class}</span>
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-zinc-50 p-3 rounded-lg border border-zinc-200">
            <div className="text-right">
              <div className="archivo-medium text-xs text-zinc-500">Uncancelled GPA</div>
              <div className="text-base font-mono font-bold text-zinc-800">
                {formatGPA(result.uncancelledGPA)}
              </div>
            </div>
            <div className="h-8 w-px bg-zinc-300" />
            <div className="text-right">
              <div className="archivo-medium text-xs text-zinc-500">Final GPA</div>
              <div className="text-lg font-mono font-extrabold text-zinc-950">
                {formatGPA(result.finalGPA)}
              </div>
            </div>
            <div className="h-8 w-px bg-zinc-300" />
            <div className="text-center">
              <div className="archivo-medium text-xs text-zinc-500">Final Grade</div>
              <GradeBadge grade={result.finalLetterGrade} size="lg" />
            </div>
          </div>
        </div>

        {/* Compulsory Failure Override Warning Banner */}
        {hasCompulsoryFailure && (
          <div className="mt-5 p-4 rounded-lg bg-zinc-50 border-2 border-zinc-950 text-zinc-950 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-zinc-950 mt-0.5 shrink-0" />
            <div className="text-xs leading-relaxed">
              <span className="archivo-bold">Rule R-13 Compulsory Failure Override: </span>
              This student has an uncancelled GPA of{' '}
              <span className="font-mono font-bold">{formatGPA(result.uncancelledGPA)}</span>, but failed{' '}
              {failedCompulsorySubjects.length} compulsory subject(s):{' '}
              <span className="font-semibold">
                {failedCompulsorySubjects.map((s) => s.subject.name).join(', ')}
              </span>
              . Under Rule R-13, a failure in any compulsory subject strictly forces the Final GPA to{' '}
              <span className="font-bold font-mono">0.00</span> and Final Grade to <span className="font-bold">F</span>.
            </div>
          </div>
        )}
      </div>

      {/* Subject Marksheet Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <h3 className="archivo-title text-sm text-zinc-950 flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-zinc-950" />
            <span>Subject Marks and Component Validations (Rules R-11 &amp; R-12)</span>
          </h3>
          <span className="archivo-regular text-xs text-zinc-500">
            Pass Marks: Theory 25/75, Practical 8/25 (or Theory 33/100)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-100 text-zinc-700 font-semibold border-b border-zinc-200">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-center">Theory (Max 75/100)</th>
                <th className="py-3 px-4 text-center">Practical (Max 25)</th>
                <th className="py-3 px-4 text-center">Mark Used</th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-4 text-center">GP</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Trace and Rule Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-xs">
              {traceData.traces.map((trace) => {
                const isFail = trace.gradePoint === 0;
                return (
                  <tr
                    key={trace.id}
                    className={`hover:bg-zinc-50 transition ${
                      isFail ? 'bg-zinc-50/70' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold text-zinc-950">
                      {trace.subject.name}
                      <span className="text-zinc-400 font-mono ml-1.5 font-normal">
                        ({trace.subject.code})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                          trace.subject.isOptional
                            ? 'bg-zinc-200 text-zinc-900 border border-zinc-300'
                            : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                        }`}
                      >
                        {trace.subject.isOptional ? 'Optional' : 'Compulsory'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {trace.status === 'AB' ? (
                        <span className="text-zinc-950 font-bold border-b border-zinc-950">AB</span>
                      ) : (
                        trace.theoryMarks ?? '-'
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {trace.subject.hasPractical ? (
                        trace.status === 'AB' ? (
                          <span className="text-zinc-950 font-bold border-b border-zinc-950">AB</span>
                        ) : trace.practicalMarks !== null && trace.practicalMarks < 8 ? (
                          <span className="text-zinc-950 font-bold bg-zinc-200 px-1.5 py-0.5 rounded border border-zinc-400">
                            {trace.practicalMarks} (&lt; 8)
                          </span>
                        ) : (
                          trace.practicalMarks ?? '-'
                        )
                      ) : (
                        <span className="text-zinc-400">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-zinc-950">
                      {trace.status === 'AB' ? 0 : trace.markUsed ?? '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <GradeBadge grade={trace.grade} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-zinc-900">
                      {formatGPA(trace.gradePoint)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={trace.status as any} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-950 flex items-center space-x-1.5">
                        <span className="bg-zinc-200 text-zinc-900 px-1.5 py-0.2 rounded text-[10px] font-mono border border-zinc-300">
                          {trace.ruleCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 mt-1 leading-snug">
                        {trace.ruleDescription}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Step-by-Step Calculation Engine Pipeline */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
        <h3 className="archivo-title text-sm text-zinc-950 mb-5 flex items-center space-x-2">
          <Calculator className="w-4 h-4 text-zinc-950" />
          <span>Step-by-Step GPA Derivation Pipeline (Rules R-10, R-11, R-12, R-13)</span>
        </h3>

        <div className="space-y-4 text-xs">
          {/* Step 1: Compulsory Grade Points Sum */}
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200">
            <div className="flex items-center justify-between">
              <span className="archivo-subtitle text-xs text-zinc-950 flex items-center space-x-2.5">
                <span className="w-5 h-5 rounded bg-zinc-950 text-white text-[11px] flex items-center justify-center font-mono">
                  1
                </span>
                <span>Compulsory Subject Grade Points Sum</span>
              </span>
              <span className="font-mono font-bold text-sm text-zinc-950">
                {formatGPA(result.compulsoryGradePointSum)}
              </span>
            </div>
            <div className="mt-2 text-xs text-zinc-600 pl-7">
              Formula:{' '}
              <span className="font-mono font-medium text-zinc-800">
                {compulsoryTraces.map((t) => `${t.subject.code}(${formatGPA(t.gradePoint)})`).join(' + ')} ={' '}
                {formatGPA(result.compulsoryGradePointSum)}
              </span>
            </div>
          </div>

          {/* Step 2: Optional Subject Contribution Formula */}
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200">
            <div className="flex items-center justify-between">
              <span className="archivo-subtitle text-xs text-zinc-950 flex items-center space-x-2.5">
                <span className="w-5 h-5 rounded bg-zinc-950 text-white text-[11px] flex items-center justify-center font-mono">
                  2
                </span>
                <span>Optional Subject Contribution (Rule R-13)</span>
              </span>
              <span className="font-mono font-bold text-sm text-zinc-950">
                +{formatGPA(result.optionalContribution)} GP
              </span>
            </div>
            <div className="mt-2 text-xs text-zinc-600 pl-7">
              Optional Subject:{' '}
              <span className="font-semibold text-zinc-900">
                {optionalTrace?.subject.name} ({optionalTrace?.subject.code})
              </span>{' '}
              with Grade Point = <span className="font-mono font-bold text-zinc-950">{formatGPA(result.optionalGradePoint)}</span>.
              <br />
              Rule R-13 Calculation:{' '}
              <span className="font-mono font-semibold text-zinc-950">
                max(0, OptionalGP - 2.00) = max(0, {formatGPA(result.optionalGradePoint)} - 2.00) ={' '}
                {formatGPA(result.optionalContribution)}
              </span>
            </div>
          </div>

          {/* Step 3: Uncancelled GPA */}
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200">
            <div className="flex items-center justify-between">
              <span className="archivo-subtitle text-xs text-zinc-950 flex items-center space-x-2.5">
                <span className="w-5 h-5 rounded bg-zinc-950 text-white text-[11px] flex items-center justify-center font-mono">
                  3
                </span>
                <span>Uncancelled GPA Calculation</span>
              </span>
              <span className="font-mono font-bold text-sm text-zinc-950">
                {formatGPA(result.uncancelledGPA)}
              </span>
            </div>
            <div className="mt-2 text-xs text-zinc-600 pl-7">
              Formula:{' '}
              <span className="font-mono font-medium text-zinc-800">
                (CompulsorySum + OptionalContribution) / 6 = ({formatGPA(result.compulsoryGradePointSum)} +{' '}
                {formatGPA(result.optionalContribution)}) / 6 = {formatGPA(result.uncancelledGPA)}{' '}
                (capped at 5.00)
              </span>
            </div>
          </div>

          {/* Step 4: Compulsory Failure Check & Final Outcome */}
          <div
            className={`p-4 rounded-lg border ${
              hasCompulsoryFailure
                ? 'bg-zinc-50 border-2 border-zinc-950 text-zinc-950'
                : 'bg-zinc-50 border border-zinc-300 text-zinc-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="archivo-subtitle text-xs flex items-center space-x-2.5">
                <span
                  className={`w-5 h-5 rounded text-white text-[11px] flex items-center justify-center font-mono bg-zinc-950`}
                >
                  4
                </span>
                <span>Final Result and Grade Determination (Rules R-10 &amp; R-13)</span>
              </span>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-base text-zinc-950">
                  GPA {formatGPA(result.finalGPA)}
                </span>
                <GradeBadge grade={result.finalLetterGrade} size="sm" />
              </div>
            </div>
            <div className="mt-2 text-xs pl-7 leading-relaxed text-zinc-700">
              {hasCompulsoryFailure ? (
                <span>
                  <strong className="text-zinc-950">Compulsory Failure Triggered: </strong>
                  Because the student failed {failedCompulsorySubjects.map((s) => s.subject.name).join(', ')},
                  Rule R-13 overrides the final result to <strong>FAIL</strong> with Final GPA{' '}
                  <strong>0.00</strong> and Final Grade <strong>F</strong>, while the uncancelled GPA of{' '}
                  <span className="font-mono font-bold text-zinc-950">{formatGPA(result.uncancelledGPA)}</span> remains on record.
                </span>
              ) : (
                <span>
                  <strong className="text-zinc-950">All Compulsory Passed: </strong>
                  The student passed all 6 compulsory subjects. Final GPA is{' '}
                  <span className="font-mono font-bold text-zinc-950">{formatGPA(result.finalGPA)}</span> which maps to Letter
                  Grade <strong>{result.finalLetterGrade}</strong> under Rule R-10.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Teacher-Friendly Rule Explanations Card */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
        <h3 className="archivo-title text-sm text-zinc-950 mb-4 flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-zinc-950" />
          <span>Audit and Teacher Verification FAQs for this Student</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200">
            <h4 className="archivo-subtitle text-xs text-zinc-900 mb-1.5">
              Why did this student receive {result.finalLetterGrade}?
            </h4>
            <p className="text-zinc-600 leading-relaxed">
              {hasCompulsoryFailure
                ? `The student received F because they failed ${failedCompulsorySubjects
                    .map((s) => s.subject.name)
                    .join(', ')}. Under Rule R-13, compulsory failures mandate an F grade.`
                : `The student passed all compulsory subjects with a cumulative score producing GPA ${formatGPA(
                    result.finalGPA
                  )}, which falls in the ${result.finalLetterGrade} range under Rule R-10.`}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200">
            <h4 className="archivo-subtitle text-xs text-zinc-900 mb-1.5">
              Why did this student fail despite having a high average?
            </h4>
            <p className="text-zinc-600 leading-relaxed">
              {hasCompulsoryFailure
                ? `Even though the student achieved an uncancelled average of ${formatGPA(
                    result.uncancelledGPA
                  )}, individual component passing rules (R-11) and compulsory pass requirements (R-13) strictly prohibit passing overall when a core subject is failed.`
                : `The student did not fail; all compulsory subjects met the required component pass criteria.`}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200">
            <h4 className="archivo-subtitle text-xs text-zinc-900 mb-1.5">
              Why is this student on the verification list?
            </h4>
            <p className="text-zinc-600 leading-relaxed">
              {checkingItems && checkingItems.length > 0
                ? checkingItems
                    .map((ci) => `[${ci.type}]: ${ci.reason}`)
                    .join(' | ')
                : 'This student has no pending verification items; all subject components and optional marks are clear.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
