import { useContext } from 'react'
import { NotificationContext } from './notificationContextBase'

export function useNotifications() {
  return useContext(NotificationContext)
}
