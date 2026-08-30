import React from 'react';
import { GradeBadge } from '../results/GradeBadge';

interface GradeDistributionChartProps {
  distribution: Record<string, number>;
  totalStudents: number;
}

export function GradeDistributionChart({
  distribution,
  totalStudents,
}: GradeDistributionChartProps) {
  const grades = ['A+', 'A', 'A-', 'B', 'C', 'D', 'F'];

  const getBarColor = (grade: string) => {
    switch (grade) {
      case 'A+':
        return 'bg-zinc-950';
      case 'A':
        return 'bg-zinc-800';
      case 'A-':
        return 'bg-zinc-700';
      case 'B':
        return 'bg-zinc-600';
      case 'C':
        return 'bg-zinc-500';
      case 'D':
        return 'bg-zinc-400';
      case 'F':
      default:
        return 'bg-zinc-900';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="archivo-title text-base text-zinc-950">
          Letter Grade Distribution (Rule R-10)
        </h3>
        <span className="archivo-regular text-xs text-zinc-500 font-mono">
          Total: {totalStudents} Students
        </span>
      </div>

      <div className="space-y-3.5">
        {grades.map((grade) => {
          const count = distribution[grade] || 0;
          const percentage =
            totalStudents > 0 ? ((count / totalStudents) * 100).toFixed(1) : '0.0';

          return (
            <div key={grade} className="flex items-center space-x-3 text-xs">
              <div className="w-10">
                <GradeBadge grade={grade} size="sm" />
              </div>
              <div className="flex-1 bg-zinc-100 rounded h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded transition-all duration-500 ${getBarColor(
                    grade
                  )}`}
                  style={{
                    width: `${Math.max(Number(percentage), count > 0 ? 2 : 0)}%`,
                  }}
                />
              </div>
              <div className="w-24 text-right font-mono font-medium text-zinc-800">
                {count} <span className="text-zinc-400 font-normal">({percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
