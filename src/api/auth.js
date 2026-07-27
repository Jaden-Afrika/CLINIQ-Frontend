import apiClient from './client'

function buildSuggestedUsername(fullName, email) {
  const base = (fullName?.trim() || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

  const localPart = (email?.trim() || '').split('@')[0]?.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || ''

  if (base && localPart) return `${base}_${localPart}`
  if (base) return base
  return localPart
}

function buildLoginPayload(identifier, password) {
  const trimmed = identifier?.trim()
  return { username: trimmed, password }
}

export async function login(identifier, password) {
  const payload = buildLoginPayload(identifier, password)
  const res = await apiClient.post('/auth/login/', payload)
  localStorage.setItem('access_token', res.data.access)
  localStorage.setItem('refresh_token', res.data.refresh)
  return res.data
}

export async function register(fullName, email, password, role, phone = '', doctorName = '', specialty = '') {
  const payload = {
    full_name: fullName,
    email,
    password,
    role,
    phone,
    username: buildSuggestedUsername(fullName, email),
  }
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
