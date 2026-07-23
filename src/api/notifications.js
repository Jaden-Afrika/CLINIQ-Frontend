import apiClient from './client'

export async function getNotifications() {
  const res = await apiClient.get('/notifications/')
  return res.data
}

export async function getUnreadNotificationCount() {
  const res = await apiClient.get('/notifications/unread-count/')
  return res.data.unread_count
}

export async function markNotificationRead(notificationId) {
  const res = await apiClient.patch(`/notifications/${notificationId}/read/`)
  return res.data
}
