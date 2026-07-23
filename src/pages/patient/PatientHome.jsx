import { useState, useEffect } from 'react'
import { getDoctors, getSlots, bookAppointment } from '../../api/appointments'

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
      <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-bold text-green-600 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600 mb-4">Your ticket number is:</p>
        <p className="text-5xl font-bold text-blue-600 mb-4">#{confirmedTicket.ticket_number}</p>
        <p className="text-sm text-gray-500">
          with {confirmedTicket.doctor_name} on {confirmedTicket.date}
        </p>
        <button
          onClick={() => setConfirmedTicket(null)}
          className="mt-6 text-blue-600 hover:underline text-sm"
        >
          Book another appointment
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Book an Appointment</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Choose a doctor</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {doctors.map((doctor) => (
            <button
              key={doctor.id}
              onClick={() => setSelectedDoctor(doctor)}
              className={`text-left p-4 rounded-lg border ${
                selectedDoctor?.id === doctor.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <p className="font-semibold">{doctor.name}</p>
              <p className="text-sm text-gray-500">{doctor.specialty}</p>
            </button>
          ))}
        </div>
      </div>

      {selectedDoctor && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Available slots with {selectedDoctor.name}
          </label>

          {loadingSlots && <p className="text-gray-500">Loading slots...</p>}

          {!loadingSlots && slots.length === 0 && (
            <p className="text-gray-500">No open slots for this doctor right now.</p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {slots.map((slot) => (
              <button
                key={slot.id}
                disabled={booking}
                onClick={() => handleBook(slot)}
                className="p-3 rounded-lg border border-gray-200 bg-white hover:border-blue-600 hover:bg-blue-50 disabled:opacity-50"
              >
                <p className="font-medium">{slot.start_time.slice(0, 5)}</p>
                <p className="text-xs text-gray-500">{slot.date}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientHome