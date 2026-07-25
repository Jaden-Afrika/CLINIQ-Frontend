import { useCallback, useEffect, useState } from 'react'
import { advanceQueue, getAdminAppointments, getAdminQueue, getDoctorSpecialties, getDoctors, registerWalkIn, updateAppointmentStatus } from '../../api/appointments'

const statusStyles = {
  booked: 'bg-status-ok/15 text-status-ok',
  completed: 'bg-ink/10 text-ink',
  no_show: 'bg-status-alert/15 text-status-alert',
}

const today = () => {
  const date = new Date()
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return offsetDate.toISOString().slice(0, 10)
}

function normalizeAppointments(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.appointments || payload?.results || payload?.items || []
}

function normalizeList(payload, key) {
  if (Array.isArray(payload)) return payload
  return payload?.[key] || payload?.results || payload?.items || []
}

function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

function AppointmentDetails({ appointment }) {
  return <>
    <p className="font-ticket text-xl font-bold text-ticket">#{appointment.ticket_number}</p>
    <p className="mt-1 font-semibold">{appointment.patient_username}</p>
    <p className="text-sm text-ink/65">{appointment.doctor_name}</p>
    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
      <div><dt className="text-xs font-semibold uppercase tracking-[.1em] text-ink/50">Date / time</dt><dd className="mt-1">{appointment.date} · {appointment.scheduled_time?.slice(0, 5) || 'Walk-in'}</dd></div>
      <div><dt className="text-xs font-semibold uppercase tracking-[.1em] text-ink/50">Source / status</dt><dd className="mt-1 capitalize">{appointment.source?.replace('_', ' ')} · {appointment.status?.replace('_', ' ')}</dd></div>
      <div><dt className="text-xs font-semibold uppercase tracking-[.1em] text-ink/50">Checked in</dt><dd className="mt-1">{formatDateTime(appointment.created_at)}</dd></div>
      <div><dt className="text-xs font-semibold uppercase tracking-[.1em] text-ink/50">Completed</dt><dd className="mt-1">{formatDateTime(appointment.completed_at)}</dd></div>
      <div className="col-span-2"><dt className="text-xs font-semibold uppercase tracking-[.1em] text-ink/50">Diagnosis</dt><dd className="mt-1 whitespace-pre-wrap">{appointment.diagnosis || '—'}</dd></div>
      <div className="col-span-2"><dt className="text-xs font-semibold uppercase tracking-[.1em] text-ink/50">Treatment</dt><dd className="mt-1 whitespace-pre-wrap">{appointment.treatment || '—'}</dd></div>
    </dl>
  </>
}

function AdminHome() {
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [queue, setQueue] = useState([])
  const [queueLoading, setQueueLoading] = useState(false)
  const [records, setRecords] = useState([])
  const [recordsLoading, setRecordsLoading] = useState(true)
  const [filters, setFilters] = useState({ doctor: '', date: '', status: '', source: '' })
  const [specialties, setSpecialties] = useState([])
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [walkInDoctors, setWalkInDoctors] = useState([])
  const [loadingWalkInDoctors, setLoadingWalkInDoctors] = useState(false)
  const [walkIn, setWalkIn] = useState({ username: '', phone: '', doctorId: '', date: today() })
  const [showWalkIn, setShowWalkIn] = useState(false)
  const [walkInSaving, setWalkInSaving] = useState(false)
  const [actingOn, setActingOn] = useState(null)
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState('')

  const loadRecords = useCallback(async () => {
    setRecordsLoading(true)
    try {
      const data = await getAdminAppointments(filters)
      setRecords(normalizeAppointments(data))
    } catch {
      setError('Could not load appointment records.')
    } finally {
      setRecordsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    getDoctors().then(setDoctors).catch(() => setError('Could not load doctors.'))
    getDoctorSpecialties().then((data) => setSpecialties(normalizeList(data, 'specialties'))).catch(() => setError('Could not load doctor specialties.'))
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(loadRecords, 0)
    return () => window.clearTimeout(timer)
  }, [loadRecords])

  async function loadQueue(doctor = selectedDoctor) {
    if (!doctor) return
    setSelectedDoctor(doctor)
    setQueueLoading(true)
    try {
      setQueue(await getAdminQueue(doctor.id))
    } catch {
      setError('Could not load queue.')
    } finally {
      setQueueLoading(false)
    }
  }

  async function refreshAppointmentData() {
    await Promise.all([loadRecords(), selectedDoctor ? loadQueue(selectedDoctor) : Promise.resolve()])
  }

  async function handleNext() {
    if (!selectedDoctor) return
    setActingOn('next')
    setError('')
    try {
      await advanceQueue(selectedDoctor.id)
      await refreshAppointmentData()
    } catch {
      setError('No booked appointment is available at the current ticket number.')
    } finally { setActingOn(null) }
  }

  async function handleStatusChange(appointmentId, status) {
    setActingOn(appointmentId)
    setError('')
    try {
      await updateAppointmentStatus(appointmentId, status)
      await refreshAppointmentData()
    } catch {
      setError('Could not update status.')
    } finally { setActingOn(null) }
  }

  async function loadWalkInDoctors(specialty) {
    setLoadingWalkInDoctors(true)
    setWalkInDoctors([])
    try {
      const doctorsBySpecialty = await getDoctors(specialty)
      setWalkInDoctors(doctorsBySpecialty || [])
    } catch {
      setError('Could not load doctors for this specialty.')
    } finally {
      setLoadingWalkInDoctors(false)
    }
  }

  async function handleWalkInSubmit(event) {
    event.preventDefault()
    setWalkInSaving(true)
    setError('')
    setConfirmation('')
    try {
      const username = walkIn.username?.trim()
      if (!username) {
        setError('Enter an existing patient username or create a new patient username.')
        return
      }
      if (!walkIn.doctorId) {
        setError('Choose a doctor for the walk-in appointment.')
        return
      }
      const result = await registerWalkIn({
        username,
        phone: walkIn.phone.trim() || undefined,
        doctorId: Number(walkIn.doctorId),
        date: walkIn.date === today() ? undefined : walkIn.date,
      })
      setConfirmation(`Walk-in registered. Assigned ticket #${result.ticket_number}.`)
      setWalkIn({ username: '', phone: '', doctorId: '', date: today() })
      setSelectedSpecialty('')
      setWalkInDoctors([])
      setShowWalkIn(false)
      await refreshAppointmentData()
    } catch {
      setError('Could not register this walk-in. Check the patient username and doctor, then try again.')
    } finally { setWalkInSaving(false) }
  }

  return <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-ink/55">Front desk</p><h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Appointments</h1><p className="mt-3 text-sm text-ink/65">Manage today’s queue and review appointment records.</p></div>
      <button onClick={() => setShowWalkIn((visible) => !visible)} className="bg-ticket px-5 py-3 text-sm font-bold text-ink">{showWalkIn ? 'Close walk-in form' : 'Register walk-in'}</button>
    </div>

    {confirmation && <p className="mt-6 border-l-4 border-status-ok bg-status-ok/10 px-4 py-3 text-sm font-semibold">{confirmation}</p>}
    {error && <p className="mt-6 border-l-4 border-status-alert bg-status-alert/10 px-4 py-3 text-sm">{error}</p>}

    {showWalkIn && <form onSubmit={handleWalkInSubmit} className="mt-7 border border-ink/15 bg-panel p-5 shadow-sm"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-ink/55">Check-in</p><h2 className="mt-1 font-display text-2xl font-bold">Register a walk-in</h2></div><p className="max-w-md text-sm text-ink/60">Select specialty first to filter doctors, then enter the patient username.</p></div><div className="mt-5 grid gap-4 md:grid-cols-3"><label className="text-sm font-semibold">Specialty<select required value={selectedSpecialty} onChange={async (e) => { const specialty = e.target.value; setSelectedSpecialty(specialty); setWalkIn({ ...walkIn, doctorId: '' }); if (specialty) await loadWalkInDoctors(specialty) }} className="mt-2 w-full border border-ink/25 bg-panel p-3 font-normal"><option value="">Select a specialty</option>{specialties.map((specialty) => {
      const value = specialty?.specialty || specialty
      return <option key={value} value={value}>{value}</option>
    })}</select><p className="mt-2 text-xs text-ink/55">Choose a specialty to load matching doctors.</p></label><label className="text-sm font-semibold">Doctor<select required disabled={!selectedSpecialty || loadingWalkInDoctors} value={walkIn.doctorId} onChange={(e) => setWalkIn({ ...walkIn, doctorId: e.target.value })} className="mt-2 w-full border border-ink/25 bg-panel p-3 font-normal"><option value="">{selectedSpecialty ? (loadingWalkInDoctors ? 'Loading doctors…' : 'Select a doctor') : 'Choose specialty first'}</option>{walkInDoctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}</select><p className="mt-2 text-xs text-ink/55">Only doctors in the selected specialty are shown.</p></label><label className="text-sm font-semibold">Patient username<input required type="text" value={walkIn.username} onChange={(e) => setWalkIn({ ...walkIn, username: e.target.value })} className="mt-2 w-full border border-ink/25 bg-panel p-3 font-normal" placeholder="username" /><p className="mt-2 text-xs text-ink/55">Existing patient username or new username to create a patient account.</p></label></div><div className="mt-4 grid gap-4 md:grid-cols-3"><label className="text-sm font-semibold">Phone <span className="font-normal text-ink/55">(optional)</span><input type="tel" value={walkIn.phone} onChange={(e) => setWalkIn({ ...walkIn, phone: e.target.value })} className="mt-2 w-full border border-ink/25 bg-panel p-3 font-normal" placeholder="Phone number" /></label><label className="text-sm font-semibold">Appointment date <span className="font-normal text-ink/55">(optional)</span><input type="date" value={walkIn.date} onChange={(e) => setWalkIn({ ...walkIn, date: e.target.value })} className="mt-2 w-full border border-ink/25 bg-panel p-3 font-normal" /></label></div><button disabled={walkInSaving} className="mt-5 bg-ink px-5 py-3 text-sm font-bold text-panel disabled:opacity-50">{walkInSaving ? 'Registering...' : 'Register walk-in'}</button></form>}

    <section className="mt-9"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-ink/55">Queue board</p><h2 className="mt-1 font-display text-2xl font-bold">Today’s queue</h2></div><div className="flex gap-2"><button onClick={handleNext} disabled={!selectedDoctor || actingOn === 'next'} className="bg-ticket px-4 py-2 text-sm font-bold disabled:opacity-50">{actingOn === 'next' ? 'Advancing...' : 'Next'}</button><button onClick={() => loadQueue()} disabled={!selectedDoctor} className="border border-ink/25 bg-panel px-3 py-2 text-sm font-semibold disabled:opacity-50">Refresh</button></div></div><div className="mt-4 flex flex-wrap gap-2">{doctors.map((doctor) => <button key={doctor.id} onClick={() => loadQueue(doctor)} className={`border px-4 py-3 text-sm font-semibold ${selectedDoctor?.id === doctor.id ? 'border-ink bg-ink text-panel' : 'border-ink/20 bg-panel hover:border-ink'}`}>{doctor.name}</button>)}</div>{selectedDoctor && <div className="mt-5 overflow-x-auto border border-ink/15 bg-panel">{queueLoading ? <p className="p-5 text-sm text-ink/60">Loading the queue...</p> : queue.length === 0 ? <p className="p-5 text-sm text-ink/65">No appointments are booked for this doctor today.</p> : <table className="w-full min-w-160 text-sm"><thead className="bg-ink text-left text-panel/75"><tr><th className="p-4">Ticket</th><th className="p-4">Patient</th><th className="p-4">Source</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr></thead><tbody>{queue.map((appt) => <tr key={appt.id} className="border-t border-ink/10"><td className="p-4 font-ticket font-bold text-ticket">#{appt.ticket_number}</td><td className="p-4 font-semibold">{appt.patient_username}</td><td className="p-4 capitalize">{appt.source?.replace('_', ' ')}</td><td className="p-4"><span className={`inline-flex px-2.5 py-1 text-xs font-bold capitalize ${statusStyles[appt.status] || ''}`}>{appt.status?.replace('_', ' ')}</span></td><td className="p-4 text-right">{appt.status === 'booked' && <div className="flex justify-end gap-3"><button onClick={() => handleStatusChange(appt.id, 'completed')} disabled={actingOn === appt.id} className="text-xs font-semibold text-status-ok hover:underline disabled:opacity-50">Mark done</button><button onClick={() => handleStatusChange(appt.id, 'no_show')} disabled={actingOn === appt.id} className="text-xs font-semibold text-status-alert hover:underline disabled:opacity-50">No show</button></div>}</td></tr>)}</tbody></table>}</div>}</section>

    <section className="mt-12"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-ink/55">Appointment records</p><h2 className="mt-1 font-display text-3xl font-bold">Visit history</h2></div><button onClick={loadRecords} className="border border-ink/25 bg-panel px-3 py-2 text-sm font-semibold">Refresh records</button></div><div className="mt-5 grid gap-3 border border-ink/15 bg-panel p-4 sm:grid-cols-2 lg:grid-cols-4"><label className="text-sm font-semibold">Doctor<select value={filters.doctor} onChange={(e) => setFilters({ ...filters, doctor: e.target.value })} className="mt-2 w-full border border-ink/25 bg-panel p-2.5 font-normal"><option value="">All doctors</option>{doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}</select></label><label className="text-sm font-semibold">Date<input type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} className="mt-2 w-full border border-ink/25 bg-panel p-2.5 font-normal" /></label><label className="text-sm font-semibold">Status<select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="mt-2 w-full border border-ink/25 bg-panel p-2.5 font-normal"><option value="">All statuses</option><option value="booked">Booked</option><option value="completed">Completed</option><option value="no_show">No show</option></select></label><label className="text-sm font-semibold">Source<select value={filters.source} onChange={(e) => setFilters({ ...filters, source: e.target.value })} className="mt-2 w-full border border-ink/25 bg-panel p-2.5 font-normal"><option value="">All sources</option><option value="online">Online</option><option value="walk_in">Walk-in</option></select></label></div>{recordsLoading ? <p className="mt-5 text-sm text-ink/60">Loading appointment records...</p> : records.length === 0 ? <p className="mt-5 border border-ink/15 bg-panel p-5 text-sm text-ink/65">No appointment records match these filters.</p> : <><div className="mt-5 grid gap-4 md:hidden">{records.map((appointment) => <article key={appointment.id} className="border border-ink/15 bg-panel p-5"><AppointmentDetails appointment={appointment} /></article>)}</div><div className="mt-5 hidden overflow-x-auto border border-ink/15 bg-panel md:block"><table className="w-full min-w-300 text-sm"><thead className="bg-ink text-left text-panel/75"><tr>{['Ticket', 'Patient', 'Doctor', 'Date', 'Scheduled', 'Source', 'Status', 'Check-in / booking', 'Completed', 'Diagnosis', 'Treatment'].map((head) => <th key={head} className="p-4 text-xs font-semibold uppercase tracking-[.1em]">{head}</th>)}</tr></thead><tbody>{records.map((appointment) => <tr key={appointment.id} className="border-t border-ink/10 align-top"><td className="p-4 font-ticket font-bold text-ticket">#{appointment.ticket_number}</td><td className="p-4 font-semibold">{appointment.patient_username}</td><td className="p-4">{appointment.doctor_name}</td><td className="p-4">{appointment.date}</td><td className="p-4">{appointment.scheduled_time?.slice(0, 5) || '—'}</td><td className="p-4 capitalize">{appointment.source?.replace('_', ' ')}</td><td className="p-4"><span className={`inline-flex px-2 py-1 text-xs font-bold capitalize ${statusStyles[appointment.status] || ''}`}>{appointment.status?.replace('_', ' ')}</span></td><td className="p-4 whitespace-nowrap">{formatDateTime(appointment.created_at)}</td><td className="p-4 whitespace-nowrap">{formatDateTime(appointment.completed_at)}</td><td className="max-w-52 whitespace-pre-wrap p-4">{appointment.diagnosis || '—'}</td><td className="max-w-60 whitespace-pre-wrap p-4">{appointment.treatment || '—'}</td></tr>)}</tbody></table></div></>}</section>
  </div>
}

export default AdminHome
