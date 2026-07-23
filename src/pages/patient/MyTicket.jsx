import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyTicket } from '../../api/appointments'

function MyTicket() {
  const [ticket, setTicket] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadTicket() {
    setLoading(true)
    setError('')
    try {
      const data = await getMyTicket()
      setTicket(data)
    } catch (err) {
      if (err.response?.status === 404) {
        setTicket(null)
        setError('You have no active ticket for today.')
      } else {
        setError('Could not load your ticket.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTicket()
  }, [])

  return (
    <div className="max-w-md mx-auto mt-12 p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">My Ticket</h1>

      {loading && <p className="text-center text-gray-500">Loading...</p>}

      {!loading && error && (
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error}</p>
          <Link to="/" className="text-blue-600 hover:underline">Book an appointment</Link>
        </div>
      )}

      {!loading && ticket && (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-sm text-gray-500 mb-1">Your ticket</p>
          <p className="text-5xl font-bold text-blue-600 mb-4">#{ticket.ticket_number}</p>

          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-gray-500 mb-1">Now serving</p>
            <p className="text-3xl font-semibold text-gray-700">#{ticket.now_serving}</p>
          </div>

          <p className="text-sm text-gray-500 mt-4">with {ticket.doctor_name}</p>

          <button
            onClick={loadTicket}
            className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  )
}

export default MyTicket
