import { useEffect, useState } from 'react'
import { getPendingAdminAccounts, reviewAdminAccount } from '../../api/adminAccounts'

function SuperAdminHome() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [actingOn, setActingOn] = useState(null)
  const [error, setError] = useState('')

  async function loadAccounts() {
    setLoading(true)
    setError('')
    try {
      setAccounts(await getPendingAdminAccounts())
    } catch {
      setError('Could not load pending admin accounts.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadTimer = window.setTimeout(loadAccounts, 0)
    return () => window.clearTimeout(loadTimer)
  }, [])

  async function handleReview(accountId, isApproved) {
    setActingOn(accountId)
    setError('')
    try {
      await reviewAdminAccount(accountId, isApproved)
      setAccounts((current) => current.filter((account) => account.id !== accountId))
    } catch {
      setError('Could not update this account. Please try again.')
    } finally {
      setActingOn(null)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-6 sm:py-14">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/55">Account review</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-ink">Admin requests</h1>
          <p className="mt-3 text-sm text-ink/65">Approve staff accounts before they can use the front-desk tools.</p>
        </div>
        <button onClick={loadAccounts} className="border border-ink/25 bg-panel px-3 py-2 text-sm font-semibold text-ink hover:border-ink">Refresh</button>
      </div>

      {error && <p className="mt-6 border-l-4 border-status-alert bg-status-alert/10 px-4 py-3 text-sm text-ink">{error}</p>}

      <div className="mt-8 overflow-hidden border border-ink/15 bg-panel shadow-sm">
        {loading && <p className="p-5 text-sm text-ink/60">Loading account requests...</p>}
        {!loading && accounts.length === 0 && (
          <p className="p-5 text-sm text-ink/65">There are no admin accounts waiting for review.</p>
        )}
        {!loading && accounts.length > 0 && (
          <ul className="divide-y divide-ink/10">
            {accounts.map((account) => (
              <li key={account.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-semibold">{account.username}</p>
                  {account.phone && <p className="mt-1 text-sm text-ink/65">{account.phone}</p>}
                  {account.date_joined && <p className="mt-1 text-xs text-ink/50">Requested {new Date(account.date_joined).toLocaleDateString()}</p>}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReview(account.id, false)}
                    disabled={actingOn === account.id}
                    className="px-3 py-2 text-sm font-semibold text-status-alert hover:underline disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleReview(account.id, true)}
                    disabled={actingOn === account.id}
                    className="bg-ink px-4 py-2 text-sm font-bold text-panel hover:bg-ink/90 disabled:opacity-50"
                  >
                    {actingOn === account.id ? 'Saving...' : 'Approve'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default SuperAdminHome
