'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api.service';

export function Navbar() {
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const recalculateMutation = useMutation({
    mutationFn: () => apiService.recalculateAll(),
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      alert(`Results successfully recalculated for ${data.calculatedCount} students.`);
    },
    onError: (err: any) => {
      alert(`Recalculation failed: ${err.message}`);
    },
  });

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Class Results', href: '/classes', icon: Users },
    { label: 'Verification Center', href: '/verification', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 bg-zinc-950 text-white shadow-sm border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-lg bg-white text-zinc-950 flex items-center justify-center shadow-sm group-hover:bg-zinc-200 transition">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="archivo-title text-base leading-tight text-white">
                Apex Academy
              </div>
              <div className="text-xs text-zinc-400 font-normal">
                Result &amp; GPA Processing Engine
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition ${
                    isActive
                      ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Recalculate Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => recalculateMutation.mutate()}
              disabled={recalculateMutation.isPending}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 transition disabled:opacity-50"
              title="Recalculate all grades from raw marks transactionally"
            >
              <RotateCcw
                className={`w-3.5 h-3.5 ${
                  recalculateMutation.isPending ? 'animate-spin text-white' : ''
                }`}
              />
              <span className="hidden sm:inline">
                {recalculateMutation.isPending ? 'Calculating...' : 'Recalculate All'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
