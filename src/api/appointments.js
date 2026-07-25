import apiClient from './client'

export async function getDoctors(specialty) {
  const res = await apiClient.get('/doctors/', {
    params: specialty ? { specialty } : undefined,
  })
  return res.data
}

export async function getDoctorSpecialties() {
  const res = await apiClient.get('/doctors/specialties/')
  return res.data
}

export async function getSlots(doctorId) {
  const res = await apiClient.get(`/slots/?doctor=${doctorId}`)
  return res.data
}

export async function bookAppointment(slotId) {
  const res = await apiClient.post('/appointments/book/', { slot_id: slotId })
  return res.data
}

export async function getMyTicket() {
  const res = await apiClient.get('/appointments/my-ticket/')
  return res.data
}

export async function getAdminQueue(doctorId) {
  const res = await apiClient.get(`/admin/queue/?doctor=${doctorId}`)
  return res.data
}

export async function advanceQueue(doctorId) {
  const res = await apiClient.post(`/admin/doctors/${doctorId}/next/`)
  return res.data
}

export async function updateAppointmentStatus(appointmentId, status) {
  const res = await apiClient.patch(`/admin/appointments/${appointmentId}/status/`, { status })
  return res.data
}

export async function getAdminAppointments(filters = {}) {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  )
  const res = await apiClient.get('/admin/appointments/', { params })
  return res.data
}

export async function registerWalkIn({ username, phone, doctorId, date }) {
  const payload = { username }
  if (phone) payload.phone = phone
  payload.doctor_id = doctorId
  if (date) payload.date = date
  const res = await apiClient.post('/admin/walk-ins/', payload)
  return res.data
}

export async function submitRating(appointmentId, rating, comment) {
  const res = await apiClient.post(`/appointments/${appointmentId}/rating/`, { rating, comment })
  return res.data
}
