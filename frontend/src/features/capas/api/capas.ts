import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import type { PaginatedResponse } from '../../incidents/api/incidents';

// ── Types matching backend DTOs ─────────────────────────────────────────────

export interface CapaListItem {
  id: string;
  capaNumber: string;
  type: string;
  category: string;
  description: string;
  assignedTo: string;
  priority: string;
  status: string;
  dueDate: string;
  verificationDueDate: string | null;
  linkedIncidentCount: number;
}

export interface CapaDetail {
  id: string;
  capaNumber: string;
  type: string;
  category: string;
  description: string;
  assignedToId: string;
  assignedTo: string;
  verifiedById: string | null;
  verifiedBy: string | null;
  priority: string;
  status: string;
  dueDate: string;
  verificationDueDate: string | null;
  verificationMethod: string | null;
  completionNotes: string | null;
  verificationNotes: string | null;
  completedAt: string | null;
  verifiedAt: string | null;
  createdAt: string;
  linkedIncidents: LinkedIncidentDto[];
}

export interface LinkedIncidentDto {
  id: string;
  incidentNumber: string;
  incidentType: string;
  status: string;
}

// ── Query keys ──────────────────────────────────────────────────────────────

export const capaKeys = {
  all: ['capas'] as const,
  lists: () => [...capaKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...capaKeys.lists(), params] as const,
  details: () => [...capaKeys.all, 'detail'] as const,
  detail: (id: string) => [...capaKeys.details(), id] as const,
};

// ── Queries ─────────────────────────────────────────────────────────────────

export interface CapaListParams {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
  priority?: string;
  incidentId?: string;
}

export function useCapaList(params: CapaListParams = {}) {
  return useQuery({
    queryKey: capaKeys.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<CapaListItem>>(
        '/capas',
        { params },
      );
      return data;
    },
  });
}

export function useCapaDetail(id: string) {
  return useQuery({
    queryKey: capaKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<CapaDetail>(`/capas/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// ── Mutations ───────────────────────────────────────────────────────────────

export function useCreateCapa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: {
      type: string;
      category: string;
      description: string;
      assignedToId: string;
      priority: string;
      verificationMethod?: string;
      dueDate?: string;
      linkedIncidentIds: string[];
    }) => {
      const { data } = await apiClient.post<CapaDetail>('/capas', request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: capaKeys.lists() });
    },
  });
}

export function useTransitionCapa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      newStatus,
      completionNotes,
      verificationNotes,
      verifiedById,
    }: {
      id: string;
      newStatus: string;
      completionNotes?: string;
      verificationNotes?: string;
      verifiedById?: string;
    }) => {
      await apiClient.post(`/capas/${id}/transition`, {
        newStatus,
        completionNotes,
        verificationNotes,
        verifiedById,
      });
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: capaKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: capaKeys.lists() });
    },
  });
}
