import { useEffect, useState } from 'react'
import { getDoctorAppointments } from '../../api/doctor'

function normalizeAppointments(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.appointments)) return payload.appointments
  if (Array.isArray(payload?.results)) return payload.results
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

function DoctorAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await getDoctorAppointments()
      setAppointments(normalizeAppointments(data))
    } catch {
      setError('Could not load your schedule. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-[.16em] text-ink/55">Doctor portal</p>
      <h1 className="mt-2 font-display text-4xl font-bold">Scheduled appointments</h1>
      <button onClick={load} className="mt-5 border border-ink/25 bg-panel px-3 py-2 text-sm font-semibold">Refresh</button>
      {error && <p className="mt-5 border-l-4 border-status-alert bg-status-alert/10 p-3 text-sm">{error}</p>}
      {loading && <p className="mt-8 text-sm text-ink/60">Loading your schedule...</p>}
      {!loading && !error && appointments.length === 0 && <p className="mt-8 border border-ink/15 bg-panel p-5 text-sm text-ink/65">No appointments are scheduled.</p>}
      {!loading && appointments.length > 0 && (
        <div className="mt-8 overflow-x-auto border border-ink/15 bg-panel">
          <table className="w-full min-w-150 text-sm">
            <thead className="bg-ink text-left text-panel/75">
              <tr>
                <th className="p-4">Date & time</th>
                <th className="p-4">Patient</th>
                <th className="p-4">Ticket</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id ?? appointment.appointment_id} className="border-t border-ink/10">
                  <td className="p-4">{appointment.date} · {appointment.start_time?.slice(0, 5) || appointment.time || appointment.slot_time}</td>
                  <td className="p-4 font-semibold">{appointment.patient_username || appointment.patient_name || appointment.patient?.username}</td>
                  <td className="p-4 font-ticket font-bold text-ticket">#{appointment.ticket_number}</td>
                  <td className="p-4 capitalize">{appointment.status?.replace('_', ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default DoctorAppointments
