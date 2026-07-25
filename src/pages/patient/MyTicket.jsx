import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyTicket, submitRating } from '../../api/appointments'
import TicketStub from '../../components/TicketStub'

function MyTicket() {
  const [ticket, setTicket] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [ratingState, setRatingState] = useState('')
  const [submittingRating, setSubmittingRating] = useState(false)

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
      } else if (err.response?.status === 401) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
      } else {
        setError('Could not load your ticket.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleRatingSubmit(e) {
    e.preventDefault()
    if (!rating || !ticket) return

    const appointmentId = ticket.id || ticket.appointment_id
    if (!appointmentId) return

    setSubmittingRating(true)
    setRatingState('')
    try {
      const response = await submitRating(appointmentId, rating, comment)
      setTicket((current) => ({
        ...current,
        is_rated: true,
        rating,
        comment,
        ...(response && typeof response === 'object' ? response : {}),
      }))
      setRatingState('Thanks — your rating has been recorded.')
    } catch (err) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || 'We could not submit your rating. Please try again.'
      setRatingState(message)
    } finally {
      setSubmittingRating(false)
    }
  }

  useEffect(() => {
    loadTicket()
  }, [])

  const isCompletedVisit = ticket?.status === 'completed' || ticket?.status === 'complete' || ticket?.status === 'done'
  const canRateVisit = Boolean(ticket && isCompletedVisit && !ticket.is_rated && !ticket.rating)

  return (
    <div className="mx-auto max-w-md px-5 py-12 sm:py-16">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-ink/55">Today’s queue</p>
      <h1 className="mt-2 text-center font-display text-4xl font-bold text-ink">My ticket</h1>

      {loading && <p className="mt-8 text-center text-sm text-ink/60">Finding your ticket...</p>}

      {!loading && error && (
        <div className="mt-8 text-center">
          <p className="text-sm leading-6 text-ink/65">{error} Book an appointment to get your place in today’s queue.</p>
          <Link to="/" className="mt-5 inline-block bg-ticket px-5 py-3 text-sm font-semibold text-ink hover:bg-ticket/85">Book an appointment</Link>
        </div>
      )}

      {!loading && ticket && (
        <div className="mt-8">
          <TicketStub ticketNumber={ticket.ticket_number} doctorName={ticket.doctor_name} date={ticket.date} time={ticket.scheduled_time}>
            <div className="mt-7 grid grid-cols-2 gap-3 border-t border-dashed border-ink/25 pt-5 text-left">
              <div><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/55">Your number</p><p className="ticket-number mt-2 text-3xl">#{ticket.ticket_number}</p></div>
              <div><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/55">Now serving</p><p className="ticket-number mt-2 text-3xl">#{ticket.now_serving}</p></div>
            </div>
          </TicketStub>

          {canRateVisit && (
            <form onSubmit={handleRatingSubmit} className="mt-5 border border-ink/15 bg-panel p-5">
              <h2 className="font-display text-2xl font-bold">Rate your visit</h2>
              <p className="mt-1 text-sm text-ink/65">How was your care today?</p>
              <div className="mt-4 flex gap-1" aria-label="Choose a rating from 1 to 5 stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-3xl ${star <= rating ? 'text-ticket' : 'text-ink/25'}`}
                    aria-label={`${star} star${star > 1 ? 's' : ''}`}
                    aria-pressed={rating === star}
                  >★</button>
                ))}
              </div>
              <label className="mt-4 block text-sm font-semibold">
                Comment <span className="font-normal text-ink/55">(optional)</span>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mt-2 min-h-20 w-full border border-ink/25 p-3 font-normal"
                  placeholder="Tell us about your visit"
                />
              </label>
              <button disabled={!rating || submittingRating} className="mt-4 bg-ink px-4 py-3 text-sm font-bold text-panel disabled:opacity-50">
                {submittingRating ? 'Submitting...' : 'Submit rating'}
              </button>
            </form>
          )}

          {ticket && !canRateVisit && isCompletedVisit && ticket.rating && (
            <div className="mt-5 border border-ink/15 bg-panel p-4 text-sm text-ink/70">
              <p className="font-semibold text-ink">Your visit rating</p>
              <p className="mt-1">{ticket.rating}/5{ticket.comment ? ` · ${ticket.comment}` : ''}</p>
            </div>
          )}

          {ratingState && <p className={`mt-4 border-l-4 px-4 py-3 text-sm ${ratingState.startsWith('Thanks') ? 'border-status-ok bg-status-ok/10' : 'border-status-alert bg-status-alert/10'}`}>{ratingState}</p>}

          <button
            onClick={loadTicket}
            className="mt-5 w-full border border-ink/25 bg-panel px-4 py-3 text-sm font-semibold text-ink hover:border-ink"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  )
}

export default MyTicket
