import { useEffect, useState } from 'react'
import { getDoctorFreeSlots } from '../../api/doctor'

function normalizeSlots(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.slots)) return payload.slots
  if (Array.isArray(payload?.results)) return payload.results
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

function DoctorFreeSlots() {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await getDoctorFreeSlots()
      setSlots(normalizeSlots(data))
    } catch {
      setError('Could not load your free times. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-6 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-[.16em] text-ink/55">Doctor portal</p>
      <h1 className="mt-2 font-display text-4xl font-bold">Free times</h1>
      <p className="mt-3 text-sm text-ink/65">These slots are currently available for patients to book.</p>
      {error && <p className="mt-6 border-l-4 border-status-alert bg-status-alert/10 p-3 text-sm">{error}</p>}
      {loading && <p className="mt-8 text-sm text-ink/60">Loading free times...</p>}
      {!loading && !error && slots.length === 0 && <p className="mt-8 border border-ink/15 bg-panel p-5 text-sm text-ink/65">You have no free times listed.</p>}
      {!loading && slots.length > 0 && (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {slots.map((slot) => (
            <article key={slot.id ?? slot.slot_id} className="border border-ink/15 bg-panel p-5">
              <p className="font-ticket text-xl font-bold text-ticket">{slot.start_time?.slice(0, 5) || slot.time || slot.slot_time}</p>
              <p className="mt-2 font-semibold">{slot.date}</p>
              <p className="mt-1 text-sm capitalize text-status-ok">{slot.status || 'Available'}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default DoctorFreeSlots
