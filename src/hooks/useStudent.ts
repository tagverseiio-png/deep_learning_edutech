import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ApiResponse } from '@/types';

// Types for student dashboard stats
export interface StudentDashboardStats {
  totalEnrollments: number;
  completedCourses: number;
  inProgressCourses: number;
  totalAssignments: number;
}

// Query keys
export const studentKeys = {
  all: ['student'] as const,
  dashboard: () => [...studentKeys.all, 'dashboard'] as const,
  dashboardStats: () => [...studentKeys.dashboard(), 'stats'] as const,
};

// Fetch student dashboard statistics
export function useStudentDashboardStats(options?: Omit<UseQueryOptions<ApiResponse<StudentDashboardStats>>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: studentKeys.dashboardStats(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<StudentDashboardStats>>('/students/dashboard-stats');
      return response.data;
    },
    ...options,
  });
}