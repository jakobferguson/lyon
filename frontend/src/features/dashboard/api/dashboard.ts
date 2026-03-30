import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import type { IncidentListItem } from '../../incidents/api/incidents';

// ── Types matching backend DTOs ─────────────────────────────────────────────

export interface DashboardKpi {
  trir: number;
  trirTrend: number;
  dartRate: number;
  dartRateTrend: number;
  nearMissRatio: number;
  nearMissRatioTrend: number;
  openInvestigations: number;
  openCapas: number;
  lostWorkDaysYtd: number;
}

export interface MonthlyTrendPoint {
  year: number;
  month: number;
  value: number;
  category?: string;
}

export interface DivisionBreakdownItem {
  division: string;
  incidentType: string;
  count: number;
}

export interface SeverityDistributionItem {
  severity: string;
  count: number;
}

export interface LeadingIndicatorsDto {
  nearMissReportingRate: number;
  nearMissTarget: number;
  capaClosureRate: number;
  capaClosureTarget: number;
  investigationTimeliness: number;
  investigationTimelinessTarget: number;
}

export interface DashboardResponse {
  kpis: DashboardKpi;
  incidentTrend: MonthlyTrendPoint[];
  trirTrend: MonthlyTrendPoint[];
  divisionBreakdown: DivisionBreakdownItem[];
  severityDistribution: SeverityDistributionItem[];
  leadingIndicators: LeadingIndicatorsDto;
  recentIncidents: IncidentListItem[];
}

// ── Query keys ──────────────────────────────────────────────────────────────

export interface DashboardParams {
  divisionId?: string;
  projectId?: string;
  incidentType?: string;
  startDate?: string;
  endDate?: string;
}

export const dashboardKeys = {
  all: ['dashboard'] as const,
  query: (params: DashboardParams) => [...dashboardKeys.all, params] as const,
};

// ── Query ───────────────────────────────────────────────────────────────────

export function useDashboard(params: DashboardParams = {}) {
  return useQuery({
    queryKey: dashboardKeys.query(params),
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardResponse>(
        '/dashboard',
        { params },
      );
      return data;
    },
  });
}
