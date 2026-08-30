import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-400">
      <div className="flex items-center justify-between">
        <div>
          <p className="archivo-medium text-xs text-zinc-500">
            {title}
          </p>
          <p className="archivo-title mt-2 text-2xl text-zinc-950 font-mono">
            {value}
          </p>
          {subtitle && (
            <p className="archivo-regular mt-1 text-xs text-zinc-600">
              {subtitle}
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
