import { useState, useEffect } from 'react'
import { getDoctors, getAdminQueue, advanceQueue, updateAppointmentStatus } from '../../api/appointments'

const statusStyles = {
  booked: 'bg-status-ok/15 text-status-ok',
  completed: 'bg-ink/10 text-ink',
  no_show: 'bg-status-alert/15 text-status-alert',
}

function AdminHome() {
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(false)
  const [actingOn, setActingOn] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getDoctors().then(setDoctors).catch(() => setError('Could not load doctors.'))
  }, [])

  async function loadQueue(doctor) {
    setSelectedDoctor(doctor)
    setLoading(true)
    setError('')
    try {
      const data = await getAdminQueue(doctor.id)
      setQueue(data)
    } catch (err) {
      setError('Could not load queue.')
    } finally {
      setLoading(false)
    }
  }

  async function handleNext() {
    if (!selectedDoctor) return
    setActingOn('next')
    setError('')
    try {
      await advanceQueue(selectedDoctor.id)
      await loadQueue(selectedDoctor)
    } catch (err) {
      setError('No booked appointment at the current ticket number.')
    } finally {
      setActingOn(null)
    }
  }

  async function handleStatusChange(appointmentId, status) {
    setActingOn(appointmentId)
    setError('')
    try {
      await updateAppointmentStatus(appointmentId, status)
      await loadQueue(selectedDoctor)
    } catch (err) {
      setError('Could not update status.')
    } finally {
      setActingOn(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/55">Front desk</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink">Today’s queue</h1>
      <p className="mt-3 text-sm text-ink/65">Choose a doctor to view the live check-in board.</p>

      {error && <p className="mt-6 border-l-4 border-status-alert bg-status-alert/10 px-4 py-3 text-sm text-ink">{error}</p>}

      <div className="mt-9">
        <label className="block text-sm font-semibold mb-3">Select a doctor</label>
        <div className="flex flex-wrap gap-2">
          {doctors.map((doctor) => (
            <button
              key={doctor.id}
              onClick={() => loadQueue(doctor)}
              className={`border px-4 py-3 text-sm font-semibold ${
                selectedDoctor?.id === doctor.id
                  ? 'border-ink bg-ink text-panel'
                  : 'border-ink/20 bg-panel text-ink hover:border-ink'
              }`}
            >
              {doctor.name}
            </button>
          ))}
        </div>
      </div>

      {selectedDoctor && (
        <div className="mt-8 overflow-hidden border border-ink/15 bg-panel shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/15 px-5 py-5">
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/55">Queue board</p><h2 className="mt-1 font-display text-2xl font-bold">{selectedDoctor.name}</h2></div>
            <div className="flex gap-2">
              <button
                onClick={handleNext}
                disabled={actingOn === 'next'}
                className="bg-ticket px-5 py-3 text-sm font-bold text-ink hover:bg-ticket/85 disabled:opacity-50"
              >
                {actingOn === 'next' ? 'Advancing...' : 'Next'}
              </button>
              <button
                onClick={() => loadQueue(selectedDoctor)}
                className="px-3 py-2 text-sm font-semibold text-ink/70 hover:text-ink"
              >
                Refresh
              </button>
            </div>
          </div>

          {loading && <p className="p-5 text-sm text-ink/60">Loading the queue...</p>}

          {!loading && queue.length === 0 && (
            <p className="p-5 text-sm text-ink/65">No appointments are booked for this doctor today.</p>
          )}

          {!loading && queue.length > 0 && (
            <div className="overflow-x-auto"><table className="w-full min-w-160 text-sm">
              <thead className="bg-ink text-left text-panel/70">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em]">Ticket</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em]">Patient</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em]">Source</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em]">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((appt) => (
                  <tr key={appt.id} className="border-t border-ink/10 hover:bg-paper/60">
                    <td className="px-5 py-4"><span className="ticket-number text-2xl">#{appt.ticket_number}</span></td>
                    <td className="px-5 py-4 font-semibold">{appt.patient_username}</td>
                    <td className="px-5 py-4 capitalize text-ink/65">{appt.source.replace('_', ' ')}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-bold capitalize ${statusStyles[appt.status]}`}>
                        {appt.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {appt.status === 'booked' && (
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleStatusChange(appt.id, 'completed')}
                            disabled={actingOn === appt.id}
                            className="text-xs font-semibold text-status-ok hover:underline disabled:opacity-50"
                          >
                            Mark Done
                          </button>
                          <button
                            onClick={() => handleStatusChange(appt.id, 'no_show')}
                            disabled={actingOn === appt.id}
                            className="text-xs font-semibold text-status-alert hover:underline disabled:opacity-50"
                          >
                            No Show
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminHome
