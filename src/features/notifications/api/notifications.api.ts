import api from '../../../lib/axios';
import { unwrap } from '../../../lib/api';
import type {
  ApiResponse,
  NotificationData,
  NotificationsData,
  NotificationsReadAllData,
} from '../../../types/api.types';

export function listNotifications() {
  return unwrap<NotificationsData>(api.get<ApiResponse<NotificationsData>>('/notifications'));
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
