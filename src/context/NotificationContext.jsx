import { useCallback, useEffect, useState } from 'react'
import { getUnreadNotificationCount, markNotificationRead } from '../api/notifications'
import { useAuth } from './AuthContext'
import { NotificationContext } from './notificationContextBase'

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  const refreshUnreadCount = useCallback(async () => {
    if (!['patient', 'doctor'].includes(user?.role)) {
      setUnreadCount(0)
      return 0
    }
    const count = await getUnreadNotificationCount()
    setUnreadCount(count)
    return count
  }, [user?.id, user?.role])

  const markAsRead = useCallback(async (notificationId, wasUnread) => {
    const updatedNotification = await markNotificationRead(notificationId)
    if (wasUnread) setUnreadCount((count) => Math.max(0, count - 1))
    return updatedNotification
  }, [])

  useEffect(() => {
    if (!['patient', 'doctor'].includes(user?.role)) {
      setUnreadCount(0)
      return undefined
    }
    refreshUnreadCount().catch(() => {})
    const intervalId = window.setInterval(() => refreshUnreadCount().catch(() => {}), 45000)
    return () => window.clearInterval(intervalId)
  }, [user?.role, refreshUnreadCount])

  return <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount, markAsRead }}>{children}</NotificationContext.Provider>
}
