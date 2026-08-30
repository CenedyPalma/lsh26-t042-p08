'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckingItemDTO } from '@school-result/shared';
import { StatusBadge } from '../results/StatusBadge';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api.service';
import {
  ShieldCheck,
  ShieldX,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface VerificationTableProps {
  items: CheckingItemDTO[];
  typeLabel: string;
}

export function VerificationTable({ items, typeLabel }: VerificationTableProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [activeModalItem, setActiveModalItem] = useState<{
    item: CheckingItemDTO;
    action: 'VERIFY' | 'REJECT';
  } | null>(null);
  const [notes, setNotes] = useState('');

  const verifyMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      apiService.verifyCheckingItem(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setActiveModalItem(null);
      setNotes('');
    },
    onError: (err: any) => {
      alert(`Error verifying item: ${err.message}`);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      apiService.rejectCheckingItem(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setActiveModalItem(null);
      setNotes('');
    },
    onError: (err: any) => {
      alert(`Error rejecting item: ${err.message}`);
    },
  });

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.student?.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(item.student?.roll).includes(searchTerm) ||
      (item.subject?.name && item.subject.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSubmitAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalItem) return;

    if (activeModalItem.action === 'VERIFY') {
      verifyMutation.mutate({
        id: activeModalItem.item.id,
        notes,
      });
    } else {
      rejectMutation.mutate({
        id: activeModalItem.item.id,
        notes,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by student, roll, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950 font-normal"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <span className="archivo-medium text-xs text-zinc-600">Status:</span>
          {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                statusFilter === st
                  ? 'bg-zinc-950 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              {st === 'ALL' ? 'All' : st === 'PENDING' ? 'Pending' : st === 'VERIFIED' ? 'Verified' : 'Rejected'}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-100 text-zinc-700 font-semibold border-b border-zinc-200">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Class and Roll</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Trigger Reason (Rule R-29)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Verification Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-xs">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    No {typeLabel.toLowerCase()} verification records found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-950">
                        {item.student?.name}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-500">
                        ID: {item.student?.studentId}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-zinc-800">
                        {item.student?.class?.name}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        Roll: <span className="font-mono font-bold text-zinc-800">{item.student?.roll}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-zinc-800">
                      {item.subject ? (
                        <span>
                          {item.subject.name}{' '}
                          <span className="text-zinc-400 font-mono">
                            ({item.subject.code})
                          </span>
                        </span>
                      ) : (
                        <span className="text-zinc-400">All Subjects</span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs text-zinc-700 leading-snug">
                      {item.reason}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-zinc-600 italic">
                      {item.verificationNotes || '-'}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {item.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => {
                              setActiveModalItem({ item, action: 'VERIFY' });
                              setNotes('');
                            }}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verify</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveModalItem({ item, action: 'REJECT' });
                              setNotes('');
                            }}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-white hover:bg-zinc-100 text-zinc-950 border border-zinc-950 text-xs font-semibold shadow-sm transition"
                          >
                            <ShieldX className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                      <Link
                        href={`/students/${item.student?.studentId}`}
                        className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium border border-zinc-200 transition"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Trace</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-zinc-200">
            <h3 className="archivo-title text-base text-zinc-950 mb-2 flex items-center space-x-2">
              {activeModalItem.action === 'VERIFY' ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-zinc-950" />
                  <span>Verify Checking Item</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-zinc-950" />
                  <span>Reject Checking Item</span>
                </>
              )}
            </h3>

            <p className="archivo-regular text-xs text-zinc-600 mb-4 leading-relaxed">
              Student: <strong>{activeModalItem.item.student?.name}</strong> (Roll:{' '}
              {activeModalItem.item.student?.roll}, ID:{' '}
              {activeModalItem.item.student?.studentId})
              <br />
              Trigger: {activeModalItem.item.reason}
            </p>

            <form onSubmit={handleSubmitAction} className="space-y-4">
              <div>
                <label className="block archivo-medium text-xs text-zinc-800 mb-1">
                  Teacher Verification Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    activeModalItem.action === 'VERIFY'
                      ? 'e.g., Checked physical script. Grade confirmed.'
                      : 'e.g., Mark discrepancy found. Forwarded for remarking.'
                  }
                  rows={3}
                  className="w-full p-2.5 text-xs bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950 font-normal"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveModalItem(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    verifyMutation.isPending || rejectMutation.isPending
                  }
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm transition disabled:opacity-50 ${
                    activeModalItem.action === 'VERIFY'
                      ? 'bg-zinc-950 hover:bg-zinc-800'
                      : 'bg-zinc-900 hover:bg-zinc-800'
                  }`}
                >
                  {verifyMutation.isPending || rejectMutation.isPending
                    ? 'Saving...'
                    : activeModalItem.action === 'VERIFY'
                    ? 'Confirm Verification'
                    : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
