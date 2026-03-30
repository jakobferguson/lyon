import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export interface DivisionDto {
  id: string;
  code: string;
  name: string;
}

export interface ProjectDto {
  id: string;
  name: string;
  code: string;
  divisionId: string;
  division: string;
}

export interface RailroadDto {
  id: string;
  name: string;
  code: string;
  notificationRules: {
    id: string;
    incidentType: string;
    deadlineMinutes: number;
    isWithinShift: boolean;
  }[];
}

export interface FactorTypeDto {
  id: string;
  category: string;
  name: string;
  description: string | null;
  sortOrder: number;
}

export const lookupKeys = {
  divisions: ['lookups', 'divisions'] as const,
  projects: (divisionId?: string) => ['lookups', 'projects', divisionId] as const,
  railroads: ['lookups', 'railroads'] as const,
  factorTypes: ['lookups', 'factor-types'] as const,
};

export function useDivisions() {
  return useQuery({
    queryKey: lookupKeys.divisions,
    queryFn: async () => {
      const { data } = await apiClient.get<DivisionDto[]>('/admin/divisions');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useProjects(divisionId?: string) {
  return useQuery({
    queryKey: lookupKeys.projects(divisionId),
    queryFn: async () => {
      const { data } = await apiClient.get<ProjectDto[]>('/admin/projects', {
        params: divisionId ? { divisionId } : undefined,
      });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRailroads() {
  return useQuery({
    queryKey: lookupKeys.railroads,
    queryFn: async () => {
      const { data } = await apiClient.get<RailroadDto[]>('/admin/railroads');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFactorTypes() {
  return useQuery({
    queryKey: lookupKeys.factorTypes,
    queryFn: async () => {
      const { data } = await apiClient.get<FactorTypeDto[]>('/admin/factor-types');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
