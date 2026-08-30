'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { StudentDTO } from '@school-result/shared';
import { GradeBadge } from './GradeBadge';
import { StatusBadge, FlagsBadge } from './StatusBadge';
import { formatGPA } from '../../lib/utils';
import {
  Search,
  ArrowUpDown,
  ChevronRight,
} from 'lucide-react';

interface ClassResultsTableProps {
  students: StudentDTO[];
  className: string;
}

export function ClassResultsTable({ students, className }: ClassResultsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASS' | 'FAIL'>('ALL');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [flagFilter, setFlagFilter] = useState<'ALL' | 'AB' | 'PRACTICAL_FAIL' | 'OPTIONAL_REVIEW'>('ALL');
  const [sortBy, setSortBy] = useState<'roll' | 'name' | 'gpa' | 'grade'>('roll');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: 'roll' | 'name' | 'gpa' | 'grade') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder(column === 'gpa' ? 'desc' : 'asc');
    }
  };

  const filteredStudents = students
    .filter((student) => {
      const matchesSearch =
        !searchTerm ||
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(student.roll).includes(searchTerm);

      const matchesStatus =
        statusFilter === 'ALL' || student.result?.overallResult === statusFilter;

      const matchesGrade =
        gradeFilter === 'ALL' || student.result?.finalLetterGrade === gradeFilter;

      const hasAB = student.marks.some((m) => m.isAbsent || m.status === 'ABSENT');
      const hasPracticalFail = student.marks.some(
        (m) =>
          m.subject.hasPractical &&
          m.practicalMarks !== null &&
          m.practicalMarks < 8
      );
      const hasOptionalReview = student.checkingItems?.some(
        (c) => c.type === 'OPTIONAL'
      );

      const matchesFlag =
        flagFilter === 'ALL' ||
        (flagFilter === 'AB' && hasAB) ||
        (flagFilter === 'PRACTICAL_FAIL' && hasPracticalFail) ||
        (flagFilter === 'OPTIONAL_REVIEW' && hasOptionalReview);

      return matchesSearch && matchesStatus && matchesGrade && matchesFlag;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'roll') {
        comparison = a.roll - b.roll;
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'gpa') {
        const gpaA = a.result?.finalGPA ?? -1;
        const gpaB = b.result?.finalGPA ?? -1;
        comparison = gpaA - gpaB;
      } else if (sortBy === 'grade') {
        const gradeA = a.result?.finalLetterGrade ?? '';
        const gradeB = b.result?.finalLetterGrade ?? '';
        comparison = gradeA.localeCompare(gradeB);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="space-y-4">
      {/* Controls: Search, Filters, and Stats */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by student name, roll, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950 font-normal"
            />
          </div>

          {/* Result Status Filter */}
          <div className="flex items-center space-x-1.5 w-full md:w-auto">
            <span className="archivo-medium text-xs text-zinc-600">Result:</span>
            {(['ALL', 'PASS', 'FAIL'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  statusFilter === st
                    ? 'bg-zinc-950 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                {st === 'ALL' ? 'All' : st === 'PASS' ? 'Passed' : 'Failed'}
              </button>
            ))}
          </div>

          {/* Grade Filter */}
          <div className="flex items-center space-x-1.5 w-full md:w-auto">
            <span className="archivo-medium text-xs text-zinc-600">Grade:</span>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="text-xs py-1 px-2.5 bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950 font-normal"
            >
              <option value="ALL">All Grades</option>
              <option value="A+">A+</option>
              <option value="A">A</option>
              <option value="A-">A-</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="F">F</option>
            </select>
          </div>

          {/* Flag Filter */}
          <div className="flex items-center space-x-1.5 w-full md:w-auto">
            <span className="archivo-medium text-xs text-zinc-600">Flag:</span>
            <select
              value={flagFilter}
              onChange={(e) => setFlagFilter(e.target.value as any)}
              className="text-xs py-1 px-2.5 bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950 font-normal"
            >
              <option value="ALL">All Cases</option>
              <option value="AB">Absent (AB)</option>
              <option value="PRACTICAL_FAIL">Practical &lt; 8</option>
              <option value="OPTIONAL_REVIEW">Optional GP &le; 2</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-100 text-zinc-700 font-semibold border-b border-zinc-200">
              <tr>
                <th
                  onClick={() => handleSort('roll')}
                  className="py-3 px-4 cursor-pointer hover:bg-zinc-200 transition select-none"
                >
                  <div className="flex items-center space-x-1">
                    <span>Roll</span>
                    <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:bg-zinc-200 transition select-none"
                >
                  <div className="flex items-center space-x-1">
                    <span>Student Name</span>
                    <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4 text-center font-mono">Uncancelled GPA</th>
                <th
                  onClick={() => handleSort('gpa')}
                  className="py-3 px-4 text-center cursor-pointer hover:bg-zinc-200 transition select-none"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Final GPA</span>
                    <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('grade')}
                  className="py-3 px-4 text-center cursor-pointer hover:bg-zinc-200 transition select-none"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Grade</span>
                    <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Result</th>
                <th className="py-3 px-4">Flags (R-11 / R-12 / R-29)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-zinc-500">
                    No student results found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isFail = student.result?.overallResult === 'FAIL';
                  const hasAB = student.marks.some(
                    (m) => m.isAbsent || m.status === 'ABSENT'
                  );
                  const hasPracticalFail = student.marks.some(
                    (m) =>
                      m.subject.hasPractical &&
                      m.practicalMarks !== null &&
                      m.practicalMarks < 8
                  );
                  const hasOptionalReview = student.checkingItems?.some(
                    (c) => c.type === 'OPTIONAL'
                  );

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-zinc-50 transition ${
                        isFail ? 'bg-zinc-50/50' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-zinc-950">
                        {student.roll}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/students/${student.studentId}`}
                          className="font-semibold text-zinc-950 hover:underline transition"
                        >
                          {student.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-500">
                        {student.studentId}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-zinc-600">
                        {formatGPA(student.result?.uncancelledGPA)}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-zinc-950 text-sm">
                        {formatGPA(student.result?.finalGPA)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <GradeBadge
                          grade={student.result?.finalLetterGrade || 'F'}
                          size="sm"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge
                          status={student.result?.overallResult || 'FAIL'}
                          size="sm"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <FlagsBadge
                          flags={{
                            isAbsent: hasAB,
                            hasPracticalFail,
                            hasOptionalReview,
                          }}
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/students/${student.studentId}`}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium bg-zinc-100 text-zinc-950 hover:bg-zinc-200 border border-zinc-200 transition"
                        >
                          <span>Trace</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
