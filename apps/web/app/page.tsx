'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api.service';
import { StatCard } from '../components/dashboard/StatCard';
import { GradeDistributionChart } from '../components/dashboard/GradeDistributionChart';
import { formatGPA } from '../lib/utils';
import {
  Users,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Award,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  School,
  FileCheck,
} from 'lucide-react';

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiService.getDashboardStats(),
  });

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => apiService.getAllClasses(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="archivo-medium text-xs text-zinc-600">
            Loading examination data and statistics...
          </p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 rounded-xl bg-white border border-zinc-950 text-zinc-950">
        <h3 className="archivo-title text-base">Failed to load examination statistics</h3>
        <p className="text-xs mt-1 text-zinc-600">{(error as Error)?.message || 'Database connection error'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
        <div>
          <h1 className="archivo-title text-2xl text-zinc-950">
            Academic Examination Dashboard
          </h1>
          <p className="archivo-regular text-xs text-zinc-500 mt-1">
            Academic Session 2026 &bull; Secondary Level &bull; {stats.totalClasses} Examination Classes &bull;{' '}
            {stats.totalStudents} Enrolled Students
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href="/classes"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition"
          >
            <School className="w-4 h-4" />
            <span>Class Results</span>
          </Link>
          <Link
            href="/verification"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-zinc-100 text-zinc-950 border border-zinc-300 text-xs font-semibold shadow-sm transition"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verification Center</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          subtitle={`Across ${stats.totalClasses} Classes`}
          icon={Users}
        />
        <StatCard
          title="Passed Students"
          value={`${stats.passedCount} (${stats.passPercentage}%)`}
          subtitle="All 6 compulsory passed"
          icon={CheckCircle2}
        />
        <StatCard
          title="Failed Students"
          value={stats.failedCount}
          subtitle="Compulsory or AB failures"
          icon={XCircle}
        />
        <StatCard
          title="Average GPA"
          value={formatGPA(stats.averageGPA)}
          subtitle={`Highest: ${formatGPA(stats.highestGPA)}`}
          icon={TrendingUp}
        />
      </div>

      {/* Flags & Audit Review KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Absent Cases (AB)"
          value={stats.absentCount}
          subtitle="Students marked AB in &ge;1 subject"
          icon={AlertCircle}
        />
        <StatCard
          title="Practical Fail Cases"
          value={stats.practicalFailCount}
          subtitle="Practical mark &lt; 8/25 (Rule R-11)"
          icon={AlertTriangle}
        />
        <StatCard
          title="Optional Review Cases"
          value={stats.optionalReviewCount}
          subtitle="Optional GP &le; 2.00 (Rule R-29)"
          icon={FileCheck}
        />
      </div>

      {/* Charts & Quick Access Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grade Distribution Bar Breakdown */}
        <div className="lg:col-span-2">
          <GradeDistributionChart
            distribution={stats.gradeDistribution}
            totalStudents={stats.totalStudents}
          />
        </div>

        {/* Classes & Quick Review Hub */}
        <div className="space-y-6">
          {/* Classes Card */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
            <h3 className="archivo-title text-base text-zinc-950 mb-4 flex items-center justify-between">
              <span>Classes</span>
              <Link
                href="/classes"
                className="text-xs text-zinc-600 hover:text-zinc-950 font-medium flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </h3>

            <div className="space-y-2.5">
              {classes?.map((cls) => (
                <Link
                  key={cls.id}
                  href={`/classes?classId=${cls.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300 transition group"
                >
                  <div>
                    <div className="archivo-subtitle text-zinc-950 text-sm">
                      {cls.name}
                    </div>
                    <div className="archivo-regular text-xs text-zinc-500">
                      Academic Year {cls.academicYear}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-mono bg-white text-zinc-900 border border-zinc-300">
                      {cls._count?.students ?? 0} Students
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Rule Engine Compliance Status */}
          <div className="bg-zinc-950 text-white rounded-xl p-6 shadow-sm border border-zinc-900">
            <div className="flex items-center space-x-2 text-zinc-200 mb-3">
              <Award className="w-4 h-4 text-white" />
              <h3 className="archivo-title text-sm text-white">Rule Engine Active</h3>
            </div>
            <p className="archivo-regular text-xs text-zinc-400 leading-relaxed">
              Institutional GPA and grading rules:
            </p>
            <div className="mt-4 space-y-2 text-xs text-zinc-300">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span><strong>R-10:</strong> Grade Scale (A+ 5.0 to F 0.0)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span><strong>R-11:</strong> Component Pass (Theory &ge; 25, Practical &ge; 8)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span><strong>R-12:</strong> Absence Handling (AB Status)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span><strong>R-13:</strong> Optional max(0, GP-2) &amp; Compulsory Override</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span><strong>R-29:</strong> Verification Checking Lists</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
