import apiClient from './client'

export async function login(username, password) {
  const res = await apiClient.post('/auth/login/', { username, password })
  localStorage.setItem('access_token', res.data.access)
  localStorage.setItem('refresh_token', res.data.refresh)
  return res.data
}

export async function register(username, password, role, phone = '', doctorName = '', specialty = '') {
  const payload = { username, password, role, phone }
  if (role === 'doctor') Object.assign(payload, { doctor_name: doctorName, specialty })
  const res = await apiClient.post('/auth/register/', payload)
  return res.data
}

export async function getMe() {
  const res = await apiClient.get('/auth/me/')
  return res.data
}

export function logout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

// A staff account must be approved by a super admin before it can use admin tools.
export function isApprovedStaff(user) {
  return user?.role === 'staff' && user.is_approved === true
}

export function isApprovedDoctor(user) {
  return user?.role === 'doctor' && user.is_approved === true
}

export function canUseAdminTools(user) {
  return user?.role === 'super_admin' || isApprovedStaff(user)
}
