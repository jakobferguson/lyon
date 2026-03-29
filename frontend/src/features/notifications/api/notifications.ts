import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';

export interface NotificationDto {
  id: string;
  type: string;
  title: string;
  summary: string;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  isPersistentBanner: boolean;
  createdAt: string;
}

export interface NotificationCountDto {
  unreadCount: number;
  bannerCount: number;
}

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (page: number) => [...notificationKeys.all, 'list', page] as const,
  count: ['notifications', 'count'] as const,
};

export function useNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.count,
    queryFn: async () => {
      const { data } = await apiClient.get<NotificationCountDto>('/notifications/count');
      return data;
    },
    refetchInterval: 30_000, // Poll every 30 seconds
  });
}

export interface PaginatedNotifications {
  items: NotificationDto[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export function useNotifications(page = 1) {
  return useQuery({
    queryKey: notificationKeys.list(page),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedNotifications>('/notifications', {
        params: { pageNumber: page, pageSize: 20 },
      });
      return data;
    },
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.count });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.count });
    },
  });
}
