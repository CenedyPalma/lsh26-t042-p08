'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api.service';
import { VerificationTable } from '../../components/verification/VerificationTable';
import {
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';

export default function VerificationPage() {
  const [activeTab, setActiveTab] = useState<'OPTIONAL' | 'PRACTICAL_FAIL' | 'ABSENT'>('OPTIONAL');
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => apiService.getAllClasses(),
  });

  const { data: optionalItems, isLoading: loadingOptional } = useQuery({
    queryKey: ['checking-optional', selectedClassId],
    queryFn: () => apiService.getOptionalChecking(),
  });

  const { data: practicalFailItems, isLoading: loadingPractical } = useQuery({
    queryKey: ['checking-practical-fail', selectedClassId],
    queryFn: () => apiService.getPracticalFailChecking(),
  });

  const { data: absentItems, isLoading: loadingAbsent } = useQuery({
    queryKey: ['checking-absent', selectedClassId],
    queryFn: () => apiService.getAbsentChecking(),
  });

  const tabs = [
    {
      id: 'OPTIONAL',
      label: 'Optional Review',
      subtitle: 'Optional GP \u2264 2.00 (Rule R-29)',
      icon: FileCheck,
      count: optionalItems?.length || 0,
      items: optionalItems || [],
      loading: loadingOptional,
    },
    {
      id: 'PRACTICAL_FAIL',
      label: 'Practical Fail Review',
      subtitle: 'Practical < 8/25 (Rule R-11)',
      icon: AlertTriangle,
      count: practicalFailItems?.length || 0,
      items: practicalFailItems || [],
      loading: loadingPractical,
    },
    {
      id: 'ABSENT',
      label: 'Absent Review',
      subtitle: 'Absent in \u22651 subject (Rule R-12)',
      icon: AlertCircle,
      count: absentItems?.length || 0,
      items: absentItems || [],
      loading: loadingAbsent,
    },
  ] as const;

  const currentTabConfig = tabs.find((t) => t.id === activeTab)!;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
        <div>
          <h1 className="archivo-title text-2xl text-zinc-950 flex items-center space-x-2.5">
            <ShieldCheck className="w-6 h-6 text-zinc-950" />
            <span>Teacher Verification Center (Rule R-29)</span>
          </h1>
          <p className="archivo-regular text-xs text-zinc-500 mt-1">
            Audit and verify students flagged under Rule R-29 across Optional, Practical, and Absence checking lists.
          </p>
        </div>

        {/* Filter by Class */}
        <div className="flex items-center space-x-2">
          <span className="archivo-medium text-xs text-zinc-600">Filter Class:</span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="text-xs py-1.5 px-3 bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950 font-normal"
          >
            <option value="">All Classes</option>
            {classes?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Verification Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`p-4 rounded-xl border text-left transition shadow-sm flex items-center justify-between ${
                isActive
                  ? 'bg-zinc-950 text-white border-zinc-950'
                  : 'bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    isActive
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="archivo-subtitle text-xs sm:text-sm">
                    {tab.label}
                  </div>
                  <div
                    className={`archivo-regular text-[11px] mt-0.5 ${
                      isActive ? 'text-zinc-400' : 'text-zinc-500'
                    }`}
                  >
                    {tab.subtitle}
                  </div>
                </div>
              </div>
              <span
                className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                  isActive
                    ? 'bg-zinc-800 text-white border border-zinc-700'
                    : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Table */}
      {currentTabConfig.loading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-xl border border-zinc-200">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="archivo-medium text-xs text-zinc-600">
              Loading {currentTabConfig.label}...
            </p>
          </div>
        </div>
      ) : (
        <VerificationTable
          items={currentTabConfig.items}
          typeLabel={currentTabConfig.label}
        />
      )}
    </div>
  );
}
