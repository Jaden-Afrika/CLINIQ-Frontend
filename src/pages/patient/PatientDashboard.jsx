import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPatientDashboard } from '../../api/dashboard'

function AppointmentRow({ appointment }) {
  return <li className="flex items-center justify-between gap-4 border-t border-ink/10 py-3 text-sm"><div><p className="font-semibold">{appointment.doctor_name}</p><p className="mt-1 text-ink/60">{appointment.date}</p></div><span className="capitalize text-ink/65">{appointment.status.replace('_', ' ')}</span></li>
}

export default function PatientDashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { getPatientDashboard().then(setData).catch(() => setError('Could not load your care summary.')) }, [])
  if (error) return <div className="mx-auto max-w-5xl px-5 py-12"><p className="border-l-4 border-status-alert bg-status-alert/10 p-4 text-sm">{error}</p></div>
  if (!data) return <p className="p-10 text-center text-sm text-ink/60">Loading your care summary...</p>
  const { active_ticket: activeTicket, upcoming, history } = data
  return <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-14"><p className="text-xs font-semibold uppercase tracking-[.16em] text-ink/55">My care</p><div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-display text-4xl font-bold">Your care at a glance</h1><p className="mt-2 text-sm text-ink/65">Appointments, queue updates, and recent visits in one place.</p></div><Link to="/book" className="bg-ink px-4 py-3 text-sm font-bold text-panel">Book an appointment</Link></div>
    <div className="mt-8 grid gap-5 md:grid-cols-3"><section className="border border-ink/15 bg-panel p-5 md:col-span-2"><p className="text-xs font-semibold uppercase tracking-[.14em] text-ink/55">Today’s queue</p>{activeTicket ? <><h2 className="mt-3 font-display text-3xl font-bold">Ticket #{activeTicket.ticket_number}</h2><p className="mt-2 text-sm text-ink/65">{activeTicket.doctor_name} · now serving #{activeTicket.now_serving}</p><Link to="/my-ticket" className="mt-5 inline-block text-sm font-semibold underline">View ticket</Link></> : <><h2 className="mt-3 font-display text-2xl font-bold">No active ticket</h2><p className="mt-2 text-sm text-ink/65">You’re not in today’s queue yet.</p><Link to="/book" className="mt-5 inline-block text-sm font-semibold underline">Find an appointment</Link></>}</section><section className="border border-ink/15 bg-ticket/25 p-5"><p className="text-xs font-semibold uppercase tracking-[.14em] text-ink/55">Need help?</p><p className="mt-3 text-sm leading-6 text-ink/70">Your ticket and visit updates appear here as your appointment progresses.</p></section></div>
    <div className="mt-8 grid gap-6 md:grid-cols-2"><section className="border border-ink/15 bg-panel p-5"><h2 className="font-display text-2xl font-bold">Upcoming</h2>{upcoming.length ? <ul className="mt-3">{upcoming.map((item) => <AppointmentRow key={item.id} appointment={item} />)}</ul> : <p className="mt-3 text-sm text-ink/65">No upcoming appointments. <Link to="/book" className="font-semibold underline">Book your next visit.</Link></p>}</section><section className="border border-ink/15 bg-panel p-5"><h2 className="font-display text-2xl font-bold">Recent visits</h2>{history.length ? <ul className="mt-3">{history.map((item) => <AppointmentRow key={item.id} appointment={item} />)}</ul> : <p className="mt-3 text-sm text-ink/65">Your completed and missed visits will appear here.</p>}</section></div></div>
}
