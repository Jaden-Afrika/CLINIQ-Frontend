# Admin account approval API contract

The client treats a `staff` account as unverified unless `/auth/me/` returns `is_approved: true`. This must be enforced by the server, not only by the UI.

## Roles and approval state

- `patient` — can use patient routes.
- `staff` — created through registration with `is_approved: false` by default.
- `super_admin` — provision this role server-side; it must never be selectable during public registration. Super admins can use every staff/admin operation as well as account-review operations.

`GET /auth/me/` must return at least:

```json
{ "id": 12, "username": "reception1", "role": "staff", "is_approved": false }
```

The login endpoint may issue tokens to a pending staff user so they can see the pending screen, but every staff-only API endpoint must return `403 Forbidden` until `is_approved` is true.

## Super-admin endpoints

Both endpoints require an authenticated `super_admin` and must return `403` for all other roles.

- `GET /auth/admin-requests/` returns pending staff accounts, e.g. `[{ "id": 12, "username": "reception1", "phone": "+254...", "date_joined": "..." }]`.
- `PATCH /auth/admin-requests/:id/` accepts `{ "is_approved": true }` to approve or `{ "is_approved": false }` to reject. Rejection should either mark the request rejected or deactivate/delete the account according to the backend policy.

Also enforce the approval check on the server for the queue and appointment admin endpoints: allow an approved `staff` user **or** a `super_admin`. Route guards in a browser are not a security boundary.
