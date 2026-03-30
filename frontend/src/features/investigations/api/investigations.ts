import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import type { PaginatedResponse } from '../../incidents/api/incidents';

// ── Types matching backend DTOs ─────────────────────────────────────────────

export interface InvestigationListItem {
  id: string;
  incidentId: string;
  incidentNumber: string;
  status: string;
  severity: string;
  division: string | null;
  project: string | null;
  leadInvestigator: string | null;
  targetCompletionDate: string;
  investigationNumber: number;
  createdAt: string;
}

export interface InvestigationDetail {
  id: string;
  incidentId: string;
  leadInvestigator: string;
  leadInvestigatorId: string;
  assignedBy: string;
  targetCompletionDate: string;
  actualCompletionDate: string | null;
  rootCauseSummary: string | null;
  status: string;
  reviewComments: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  investigationNumber: number;
  createdAt: string;
  teamMembers: TeamMemberDto[];
  fiveWhyEntries: FiveWhyEntryDto[];
  contributingFactors: ContributingFactorDto[];
  witnessStatements: WitnessStatementDto[];
}

export interface TeamMemberDto {
  userId: string;
  displayName: string;
  email: string;
}

export interface FiveWhyEntryDto {
  id: string;
  level: number;
  whyQuestion: string;
  answer: string;
  supportingEvidence: string | null;
}

export interface ContributingFactorDto {
  id: string;
  factorTypeId: string;
  factorCategory: string;
  factorName: string;
  isPrimary: boolean;
  notes: string | null;
}

export interface WitnessStatementDto {
  id: string;
  witnessName: string;
  jobTitle: string | null;
  employer: string | null;
  phone: string | null;
  statementText: string;
  collectionDate: string;
  collectedBy: string;
  referencesStatementId: string | null;
  createdAt: string;
}

// ── Query keys ──────────────────────────────────────────────────────────────

export const investigationKeys = {
  all: ['investigations'] as const,
  lists: () => [...investigationKeys.all, 'list'] as const,
  list: (params: InvestigationListParams) => [...investigationKeys.lists(), params] as const,
  details: () => [...investigationKeys.all, 'detail'] as const,
  detail: (id: string) => [...investigationKeys.details(), id] as const,
  byIncident: (incidentId: string) => [...investigationKeys.all, 'by-incident', incidentId] as const,
};

// ── Queries ─────────────────────────────────────────────────────────────────

export interface InvestigationListParams {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}

export function useInvestigationList(params: InvestigationListParams = {}) {
  return useQuery({
    queryKey: investigationKeys.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<InvestigationListItem>>(
        '/investigations',
        { params },
      );
      return data;
    },
  });
}

export function useInvestigationDetail(id: string) {
  return useQuery({
    queryKey: investigationKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<InvestigationDetail>(`/investigations/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useInvestigationByIncident(incidentId: string) {
  return useQuery({
    queryKey: investigationKeys.byIncident(incidentId),
    queryFn: async () => {
      const { data } = await apiClient.get<InvestigationDetail>(
        `/investigations/by-incident/${incidentId}`,
      );
      return data;
    },
    enabled: !!incidentId,
    retry: false, // 404 = no investigation yet, don't retry
  });
}

// ── Mutations ───────────────────────────────────────────────────────────────

export function useSubmitFiveWhy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      investigationId,
      entries,
      rootCauseSummary,
    }: {
      investigationId: string;
      entries: { level: number; whyQuestion: string; answer: string; supportingEvidence?: string }[];
      rootCauseSummary?: string;
    }) => {
      await apiClient.post(`/investigations/${investigationId}/five-why`, {
        entries,
        rootCauseSummary,
      });
    },
    onSuccess: (_data, { investigationId }) => {
      queryClient.invalidateQueries({ queryKey: investigationKeys.detail(investigationId) });
      queryClient.invalidateQueries({ queryKey: investigationKeys.lists() });
    },
  });
}

export function useAddContributingFactor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      investigationId,
      factorTypeId,
      isPrimary,
      notes,
    }: {
      investigationId: string;
      factorTypeId: string;
      isPrimary: boolean;
      notes?: string;
    }) => {
      const { data } = await apiClient.post<{ id: string }>(
        `/investigations/${investigationId}/contributing-factors`,
        { factorTypeId, isPrimary, notes },
      );
      return data;
    },
    onSuccess: (_data, { investigationId }) => {
      queryClient.invalidateQueries({ queryKey: investigationKeys.detail(investigationId) });
    },
  });
}

export function useAddWitnessStatement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      investigationId,
      ...statement
    }: {
      investigationId: string;
      witnessName: string;
      jobTitle?: string;
      employer?: string;
      phone?: string;
      statementText: string;
      collectionDate: string;
    }) => {
      const { data } = await apiClient.post<{ id: string }>(
        `/investigations/${investigationId}/witness-statements`,
        statement,
      );
      return data;
    },
    onSuccess: (_data, { investigationId }) => {
      queryClient.invalidateQueries({ queryKey: investigationKeys.detail(investigationId) });
    },
  });
}

export function useReviewInvestigation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      investigationId,
      action,
      comments,
    }: {
      investigationId: string;
      action: 'approve' | 'return';
      comments?: string;
    }) => {
      await apiClient.post(`/investigations/${investigationId}/review`, {
        action,
        comments,
      });
    },
    onSuccess: (_data, { investigationId }) => {
      queryClient.invalidateQueries({ queryKey: investigationKeys.detail(investigationId) });
      queryClient.invalidateQueries({ queryKey: investigationKeys.lists() });
    },
  });
}
