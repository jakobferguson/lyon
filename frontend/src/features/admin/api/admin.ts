import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import type { PaginatedResponse } from '../../incidents/api/incidents';

// ── Types matching backend DTOs ─────────────────────────────────────────────

export interface DivisionDto {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface RailroadDto {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  notificationRules?: RailroadNotificationRuleDto[];
}

export interface RailroadNotificationRuleDto {
  id: string;
  incidentType: string;
  deadlineMinutes: number;
  isWithinShift: boolean;
}

export interface FactorTypeDto {
  id: string;
  category: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface AuditLogEntryDto {
  id: number;
  timestamp: string;
  userDisplayName: string;
  action: string;
  entityType: string;
  entityId: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  justification?: string;
}

// ── Query keys ──────────────────────────────────────────────────────────────

export const adminKeys = {
  all: ['admin'] as const,
  divisions: () => [...adminKeys.all, 'divisions'] as const,
  railroads: () => [...adminKeys.all, 'railroads'] as const,
  factorTypes: () => [...adminKeys.all, 'factor-types'] as const,
  auditLog: (params: Record<string, unknown>) => [...adminKeys.all, 'audit-log', params] as const,
};

// ── Queries ─────────────────────────────────────────────────────────────────

export function useDivisions() {
  return useQuery({
    queryKey: adminKeys.divisions(),
    queryFn: async () => {
      const { data } = await apiClient.get<DivisionDto[]>('/admin/divisions');
      return data;
    },
  });
}

export function useRailroads() {
  return useQuery({
    queryKey: adminKeys.railroads(),
    queryFn: async () => {
      const { data } = await apiClient.get<RailroadDto[]>('/admin/railroads');
      return data;
    },
  });
}

export function useFactorTypes() {
  return useQuery({
    queryKey: adminKeys.factorTypes(),
    queryFn: async () => {
      const { data } = await apiClient.get<FactorTypeDto[]>('/admin/factor-types');
      return data;
    },
  });
}

export interface AuditLogParams {
  pageNumber?: number;
  pageSize?: number;
  entityType?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

export function useAuditLog(params: AuditLogParams = {}) {
  return useQuery({
    queryKey: adminKeys.auditLog(params),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<AuditLogEntryDto>>(
        '/admin/audit-log',
        { params },
      );
      return data;
    },
  });
}

// ── Mutations ───────────────────────────────────────────────────────────────

export function useCreateFactorType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: {
      category: string;
      name: string;
      description?: string;
      sortOrder?: number;
    }) => {
      const { data } = await apiClient.post<FactorTypeDto>('/admin/factor-types', request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.factorTypes() });
    },
  });
}

export function useUpdateFactorType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...request }: {
      id: string;
      category: string;
      name: string;
      description?: string;
      sortOrder?: number;
    }) => {
      const { data } = await apiClient.put<FactorTypeDto>(`/admin/factor-types/${id}`, request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.factorTypes() });
    },
  });
}

export function useUpsertHoursWorked() {
  return useMutation({
    mutationFn: async (request: {
      year: number;
      month: number;
      divisionId?: string;
      hours: number;
    }) => {
      await apiClient.put('/admin/hours-worked', request);
    },
  });
}
