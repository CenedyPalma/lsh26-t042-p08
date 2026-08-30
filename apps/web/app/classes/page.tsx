'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api.service';
import { ClassResultsTable } from '../../components/results/ClassResultsTable';
import { School, Users } from 'lucide-react';

function ClassesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialClassId = searchParams.get('classId');

  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: () => apiService.getAllClasses(),
  });

  const [selectedClassId, setSelectedClassId] = useState<string>('');

  useEffect(() => {
    if (initialClassId) {
      setSelectedClassId(initialClassId);
    } else if (classes && classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, initialClassId, selectedClassId]);

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['class-students', selectedClassId],
    queryFn: () => apiService.getClassStudents(selectedClassId),
    enabled: !!selectedClassId,
  });

  const activeClass = classes?.find((c) => c.id === selectedClassId);

  const handleSelectClass = (id: string) => {
    setSelectedClassId(id);
    router.push(`/classes?classId=${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
        <div>
          <h1 className="archivo-title text-2xl text-zinc-950 flex items-center space-x-2.5">
            <School className="w-6 h-6 text-zinc-950" />
            <span>Class Examination Results</span>
          </h1>
          <p className="archivo-regular text-xs text-zinc-500 mt-1">
            Browse and audit tabulated results, uncancelled GPAs, and component flags.
          </p>
        </div>

        {/* Class Selector Tabs */}
        <div className="flex items-center space-x-2 bg-zinc-100 p-1.5 rounded-lg border border-zinc-200">
          {classesLoading ? (
            <span className="text-xs text-zinc-500 px-3 py-1">Loading classes...</span>
          ) : (
            classes?.map((cls) => (
              <button
                key={cls.id}
                onClick={() => handleSelectClass(cls.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition ${
                  selectedClassId === cls.id
                    ? 'bg-zinc-950 text-white shadow-sm'
                    : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{cls.name}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded font-mono ${
                    selectedClassId === cls.id
                      ? 'bg-zinc-800 text-zinc-200'
                      : 'bg-zinc-200 text-zinc-800'
                  }`}
                >
                  {cls._count?.students || 0}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Results Table */}
      {studentsLoading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-xl border border-zinc-200">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="archivo-medium text-xs text-zinc-600">
              Loading student results for {activeClass?.name || 'class'}...
            </p>
          </div>
        </div>
      ) : students ? (
        <ClassResultsTable
          students={students}
          className={activeClass?.name || 'Class'}
        />
      ) : null}
    </div>
  );
}

export default function ClassesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ClassesContent />
    </Suspense>
  );
}
