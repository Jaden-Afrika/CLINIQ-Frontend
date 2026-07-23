import apiClient from './client'

export async function getDoctorDashboard() { const res = await apiClient.get('/doctor/dashboard/'); return res.data }
export async function getDoctorAppointments() { const res = await apiClient.get('/doctor/appointments/'); return res.data }
export async function getDoctorFreeSlots() { const res = await apiClient.get('/doctor/free-slots/'); return res.data }
export async function saveDiagnosis(appointmentId, diagnosis) { const res = await apiClient.patch(`/doctor/appointments/${appointmentId}/diagnosis/`, { diagnosis }); return res.data }
