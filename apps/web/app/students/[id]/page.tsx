'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../../services/api.service';
import { CalculationTraceView } from '../../../components/trace/CalculationTraceView';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const { data: traceData, isLoading, error } = useQuery({
    queryKey: ['student-trace', studentId],
    queryFn: () => apiService.getStudentTrace(studentId),
    enabled: !!studentId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="archivo-medium text-xs text-zinc-600">
            Retrieving calculation trace and subject breakdown...
          </p>
        </div>
      </div>
    );
  }

  if (error || !traceData) {
    return (
      <div className="p-6 rounded-xl bg-white border-2 border-zinc-950 text-zinc-950 space-y-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-zinc-950" />
          <h3 className="archivo-title text-base">Student Result Record Not Found</h3>
        </div>
        <p className="archivo-regular text-xs text-zinc-600">
          {(error as Error)?.message || `No result record found for student ID: ${studentId}`}
        </p>
        <Link
          href="/classes"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Classes</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center space-x-2 text-xs font-medium text-zinc-700 hover:text-zinc-950 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Class Results</span>
        </button>

        <div className="archivo-regular text-xs text-zinc-500 font-mono">
          Trace Version: v{traceData.result.calculationVersion} &bull; Generated:{' '}
          {new Date(traceData.result.calculatedAt).toLocaleDateString()}
        </div>
      </div>

      {/* Main Calculation Trace View */}
      <CalculationTraceView traceData={traceData} />
    </div>
  );
}
