import { useState, useEffect } from 'react'
import { getDoctors, getSlots, bookAppointment } from '../../api/appointments'
import TicketStub from '../../components/TicketStub'

function PatientHome() {
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [booking, setBooking] = useState(false)
  const [confirmedTicket, setConfirmedTicket] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getDoctors().then(setDoctors).catch(() => setError('Could not load doctors.'))
  }, [])

  useEffect(() => {
    if (!selectedDoctor) {
      setSlots([])
      return
    }
    setLoadingSlots(true)
    getSlots(selectedDoctor.id)
      .then(setSlots)
      .catch(() => setError('Could not load slots.'))
      .finally(() => setLoadingSlots(false))
  }, [selectedDoctor])

  async function handleBook(slot) {
    setBooking(true)
    setError('')
    try {
      const appointment = await bookAppointment(slot.id)
      setConfirmedTicket(appointment)
      setSlots((prev) => prev.filter((s) => s.id !== slot.id))
    } catch (err) {
      setError('That slot may already be booked. Please pick another.')
    } finally {
      setBooking(false)
    }
  }

  if (confirmedTicket) {
    return (
      <div className="mx-auto max-w-md px-5 py-12 text-center sm:py-16">
        <p className="text-sm font-semibold text-status-ok">Booked — you’re all set.</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink">Keep this number handy</h1>
        <div className="mt-7">
          <TicketStub ticketNumber={confirmedTicket.ticket_number} doctorName={confirmedTicket.doctor_name} date={confirmedTicket.date} />
        </div>
        <button
          onClick={() => setConfirmedTicket(null)}
          className="mt-7 text-sm font-semibold text-ink/70 underline decoration-ink/30 underline-offset-4 hover:text-ink"
        >
          Book another appointment
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-6 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/55">Appointments</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink">Book your visit</h1>
      <p className="mt-3 max-w-lg text-sm leading-6 text-ink/65">Choose a doctor, then select a time that works for you.</p>

      {error && <p className="mt-6 border-l-4 border-status-alert bg-status-alert/10 px-4 py-3 text-sm text-ink">{error}</p>}

      <div className="mt-9">
        <label className="block text-sm font-semibold text-ink mb-3">Choose a doctor</label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {doctors.map((doctor) => (
            <button
              key={doctor.id}
              onClick={() => setSelectedDoctor(doctor)}
              className={`min-h-24 border p-5 text-left ${
                selectedDoctor?.id === doctor.id
                  ? 'border-ink bg-ink text-panel shadow-sm'
                  : 'border-ink/15 bg-panel hover:border-ink/45'
              }`}
            >
              <p className="font-semibold">{doctor.name}</p>
              <p className={`mt-1 text-sm ${selectedDoctor?.id === doctor.id ? 'text-panel/70' : 'text-ink/60'}`}>{doctor.specialty}</p>
            </button>
          ))}
        </div>
      </div>

      {selectedDoctor && (
        <div className="mt-9">
          <label className="block text-sm font-semibold text-ink mb-3">
            Available slots with {selectedDoctor.name}
          </label>

          {loadingSlots && <p className="text-sm text-ink/60">Finding today’s available times...</p>}

          {!loadingSlots && slots.length === 0 && (
            <p className="border-l-4 border-ink/30 bg-panel px-4 py-3 text-sm text-ink/65">No slots left today for this doctor. Please choose another doctor or check again later.</p>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {slots.map((slot) => (
              <button
                key={slot.id}
                disabled={booking}
                onClick={() => handleBook(slot)}
                className="min-h-20 border border-ink/15 bg-panel p-3 text-left hover:border-ink hover:bg-ink/5 disabled:opacity-50"
              >
                <p className="font-medium">{slot.start_time.slice(0, 5)}</p>
                <p className="mt-1 text-xs text-ink/55">{slot.date}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientHome
