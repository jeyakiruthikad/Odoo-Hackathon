# TransitOps Backend API

Node.js + Express + MongoDB backend for the TransitOps Smart Transport Operations Platform.

## Setup

```bash
cd transitops-backend
npm install
cp .env.example .env      # then edit JWT_SECRET etc.
# make sure a local MongoDB Community Server is running on MONGO_URI
npm run seed               # optional: creates demo users/vehicles/drivers
npm run dev                 # starts on http://localhost:5000 (nodemon)
```

Demo login after seeding (password for all: `password123`):
- fleet@transitops.dev — fleet_manager
- driver@transitops.dev — driver
- safety@transitops.dev — safety_officer
- finance@transitops.dev — financial_analyst

## Auth

All routes except `/api/auth/register` and `/api/auth/login` require:
```
Authorization: Bearer <token>
```
`token` comes back from register/login. Roles: `fleet_manager`, `driver`, `safety_officer`, `financial_analyst`.

## Endpoints

| Method | Path | Roles | Notes |
|---|---|---|---|
| POST | /api/auth/register | Public | |
| POST | /api/auth/login | Public | |
| GET | /api/auth/me | any | |
| GET | /api/vehicles | any | `?status=&type=&region=&dispatchable=true` |
| POST/PUT/DELETE | /api/vehicles(/:id) | fleet_manager | |
| GET | /api/drivers | any | `?status=&assignable=true` |
| POST/PUT | /api/drivers(/:id) | fleet_manager, safety_officer | |
| DELETE | /api/drivers/:id | fleet_manager | |
| GET | /api/trips | any | `?status=&vehicle=&driver=` |
| POST/PUT | /api/trips(/:id) | fleet_manager, driver | create/edit while Draft |
| POST | /api/trips/:id/dispatch | fleet_manager, driver | Draft → Dispatched |
| POST | /api/trips/:id/complete | fleet_manager, driver | Dispatched → Completed |
| POST | /api/trips/:id/cancel | fleet_manager, driver | Draft/Dispatched → Cancelled |
| GET/POST | /api/maintenance | fleet_manager (write) | creating sets vehicle to In Shop |
| PUT | /api/maintenance/:id/close | fleet_manager | restores vehicle unless Retired |
| GET/POST | /api/fuel | fleet_manager, driver, financial_analyst (write) | |
| GET/POST | /api/expenses | fleet_manager, financial_analyst (write) | |
| GET | /api/dashboard | any | KPIs + recent activity, `?type=&region=` |
| GET | /api/reports/fleet | fleet_manager, financial_analyst, safety_officer | fuel efficiency, utilization, cost, ROI per vehicle |
| GET | /api/reports/fleet/export | fleet_manager, financial_analyst | same report as CSV download |

## Business rules enforced (see controllers for exact locations)

- Vehicle registration number & driver license number are unique.
- Retired/In Shop vehicles are excluded from `dispatchable=true` and blocked at `/dispatch`.
- Expired-license or Suspended drivers are excluded from `assignable=true` and blocked at `/dispatch`.
- A vehicle/driver already `On Trip` cannot be dispatched again.
- Cargo weight can't exceed vehicle max load capacity (checked at create, edit, and dispatch).
- Dispatch → vehicle & driver become `On Trip`. Complete/cancel-a-dispatched-trip → both back to `Available`.
- Creating a maintenance log → vehicle becomes `In Shop`; closing it → back to `Available` unless `Retired`.

## Notes / assumptions

- **No Mongo transactions**: a local standalone `mongod` doesn't support multi-document
  transactions (that needs a replica set), so trip dispatch/complete/cancel use a
  validate-then-write pattern instead of `session.withTransaction`. If you move to Atlas
  or a replica set, this is a good spot to reintroduce sessions for stronger atomicity.
- **Vehicle ROI** `(Revenue - (Maintenance + Fuel)) / Acquisition Cost` needs a revenue
  figure that the original spec never defines a source for. Added an optional `revenue`
  field, settable when completing a trip (`POST /api/trips/:id/complete`), so the report
  has something to compute against. Defaults to 0 if never supplied.
- Fuel Efficiency and ROI in `/api/reports/fleet` are computed cumulatively per vehicle
  across all completed trips/logs, not per single trip.
