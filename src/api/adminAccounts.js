import apiClient from './client'

// These endpoints are intentionally separate from the queue-management API.
// The server must restrict both endpoints to the super_admin role.
export async function getPendingAdminAccounts() {
  const res = await apiClient.get('/auth/admin-requests/')
  return res.data
}

export async function reviewAdminAccount(accountId, isApproved) {
  const res = await apiClient.patch(`/auth/admin-requests/${accountId}/`, {
    is_approved: isApproved,
  })
  return res.data
}
