import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import type { IncidentFormValues } from '../types';

// ── Types matching backend DTOs ─────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface IncidentListItem {
  id: string;
  incidentNumber: string;
  incidentType: string;
  dateTime: string;
  division: string | null;
  project: string | null;
  severity: string | null;
  status: string;
  description: string;
  reportedBy: string;
  location: {
    latitude: number | null;
    longitude: number | null;
    textDescription: string;
    gpsSource: string | null;
  };
}

export interface IncidentDetail extends IncidentListItem {
  timezoneId: string;
  potentialSeverity: string | null;
  immediateActions: string | null;
  shift: string | null;
  shiftStart: string | null;
  shiftEnd: string | null;
  weather: string | null;
  onRailroadProperty: boolean;
  divisionId: string | null;
  projectId: string | null;
  railroadId: string | null;
  railroad: string | null;
  isOshaRecordable: boolean | null;
  isDart: boolean | null;
  oshaOverrideJustification: string | null;
  reopenCount: number;
  reportedById: string;
  createdAt: string;
  updatedAt: string;
  injuredPersons: InjuredPersonDto[];
  photos: PhotoDto[];
  railroadNotification: RailroadNotificationDto | null;
}

export interface InjuredPersonDto {
  id: string;
  name: string;
  jobTitle: string | null;
  division: string | null;
  injuryType: string | null;
  bodyPart: string | null;
  bodySide: string | null;
  treatmentType: string | null;
  returnToWorkStatus: string | null;
  daysAway: number | null;
  daysRestricted: number | null;
}

export interface PhotoDto {
  id: string;
  fileName: string;
  url: string;
  contentType: string;
  fileSizeBytes: number;
  sortOrder: number;
}

export interface RailroadNotificationDto {
  id: string;
  railroad: string;
  wasNotified: boolean;
  notificationDateTime: string | null;
  method: string | null;
  personNotified: string | null;
  personTitle: string | null;
  notes: string | null;
  deadline: string | null;
  isOverdue: boolean;
}

// ── Query keys ──────────────────────────────────────────────────────────────

export const incidentKeys = {
  all: ['incidents'] as const,
  lists: () => [...incidentKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...incidentKeys.lists(), params] as const,
  details: () => [...incidentKeys.all, 'detail'] as const,
  detail: (id: string) => [...incidentKeys.details(), id] as const,
};

// ── Queries ─────────────────────────────────────────────────────────────────

export interface IncidentListParams {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
  incidentType?: string;
  divisionId?: string;
  search?: string;
  sortBy?: string;
  sortDesc?: boolean;
}

export function useIncidentList(params: IncidentListParams = {}) {
  return useQuery({
    queryKey: incidentKeys.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<IncidentListItem>>(
        '/incidents',
        { params },
      );
      return data;
    },
  });
}

export function useIncidentDetail(id: string) {
  return useQuery({
    queryKey: incidentKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<IncidentDetail>(`/incidents/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// ── Mutations ───────────────────────────────────────────────────────────────

function mapFormToRequest(form: IncidentFormValues, submitAsReported: boolean) {
  return {
    incidentType: form.incidentType,
    dateTime: form.dateTime,
    timezoneId: Intl.DateTimeFormat().resolvedOptions().timeZone,
    description: form.description,
    locationDescription: form.location.textDescription,
    locationLatitude: form.location.latitude,
    locationLongitude: form.location.longitude,
    locationGpsSource: form.location.gpsSource,
    divisionId: form.division || undefined,
    projectId: form.project || undefined,
    immediateActions: form.immediateActions || undefined,
    severity: form.severity || undefined,
    potentialSeverity: form.potentialSeverity || undefined,
    shift: form.shift || undefined,
    shiftStart: form.shiftStart || undefined,
    shiftEnd: form.shiftEnd || undefined,
    weather: form.weather || undefined,
    onRailroadProperty: form.onRailroadProperty,
    railroadId: form.railroadClient || undefined,
    isOshaRecordable: form.isOshaRecordable,
    isDart: form.isDart,
    oshaOverrideJustification: form.oshaOverrideJustification || undefined,
    submitAsReported,
    injuredPersons: form.injuredPersons
      .filter((ip) => ip.name)
      .map((ip) => ({
        name: ip.name,
        jobTitle: ip.jobTitle || undefined,
        divisionId: ip.division || undefined,
        injuryType: ip.injuryType || undefined,
        bodyPart: ip.bodyPart || undefined,
        bodySide: ip.bodySide || undefined,
        treatmentType: ip.treatmentType || undefined,
        returnToWorkStatus: ip.returnToWork || undefined,
        daysAway: ip.daysAway ? Number(ip.daysAway) : undefined,
        daysRestricted: ip.daysRestricted ? Number(ip.daysRestricted) : undefined,
      })),
    railroadNotification:
      form.railroadNotification.wasNotified !== null
        ? {
            wasNotified: form.railroadNotification.wasNotified,
            notificationDateTime: form.railroadNotification.notificationDateTime || undefined,
            method: form.railroadNotification.method || undefined,
            personNotified: form.railroadNotification.personNotified || undefined,
            personTitle: form.railroadNotification.personTitle || undefined,
            notes: form.railroadNotification.notes || undefined,
          }
        : undefined,
  };
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ form, submitAsReported }: { form: IncidentFormValues; submitAsReported: boolean }) => {
      const { data } = await apiClient.post<IncidentDetail>(
        '/incidents',
        mapFormToRequest(form, submitAsReported),
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
    },
  });
}

export function useUpdateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, form }: { id: string; form: Partial<IncidentFormValues> }) => {
      const { data } = await apiClient.put<IncidentDetail>(`/incidents/${id}`, form);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
    },
  });
}

export function useTransitionIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, newStatus, reason }: { id: string; newStatus: string; reason?: string }) => {
      await apiClient.post(`/incidents/${id}/transition`, { newStatus, reason });
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
    },
  });
}

export function useUploadPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ incidentId, file }: { incidentId: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await apiClient.post<PhotoDto>(
        `/incidents/${incidentId}/photos`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      return data;
    },
    onSuccess: (_data, { incidentId }) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(incidentId) });
    },
  });
}
