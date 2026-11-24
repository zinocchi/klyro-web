import api from '../../../lib/axios';
import { unwrap } from '../../../lib/api';
import type {
  ApiResponse,
  CreateNotificationRequest,
  NotificationData,
  NotificationsData,
  NotificationsReadAllData,
} from '../../../types/api.types';

export function listNotifications() {
  return unwrap<NotificationsData>(api.get<ApiResponse<NotificationsData>>('/notifications'));
}

export function createNotification(payload: CreateNotificationRequest) {
  return unwrap<NotificationData>(
    api.post<ApiResponse<NotificationData>>('/notifications', payload),
  );
}

export function markNotificationRead(id: string) {
  return unwrap<NotificationData>(
    api.patch<ApiResponse<NotificationData>>(`/notifications/${id}/read`),
  );
}

export function markAllNotificationsRead() {
  return unwrap<NotificationsReadAllData>(
    api.patch<ApiResponse<NotificationsReadAllData>>('/notifications/read-all'),
  );
}
