import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, AlertTriangle, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'PASS' | 'FAIL' | 'AB' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  if (status === 'PASS' || status === 'VERIFIED') {
    return (
      <span
        className={`inline-flex items-center space-x-1.5 rounded bg-zinc-950 text-white border border-zinc-950 ${sizeClasses}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
        <span>{status === 'PASS' ? 'Passed' : 'Verified'}</span>
      </span>
    );
  }

  if (status === 'FAIL' || status === 'REJECTED') {
    return (
      <span
        className={`inline-flex items-center space-x-1.5 rounded bg-white text-zinc-950 border border-zinc-950 ${sizeClasses}`}
      >
        <XCircle className="w-3.5 h-3.5 text-zinc-950" />
        <span>{status === 'FAIL' ? 'Failed' : 'Rejected'}</span>
      </span>
    );
  }

  if (status === 'AB') {
    return (
      <span
        className={`inline-flex items-center space-x-1.5 rounded bg-zinc-100 text-zinc-950 border border-dashed border-zinc-600 ${sizeClasses}`}
      >
        <AlertCircle className="w-3.5 h-3.5 text-zinc-900" />
        <span>Absent</span>
      </span>
    );
  }

  // PENDING
  return (
    <span
      className={`inline-flex items-center space-x-1.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-300 ${sizeClasses}`}
    >
      <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
      <span>Pending</span>
    </span>
  );
}

export function FlagsBadge({
  flags,
}: {
  flags: {
    isAbsent?: boolean;
    hasPracticalFail?: boolean;
    hasOptionalReview?: boolean;
  };
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {flags.isAbsent && (
        <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-950 border border-dashed border-zinc-400">
          <AlertCircle className="w-3 h-3 text-zinc-700" />
          <span>AB</span>
        </span>
      )}
      {flags.hasPracticalFail && (
        <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-xs font-medium bg-zinc-900 text-white border border-zinc-900">
          <AlertTriangle className="w-3 h-3 text-white" />
          <span>Practical &lt; 8</span>
        </span>
      )}
      {flags.hasOptionalReview && (
        <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-xs font-medium bg-zinc-200 text-zinc-900 border border-zinc-300">
          <span>Opt GP &le; 2</span>
        </span>
      )}
      {!flags.isAbsent && !flags.hasPracticalFail && !flags.hasOptionalReview && (
        <span className="text-zinc-400 text-xs">-</span>
      )}
    </div>
  );
}
