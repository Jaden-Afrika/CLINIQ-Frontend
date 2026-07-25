import { useEffect, useState } from 'react'
import { getDoctorAppointments, recordTreatment } from '../../api/doctor'

function normalizeAppointments(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.appointments)) return payload.appointments
  if (Array.isArray(payload?.results)) return payload.results
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

function appointmentId(appointment) {
  return appointment.id ?? appointment.appointment_id
}

function DoctorAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [recordingId, setRecordingId] = useState(null)
  const [draft, setDraft] = useState({ diagnosis: '', treatment: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await getDoctorAppointments()
      setAppointments(normalizeAppointments(data))
    } catch {
      setError('Could not load your schedule. Please try again.')
    } finally { setLoading(false) }
  }

  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [])

  function openTreatmentForm(appointment) {
    setSuccess('')
    setError('')
    setRecordingId(appointmentId(appointment))
    setDraft({ diagnosis: appointment.diagnosis || '', treatment: appointment.treatment || '' })
  }

  async function submitTreatment(event) {
    event.preventDefault()
    if (!recordingId || !draft.treatment.trim()) return
    setSaving(true)
    setError('')
    try {
      await recordTreatment(recordingId, { diagnosis: draft.diagnosis, treatment: draft.treatment.trim() })
      setRecordingId(null)
      setDraft({ diagnosis: '', treatment: '' })
      setSuccess('Treatment recorded and appointment marked completed.')
      await load()
      window.dispatchEvent(new Event('doctor-treatment-recorded'))
    } catch {
      setError('Could not record treatment. Please try again.')
    } finally { setSaving(false) }
  }

  return <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-14">
    <p className="text-xs font-semibold uppercase tracking-[.16em] text-ink/55">Doctor portal</p>
    <h1 className="mt-2 font-display text-4xl font-bold">Scheduled appointments</h1>
    <p className="mt-3 text-sm text-ink/65">Record treatment after a visit to complete the appointment.</p>
    <button onClick={load} className="mt-5 border border-ink/25 bg-panel px-3 py-2 text-sm font-semibold">Refresh</button>
    {success && <p className="mt-5 border-l-4 border-status-ok bg-status-ok/10 p-3 text-sm">{success}</p>}
    {error && <p className="mt-5 border-l-4 border-status-alert bg-status-alert/10 p-3 text-sm">{error}</p>}
    {loading && <p className="mt-8 text-sm text-ink/60">Loading your schedule...</p>}
    {!loading && !error && appointments.length === 0 && <p className="mt-8 border border-ink/15 bg-panel p-5 text-sm text-ink/65">No appointments are scheduled.</p>}
    {!loading && appointments.length > 0 && <div className="mt-8 overflow-x-auto border border-ink/15 bg-panel"><table className="w-full min-w-175 text-sm"><thead className="bg-ink text-left text-panel/75"><tr><th className="p-4">Date & time</th><th className="p-4">Patient</th><th className="p-4">Ticket</th><th className="p-4">Status</th><th className="p-4 text-right">Action</th></tr></thead><tbody>{appointments.map((appointment) => { const id = appointmentId(appointment); const completed = appointment.status === 'completed'; return <tr key={id} className="border-t border-ink/10"><td className="p-4">{appointment.date} · {(appointment.scheduled_time || appointment.start_time || appointment.time || appointment.slot_time)?.slice(0, 5) || 'Walk-in'}</td><td className="p-4 font-semibold">{appointment.patient_username || appointment.patient_name || appointment.patient?.username}</td><td className="p-4 font-ticket font-bold text-ticket">#{appointment.ticket_number}</td><td className="p-4 capitalize">{appointment.status?.replace('_', ' ')}</td><td className="p-4 text-right">{!completed && <button onClick={() => openTreatmentForm(appointment)} className="text-sm font-bold text-status-ok hover:underline">Record treatment</button>}</td></tr> })}</tbody></table></div>}
    {recordingId && <form onSubmit={submitTreatment} className="mt-7 border border-ink/15 bg-panel p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-ink/55">Visit completion</p><h2 className="mt-1 font-display text-2xl font-bold">Record treatment</h2></div><button type="button" onClick={() => setRecordingId(null)} className="text-sm font-semibold text-ink/65 hover:text-ink">Cancel</button></div><div className="mt-5 grid gap-4"><label className="text-sm font-semibold">Diagnosis <span className="font-normal text-ink/55">(optional)</span><textarea value={draft.diagnosis} onChange={(e) => setDraft({ ...draft, diagnosis: e.target.value })} className="mt-2 min-h-24 w-full border border-ink/25 p-3 font-normal" placeholder="Diagnosis" /></label><label className="text-sm font-semibold">Treatment <span className="text-status-alert">(required)</span><textarea required value={draft.treatment} onChange={(e) => setDraft({ ...draft, treatment: e.target.value })} className="mt-2 min-h-28 w-full border border-ink/25 p-3 font-normal" placeholder="Treatment notes" /></label></div><button disabled={saving || !draft.treatment.trim()} className="mt-5 bg-ink px-5 py-3 text-sm font-bold text-panel disabled:opacity-50">{saving ? 'Recording...' : 'Complete appointment'}</button></form>}
  </div>
}

export default DoctorAppointments
