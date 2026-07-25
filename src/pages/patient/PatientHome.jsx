import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { bookAppointment, getDoctors, getDoctorSpecialties, getSlots } from '../../api/appointments'
import TicketStub from '../../components/TicketStub'

function asList(payload, key) {
  if (Array.isArray(payload)) return payload
  return payload?.[key] || payload?.results || payload?.items || []
}

function normalizeSpecialty(specialty) {
  return {
    ...specialty,
    specialty: specialty.specialty || specialty.name || specialty.specialty_name || '',
    doctor_count: Number(specialty.doctor_count ?? specialty.count ?? specialty.doctorCount ?? 0),
  }
}

function DoctorAvatar({ doctor }) {
  const initials = (doctor.name || 'Doctor').split(' ').map((part) => part[0]).slice(-2).join('')
  return <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-sm font-bold text-panel">{doctor.photo_url || doctor.photo ? <img src={doctor.photo_url || doctor.photo} alt="" className="h-full w-full object-cover" /> : initials}</div>
}

function PatientHome() {
  const [step, setStep] = useState('specialties')
  const [specialties, setSpecialties] = useState([])
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [booking, setBooking] = useState(false)
  const [confirmedTicket, setConfirmedTicket] = useState(null)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const handledDoctorLink = useRef(false)

  async function loadSpecialties() {
    setLoading(true)
    setError('')
    console.log('PatientHome: loadSpecialties start')
    try {
      let items = asList(await getDoctorSpecialties(), 'specialties')
      console.log('PatientHome: getDoctorSpecialties response', items)

      if (!items.length) {
        const doctors = asList(await getDoctors(), 'doctors')
        console.log('PatientHome: getDoctors fallback response', doctors)
        const specialtiesMap = doctors.reduce((acc, doctor) => {
          const name = doctor.specialty || doctor.specialty_name || doctor.specialty || ''
          if (!name) return acc
          const key = name.toString()
          if (!acc[key]) acc[key] = { specialty: key, doctor_count: 0 }
          acc[key].doctor_count += 1
          return acc
        }, {})
        items = Object.values(specialtiesMap)
      }

      setSpecialties(
        items
          .map(normalizeSpecialty)
          .filter((specialty) => specialty.specialty && specialty.doctor_count > 0)
      )

      // Keep existing links from a doctor's profile working while still loading specialties first.
      const requestedDoctor = Number(searchParams.get('doctor'))
      if (requestedDoctor && !handledDoctorLink.current) {
        handledDoctorLink.current = true
        const doctor = asList(await getDoctors(), 'doctors').find((item) => item.id === requestedDoctor)
        if (doctor) {
          setSelectedSpecialty(doctor.specialty)
          setDoctors([doctor])
          await chooseDoctor(doctor)
        }
      }
    } catch {
      setError('Could not load doctor types. Please try again.')
    } finally { setLoading(false) }
  }

  useEffect(() => {
    const timer = window.setTimeout(loadSpecialties, 0)
    return () => window.clearTimeout(timer)
    // The booking flow should start only once; later refreshes are user-driven.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function chooseSpecialty(specialty) {
    const name = specialty.specialty || specialty.name
    setSelectedSpecialty(name)
    setDoctors([])
    setSelectedDoctor(null)
    setSlots([])
    setStep('doctors')
    setLoading(true)
    setError('')
    try {
      setDoctors(asList(await getDoctors(name), 'doctors'))
    } catch {
      setError('Could not load doctors for this type. Please try again.')
    } finally { setLoading(false) }
  }

  async function chooseDoctor(doctor) {
    setSelectedDoctor(doctor)
    setStep('slots')
    setLoadingSlots(true)
    setSlots([])
    setError('')
    try {
      setSlots(asList(await getSlots(doctor.id), 'slots'))
    } catch {
      setError('Could not load slots. Please try again.')
    } finally { setLoadingSlots(false) }
  }

  async function refreshAvailability(doctor = selectedDoctor) {
    const requests = [loadSpecialties()]
    if (selectedSpecialty) requests.push(getDoctors(selectedSpecialty).then((data) => setDoctors(asList(data, 'doctors'))))
    if (doctor) requests.push(getSlots(doctor.id).then((data) => setSlots(asList(data, 'slots'))))
    await Promise.all(requests)
  }

  async function handleBook(slot) {
    setBooking(true)
    setError('')
    try {
      const appointment = await bookAppointment(slot.id)
      setConfirmedTicket(appointment)
      await refreshAvailability()
    } catch {
      setError('That slot may already be booked. Please pick another.')
    } finally { setBooking(false) }
  }

  async function returnToSpecialties() {
    setStep('specialties')
    setSelectedSpecialty('')
    setSelectedDoctor(null)
    setDoctors([])
    setSlots([])
    await loadSpecialties()
  }

  if (confirmedTicket) return <div className="mx-auto max-w-md px-5 py-12 text-center sm:py-16"><p className="text-sm font-semibold text-status-ok">Booked — you’re all set.</p><h1 className="mt-2 font-display text-3xl font-bold text-ink">Keep this number handy</h1><div className="mt-7"><TicketStub ticketNumber={confirmedTicket.ticket_number} doctorName={confirmedTicket.doctor_name} date={confirmedTicket.date} time={confirmedTicket.scheduled_time} /></div><button onClick={() => { setConfirmedTicket(null); returnToSpecialties() }} className="mt-7 text-sm font-semibold text-ink/70 underline decoration-ink/30 underline-offset-4 hover:text-ink">Book another appointment</button></div>

  const stepNumber = step === 'specialties' ? 1 : step === 'doctors' ? 2 : 3
  return <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14"><p className="text-xs font-semibold uppercase tracking-[.16em] text-ink/55">Appointments · Step {stepNumber} of 3</p><h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink">Schedule appointment</h1><p className="mt-3 max-w-lg text-sm leading-6 text-ink/65">{step === 'specialties' ? 'Start by choosing the type of care you need.' : step === 'doctors' ? `Choose a ${selectedSpecialty} doctor.` : `Choose an available time with ${selectedDoctor?.name}.`}</p>
    {error && <div className="mt-6 border-l-4 border-status-alert bg-status-alert/10 px-4 py-3 text-sm"><p>{error}</p><button onClick={() => step === 'specialties' ? loadSpecialties() : step === 'doctors' ? chooseSpecialty({ specialty: selectedSpecialty }) : chooseDoctor(selectedDoctor)} className="mt-2 font-semibold underline">Try again</button></div>}

    {step === 'specialties' && <section className="mt-9"><h2 className="text-sm font-semibold">Choose a doctor type</h2>{loading ? <p className="mt-5 text-sm text-ink/60">Finding available doctor types...</p> : specialties.length === 0 ? <p className="mt-5 border border-ink/15 bg-panel p-5 text-sm text-ink/65">No doctor types are available right now. Please check again later.</p> : <div className="mt-4 grid gap-3 sm:grid-cols-2">{specialties.map((specialty) => { const name = specialty.specialty || specialty.name; return <button key={name} onClick={() => chooseSpecialty(specialty)} className="border border-ink/15 bg-panel p-5 text-left hover:border-ink/45 hover:bg-ink/5"><p className="font-display text-2xl font-bold">{name}</p><p className="mt-4 text-sm text-ink/65"><strong className="text-ink">{specialty.doctor_count}</strong> doctors</p></button> })}</div>}</section>}

    {step === 'doctors' && <section className="mt-9"><button onClick={returnToSpecialties} className="text-sm font-semibold underline">← Back to doctor types</button><h2 className="mt-6 text-sm font-semibold">Available {selectedSpecialty} doctors</h2>{loading ? <p className="mt-5 text-sm text-ink/60">Finding doctors...</p> : doctors.length === 0 ? <p className="mt-5 border border-ink/15 bg-panel p-5 text-sm text-ink/65">No doctors are available in this type right now. <button onClick={returnToSpecialties} className="font-semibold underline">Choose another type.</button></p> : <div className="mt-4 grid gap-3 sm:grid-cols-2">{doctors.map((doctor) => <article key={doctor.id} className="border border-ink/15 bg-panel p-5"><button onClick={() => chooseDoctor(doctor)} className="flex w-full items-center gap-4 text-left"><DoctorAvatar doctor={doctor} /><span><span className="block font-semibold">{doctor.name}</span><span className="mt-1 block text-sm text-ink/60">{doctor.specialty}</span></span></button><Link to={`/doctors/${doctor.id}`} className="mt-4 inline-block text-xs font-semibold underline text-ink/70">View profile</Link></article>)}</div>}</section>}

    {step === 'slots' && <section className="mt-9"><button onClick={() => { setStep('doctors'); setSelectedDoctor(null); setSlots([]); setError('') }} className="text-sm font-semibold underline">← Back to doctors</button><h2 className="mt-6 text-sm font-semibold">Available slots with {selectedDoctor?.name}</h2>{loadingSlots ? <p className="mt-5 text-sm text-ink/60">Finding available times...</p> : slots.length === 0 ? <p className="mt-5 border-l-4 border-ink/30 bg-panel px-4 py-3 text-sm text-ink/65">No slots are available for this doctor. <button onClick={() => { setStep('doctors'); setSelectedDoctor(null) }} className="font-semibold underline">Choose another doctor.</button></p> : <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{slots.map((slot) => <button key={slot.id} disabled={booking} onClick={() => handleBook(slot)} className="min-h-20 border border-ink/15 bg-panel p-3 text-left hover:border-ink hover:bg-ink/5 disabled:opacity-50"><p className="font-medium">{slot.start_time?.slice(0, 5) || slot.scheduled_time?.slice(0, 5)}</p><p className="mt-1 text-xs text-ink/55">{slot.date}</p></button>)}</div>}</section>}
  </div>
}

export default PatientHome
