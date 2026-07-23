import { useCallback, useEffect, useState } from 'react'
import { getNotifications } from '../../api/notifications'
import { useNotifications } from '../../context/useNotifications'

function formatNotificationDate(dateString) {
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(dateString))
}

function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [readingId, setReadingId] = useState(null)
  const { markAsRead, refreshUnreadCount } = useNotifications()

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setNotifications(await getNotifications())
      await refreshUnreadCount()
    } catch {
      setError('We could not load your notifications. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [refreshUnreadCount])

  useEffect(() => { loadNotifications() }, [loadNotifications])

  async function handleNotificationClick(notification) {
    if (notification.is_read || readingId) return
    setReadingId(notification.id)
    try {
      const updated = await markAsRead(notification.id, true)
      setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, ...updated, is_read: true } : item))
    } catch {
      setError('We could not mark that notification as read. Please try again.')
    } finally {
      setReadingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-6 sm:py-14">
      <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/55">Updates</p><h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink">Notifications</h1></div><button onClick={loadNotifications} className="border border-ink/25 bg-panel px-3 py-2 text-sm font-semibold text-ink hover:border-ink">Refresh</button></div>
      {loading && <p className="mt-8 text-sm text-ink/60">Loading your updates...</p>}
      {error && <p className="mt-6 border-l-4 border-status-alert bg-status-alert/10 px-4 py-3 text-sm text-ink">{error}</p>}
      {!loading && !error && notifications.length === 0 && <div className="mt-8 border border-ink/15 bg-panel px-5 py-8 text-center"><p className="font-display text-2xl font-bold">Nothing new right now</p><p className="mt-2 text-sm text-ink/65">Updates about your visit will appear here.</p></div>}
      {!loading && notifications.length > 0 && <ul className="mt-8 divide-y divide-ink/10 overflow-hidden border border-ink/15 bg-panel">{notifications.map((notification) => <li key={notification.id}><button onClick={() => handleNotificationClick(notification)} disabled={readingId === notification.id} className={`w-full px-5 py-5 text-left ${notification.is_read ? 'bg-panel text-ink/70' : 'bg-ticket/10 text-ink'} hover:bg-paper disabled:opacity-60`}><div className="flex gap-3">{!notification.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 bg-ticket" aria-label="Unread" />}<div><p className={notification.is_read ? 'text-sm leading-6' : 'text-sm font-semibold leading-6'}>{notification.message}</p><p className="mt-2 text-xs text-ink/55">{formatNotificationDate(notification.created_at)}</p></div></div></button></li>)}</ul>}
    </div>
  )
}

export default Notifications
