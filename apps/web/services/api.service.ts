import { fetchApi } from '../lib/api-client';
import {
  ClassDTO,
  StudentDTO,
  DashboardStatsDTO,
  StudentResultDTO,
  CheckingItemDTO,
} from '@school-result/shared';

export interface StudentTraceResponse {
  student: {
    id: string;
    studentId: string;
    roll: number;
    name: string;
    class: string;
  };
  result: StudentResultDTO;
  traces: any[];
  compulsoryTraces: any[];
  optionalTrace: any | null;
  checkingItems: CheckingItemDTO[];
}

export const apiService = {
  // Dashboard & Stats
  getDashboardStats: () => fetchApi<DashboardStatsDTO>('/api/results'),

  // Classes
  getAllClasses: () => fetchApi<ClassDTO[]>('/api/classes'),
  getClassStudents: (
    classId: string,
    params?: {
      search?: string;
      resultStatus?: 'PASS' | 'FAIL';
      letterGrade?: string;
      flag?: 'AB' | 'PRACTICAL_FAIL' | 'OPTIONAL_REVIEW';
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.resultStatus) query.set('resultStatus', params.resultStatus);
    if (params?.letterGrade) query.set('letterGrade', params.letterGrade);
    if (params?.flag) query.set('flag', params.flag);
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.sortOrder) query.set('sortOrder', params.sortOrder);
    const queryString = query.toString();
    return fetchApi<StudentDTO[]>(
      `/api/classes/${classId}/students${queryString ? `?${queryString}` : ''}`
    );
  },

  // Students & Results
  getAllStudents: (params?: { search?: string; classId?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.classId) query.set('classId', params.classId);
    const queryString = query.toString();
    return fetchApi<StudentDTO[]>(
      `/api/students${queryString ? `?${queryString}` : ''}`
    );
  },
  getStudentById: (studentId: string) =>
    fetchApi<StudentDTO>(`/api/students/${studentId}`),
  getStudentTrace: (studentId: string) =>
    fetchApi<StudentTraceResponse>(`/api/results/${studentId}/trace`),

  // Recalculation
  recalculateAll: () =>
    fetchApi<{ calculatedCount: number }>('/api/results/recalculate', {
      method: 'POST',
    }),

  // Verification Checking Items
  getAllCheckingItems: (params?: {
    type?: string;
    status?: string;
    classId?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    if (params?.status) query.set('status', params.status);
    if (params?.classId) query.set('classId', params.classId);
    const queryString = query.toString();
    return fetchApi<CheckingItemDTO[]>(
      `/api/checking${queryString ? `?${queryString}` : ''}`
    );
  },
  getOptionalChecking: () =>
    fetchApi<CheckingItemDTO[]>('/api/checking/optional'),
  getPracticalFailChecking: () =>
    fetchApi<CheckingItemDTO[]>('/api/checking/practical-fail'),
  getAbsentChecking: () => fetchApi<CheckingItemDTO[]>('/api/checking/absent'),

  verifyCheckingItem: (id: string, notes?: string) =>
    fetchApi<CheckingItemDTO>(`/api/checking/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    }),

  rejectCheckingItem: (id: string, notes?: string) =>
    fetchApi<CheckingItemDTO>(`/api/checking/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    }),
};
