import { useEffect, useState } from 'react'
import { getDoctorDashboard, saveDiagnosis } from '../../api/doctor'

function normalizeTreatments(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.treatments)) return payload.treatments
  if (Array.isArray(payload?.results)) return payload.results
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

function DoctorDashboard() {
  const [treatments, setTreatments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [drafts, setDrafts] = useState({})
  const [saving, setSaving] = useState(null)
  const [success, setSuccess] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await getDoctorDashboard()
      setTreatments(normalizeTreatments(data))
    } catch {
      setError('Could not load completed treatments. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    window.addEventListener('doctor-treatment-recorded', load)
    return () => window.removeEventListener('doctor-treatment-recorded', load)
  }, [])

  async function handleSave(treatment) {
    const treatmentId = treatment.id ?? treatment.appointment_id
    const diagnosis = drafts[treatmentId] ?? treatment.diagnosis ?? ''

    if (!treatmentId) return

    setSaving(treatmentId)
    setSuccess('')
    setError('')
    try {
      const updated = await saveDiagnosis(treatmentId, diagnosis)
      setTreatments((items) =>
        items.map((item) => {
          const currentId = item.id ?? item.appointment_id
          if (currentId !== treatmentId) return item
          return { ...item, ...(updated || {}), diagnosis }
        })
      )
      setSuccess('Diagnosis saved.')
    } catch {
      setError('Could not save the diagnosis. Please try again.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-[.16em] text-ink/55">Doctor portal</p>
      <h1 className="mt-2 font-display text-4xl font-bold">Completed treatments</h1>
      <p className="mt-3 text-sm text-ink/65">Add or update the diagnosis after each completed visit.</p>

      {success && <p className="mt-5 border-l-4 border-status-ok bg-status-ok/10 px-4 py-3 text-sm">{success}</p>}
      {error && <p className="mt-5 border-l-4 border-status-alert bg-status-alert/10 px-4 py-3 text-sm">{error}</p>}
      {loading && <p className="mt-8 text-sm text-ink/60">Loading completed treatments...</p>}
      {!loading && !error && treatments.length === 0 && (
        <p className="mt-8 border border-ink/15 bg-panel p-5 text-sm text-ink/65">No completed treatments yet.</p>
      )}
      {!loading && treatments.length > 0 && (
        <div className="mt-8 space-y-4">
          {treatments.map((treatment) => {
            const treatmentId = treatment.id ?? treatment.appointment_id
            return (
              <article key={treatmentId} className="border border-ink/15 bg-panel p-5">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="font-semibold">{treatment.patient_username || treatment.patient_name || treatment.patient?.username}</p>
                    <p className="mt-1 text-sm text-ink/60">
                      {treatment.date} · Ticket <span className="font-ticket font-bold">#{treatment.ticket_number}</span>
                    </p>
                  </div>
                  {treatment.rating && <p className="font-ticket text-ticket">★ {treatment.rating}/5</p>}
                </div>
                {treatment.comment && <p className="mt-4 border-l-2 border-ticket pl-3 text-sm text-ink/70">“{treatment.comment}”</p>}
                <label className="mt-5 block text-sm font-semibold">
                  Diagnosis
                  <textarea
                    value={drafts[treatmentId] ?? treatment.diagnosis ?? ''}
                    onChange={(e) => setDrafts((current) => ({ ...current, [treatmentId]: e.target.value }))}
                    className="mt-2 min-h-24 w-full border border-ink/25 p-3 font-normal"
                    placeholder="Add a diagnosis"
                  />
                </label>
                <button
                  onClick={() => handleSave(treatment)}
                  disabled={saving === treatmentId}
                  className="mt-3 bg-ink px-4 py-2 text-sm font-bold text-panel disabled:opacity-50"
                >
                  {saving === treatmentId ? 'Saving...' : 'Save diagnosis'}
                </button>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default DoctorDashboard
