import React from 'react';

interface GradeBadgeProps {
  grade: string;
  size?: 'sm' | 'md' | 'lg';
}

export function GradeBadge({ grade, size = 'md' }: GradeBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-4 py-1.5 text-base font-bold',
  };

  const getStyle = (g: string) => {
    switch (g) {
      case 'A+':
        return 'bg-zinc-950 text-white border-zinc-950';
      case 'A':
        return 'bg-zinc-900 text-white border-zinc-800';
      case 'A-':
        return 'bg-zinc-800 text-white border-zinc-700';
      case 'B':
        return 'bg-zinc-700 text-white border-zinc-600';
      case 'C':
        return 'bg-zinc-200 text-zinc-900 border-zinc-300';
      case 'D':
        return 'bg-zinc-100 text-zinc-800 border-zinc-200';
      case 'F':
      default:
        return 'bg-white text-zinc-950 border-2 border-zinc-950';
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded border font-mono ${getStyle(
        grade
      )} ${sizeClasses[size]}`}
    >
      {grade}
    </span>
  );
}
