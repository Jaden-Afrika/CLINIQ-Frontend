import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getDoctorProfile } from '../../api/dashboard'

export default function DoctorProfile() {
  const { doctorId } = useParams(); const [doctor, setDoctor] = useState(null); const [error, setError] = useState('')
  useEffect(() => { getDoctorProfile(doctorId).then(setDoctor).catch(() => setError('Could not load this doctor profile.')) }, [doctorId])
  if (error) return <p className="p-10 text-center text-sm">{error}</p>
  if (!doctor) return <p className="p-10 text-center text-sm text-ink/60">Loading doctor profile...</p>
  const initials = doctor.name.split(' ').map((part) => part[0]).slice(-2).join('')
  return <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14"><Link to="/book" className="text-sm font-semibold underline">← Back to doctors</Link><section className="mt-6 border border-ink/15 bg-panel p-6 sm:p-8"><div className="flex items-start gap-5"><div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-xl font-bold text-panel">{doctor.photo_url ? <img src={doctor.photo_url} alt="" className="h-full w-full object-cover" /> : initials}</div><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-ink/55">Doctor profile</p><h1 className="mt-1 font-display text-4xl font-bold">{doctor.name}</h1><p className="mt-2 text-ink/65">{doctor.specialty || 'General practice'}</p></div></div><p className="mt-7 leading-7 text-ink/75">{doctor.bio || 'This clinician is available to help you plan your next visit and receive the care you need.'}</p><div className="mt-7 border-y border-ink/10 py-4 text-sm"><span className="font-semibold">{doctor.available_slots}</span> appointment {doctor.available_slots === 1 ? 'slot' : 'slots'} currently available</div><Link to={`/book?doctor=${doctor.id}`} className="mt-7 inline-block bg-ink px-5 py-3 text-sm font-bold text-panel">Choose a time</Link></section></div>
}
