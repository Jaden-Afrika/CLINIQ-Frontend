import apiClient from './client'

export async function getDoctors() {
  const res = await apiClient.get('/doctors/')
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
