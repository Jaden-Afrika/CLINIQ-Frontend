import { useEffect, useState } from 'react'
import { getAccountSettings, updateAccountSettings } from '../api/dashboard'

export default function Settings() {
  const [form, setForm] = useState(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getAccountSettings()
      .then((data) => setForm({ ...data, current_password: '', new_password: '' }))
      .catch(() => setMessage('Could not load account settings.'))
  }, [])

  if (!form) return <p className="p-10 text-center text-sm text-ink/60">Loading settings...</p>

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const payload = {
        full_name: form.full_name,
        phone: form.phone,
        email: form.email,
        notifications_enabled: form.notifications_enabled,
      }
      if (form.new_password || form.current_password) {
        Object.assign(payload, {
          current_password: form.current_password,
          new_password: form.new_password,
        })
      }

      const data = await updateAccountSettings(payload)
      setForm({ ...data, current_password: '', new_password: '' })
      setMessage('Your settings have been saved.')
    } catch (error) {
      setMessage(error.response?.data?.current_password?.[0] || error.response?.data?.new_password?.[0] || 'Could not save your settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl px-5 py-10 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-[.16em] text-ink/55">Account</p>
      <h1 className="mt-2 font-display text-4xl font-bold">Settings</h1>
      <div className="mt-8 space-y-5 border border-ink/15 bg-panel p-6">
        <label className="block text-sm font-semibold">
          Name
          <input
            disabled
            value={form.full_name || ''}
            className="mt-2 w-full border border-ink/15 bg-paper px-3 py-3 font-normal text-ink/60"
          />
        </label>

        <label className="block text-sm font-semibold">
          Email
          <input
            type="email"
            value={form.email || ''}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-2 w-full border border-ink/25 px-3 py-3 font-normal"
          />
        </label>

        <label className="block text-sm font-semibold">
          Phone
          <input
            value={form.phone || ''}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-2 w-full border border-ink/25 px-3 py-3 font-normal"
          />
        </label>

        <label className="flex items-center justify-between gap-4 border-y border-ink/10 py-4 text-sm font-semibold">
          In-app notifications
          <input
            type="checkbox"
            checked={form.notifications_enabled !== false}
            onChange={(e) => setForm({ ...form, notifications_enabled: e.target.checked })}
            className="h-5 w-5"
          />
        </label>

        <div className="border-t border-ink/10 pt-5">
          <h2 className="font-display text-2xl font-bold">Change password</h2>
          <label className="mt-4 block text-sm font-semibold">
            Current password
            <input
              type="password"
              value={form.current_password}
              onChange={(e) => setForm({ ...form, current_password: e.target.value })}
              className="mt-2 w-full border border-ink/25 px-3 py-3 font-normal"
            />
          </label>
          <label className="mt-4 block text-sm font-semibold">
            New password
            <input
              type="password"
              value={form.new_password}
              onChange={(e) => setForm({ ...form, new_password: e.target.value })}
              className="mt-2 w-full border border-ink/25 px-3 py-3 font-normal"
            />
          </label>
        </div>

        {message && <p className="border-l-4 border-status-ok bg-status-ok/10 p-3 text-sm">{message}</p>}
        <button disabled={saving} className="mt-5 w-full bg-ink py-3 text-sm font-bold text-panel disabled:opacity-50">
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

