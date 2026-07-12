# TransitOps — Frontend

Smart Transport Operations Platform. React (Vite) + Tailwind CSS frontend for the TransitOps hackathon brief.

This build is fully demoable **without a backend**: `DataContext` holds the fleet data in memory and persists it to `localStorage`, and every business rule from the spec (unique registration numbers, dispatch eligibility, cargo-weight limits, automatic status transitions) is enforced client-side. When the Express + MongoDB API is ready, wire `src/services/api.js` into `DataContext` and swap local state updates for API calls.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Demo logins

Password for all demo accounts: `demo1234`

| Role | Email |
|---|---|
| Fleet Manager | fleet@transitops.io |
| Driver | driver@transitops.io |
| Safety Officer | safety@transitops.io |
| Financial Analyst | finance@transitops.io |

The login screen has one-click buttons that fill these in for you.

## What's implemented

- **Auth + RBAC** — login gate, role-based write permissions per module (see `PERMISSIONS` in `AuthContext.jsx`)
- **Dashboard** — live KPIs (active/available/in-maintenance vehicles, active/pending trips, drivers on duty, fleet utilization %), filters by type/region/status, status + lifecycle charts, recent activity feed
- **Vehicle Registry** — CRUD, unique registration number enforcement, status badges
- **Driver Management** — CRUD, license expiry flagging
- **Trip Management** — create as Draft, Dispatch / Complete / Cancel with full business-rule validation, road-line lifecycle stepper
- **Maintenance** — creating a record auto-sets the vehicle to "In Shop"; closing it restores "Available" (unless Retired)
- **Fuel & Expenses** — logging + automatic per-vehicle operational cost (fuel + maintenance)
- **Reports** — fuel efficiency, fleet utilization, operational cost, vehicle ROI, CSV export
- Responsive layout down to mobile, visible keyboard focus rings, `prefers-reduced-motion` respected

## Design system

- **Colors**: Asphalt `#1B1D22`, Concrete `#EDEFEC`, Lane Yellow `#F5B400`, Signal Green `#1E8E5A`, Steel Blue `#3E5C88`, Beacon Red `#D6493B`
- **Type**: Oswald (display/headings), Inter (body), IBM Plex Mono (registration numbers, license numbers, odometer/data readouts)
- **Signature element**: the road-line trip stepper on the Trips page, and traffic-light status dots used everywhere a status shows

## Connecting the real backend

1. Stand up the Express + MongoDB API described in the brief (`/api/vehicles`, `/api/drivers`, `/api/trips`, `/api/maintenance`, `/api/fuel`, `/api/expenses`, `/api/auth/*`).
2. Set `VITE_API_BASE_URL` in a `.env` file.
3. Replace the local-state mutations in `src/context/DataContext.jsx` with calls to `src/services/api.js`, keeping the same function signatures so pages don't need to change.
