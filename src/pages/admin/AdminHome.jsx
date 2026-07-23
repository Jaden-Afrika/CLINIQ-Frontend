import { useState, useEffect } from 'react'
import { getDoctors, getAdminQueue } from '../../api/appointments'

const statusStyles = {
  booked: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  no_show: 'bg-red-100 text-red-700',
}

function AdminHome() {
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(false)
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

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Check-In Dashboard</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select a doctor</label>
        <div className="flex flex-wrap gap-2">
          {doctors.map((doctor) => (
            <button
              key={doctor.id}
              onClick={() => loadQueue(doctor)}
              className={`px-4 py-2 rounded-full border text-sm ${
                selectedDoctor?.id === doctor.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              {doctor.name}
            </button>
          ))}
        </div>
      </div>

      {selectedDoctor && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 py-3 border-b flex justify-between items-center">
            <h2 className="font-semibold">Today's Queue — {selectedDoctor.name}</h2>
            <button
              onClick={() => loadQueue(selectedDoctor)}
              className="text-sm text-blue-600 hover:underline"
            >
              Refresh
            </button>
          </div>

          {loading && <p className="p-4 text-gray-500">Loading...</p>}

          {!loading && queue.length === 0 && (
            <p className="p-4 text-gray-500">No appointments today for this doctor.</p>
          )}

          {!loading && queue.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-2">Ticket</th>
                  <th className="px-4 py-2">Patient</th>
                  <th className="px-4 py-2">Source</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((appt) => (
                  <tr key={appt.id} className="border-t">
                    <td className="px-4 py-3 font-semibold">#{appt.ticket_number}</td>
                    <td className="px-4 py-3">{appt.patient_username}</td>
                    <td className="px-4 py-3 capitalize">{appt.source.replace('_', ' ')}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusStyles[appt.status]}`}>
                        {appt.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminHome
