import { useState } from 'react'
import { Plus, Check, X, Flag } from 'lucide-react'
import Topbar from '../components/layout/Topbar'
import Modal from '../components/ui/Modal'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { validateTripDraft } from '../utils/businessRules'

const STAGES = ['Draft', 'Dispatched', 'Completed']

function RouteStepper({ status }) {
  const cancelled = status === 'Cancelled'
  const activeIndex = cancelled ? 0 : STAGES.indexOf(status)
  return (
    <div className="flex items-center">
      {STAGES.map((stage, i) => (
        <div key={stage} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                cancelled
                  ? 'bg-beacon-100 text-beacon'
                  : i <= activeIndex ? 'bg-signal text-white' : 'bg-concrete-300 text-asphalt-500'
              }`}
            >
              {cancelled && i === 0 ? <X size={12} /> : i <= activeIndex ? <Check size={12} /> : ''}
            </div>
            <span className="mt-1 text-[10px] text-asphalt-500">{stage}</span>
          </div>
          {i < STAGES.length - 1 && (
            <div
              className="mx-1 mb-4 h-0 w-8 border-t-2 border-dashed"
              style={{ borderColor: !cancelled && i < activeIndex ? '#1E8E5A' : '#C9CCC5' }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

const EMPTY = { source: '', destination: '', vehicleId: '', driverId: '', cargoWeightKg: '', distanceKm: '' }

export default function Trips() {
  const { trips, vehicles, drivers, createTripDraft, dispatchTrip, completeTrip, cancelTrip } = useData()
  const { can } = useAuth()
  const canWrite = can('trips:write')

  const [createOpen, setCreateOpen] = useState(false)
  const [completeTarget, setCompleteTarget] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState([])
  const [completeForm, setCompleteForm] = useState({ finalOdometer: '', fuelConsumedL: '' })
  const [actionError, setActionError] = useState({})

  const vehicleById = (id) => vehicles.find((v) => v.id === id)
  const driverById = (id) => drivers.find((d) => d.id === id)

  const availableVehicles = vehicles.filter((v) => v.status === 'Available')
  const availableDrivers = drivers.filter((d) => d.status === 'Available')

  const handleCreate = (e) => {
    e.preventDefault()
    const vehicle = vehicleById(form.vehicleId)
    const driver = driverById(form.driverId)
    const cargoWeightKg = Number(form.cargoWeightKg)
    const errs = validateTripDraft({ vehicle, driver, cargoWeightKg })
    if (errs.length) { setErrors(errs); return }
    createTripDraft({ ...form, cargoWeightKg, distanceKm: Number(form.distanceKm) })
    setCreateOpen(false)
    setForm(EMPTY)
    setErrors([])
  }

  const handleDispatch = (id) => {
    const result = dispatchTrip(id)
    setActionError((e) => ({ ...e, [id]: result.ok ? null : result.error }))
  }

  const handleCancel = (id) => {
    cancelTrip(id)
    setActionError((e) => ({ ...e, [id]: null }))
  }

  const openComplete = (trip) => { setCompleteTarget(trip); setCompleteForm({ finalOdometer: trip.vehicleId ? vehicleById(trip.vehicleId)?.odometer ?? '' : '', fuelConsumedL: '' }) }

  const handleComplete = (e) => {
    e.preventDefault()
    completeTrip(completeTarget.id, completeForm)
    setCompleteTarget(null)
  }

  return (
    <>
      <Topbar title="Trip Management" />
      <main className="flex-1 overflow-y-auto p-6">
        {canWrite && (
          <div className="mb-4 flex justify-end">
            <button onClick={() => setCreateOpen(true)} className="focus-ring flex items-center gap-1.5 rounded-md bg-asphalt px-3.5 py-2 text-sm font-medium text-concrete hover:bg-asphalt-700">
              <Plus size={16} /> Create trip
            </button>
          </div>
        )}

        <div className="space-y-3">
          {trips.map((t) => {
            const vehicle = vehicleById(t.vehicleId)
            const driver = driverById(t.driverId)
            return (
              <div key={t.id} className="rounded-lg border border-concrete-300 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-base font-medium text-asphalt">{t.source} <span className="text-asphalt-500">→</span> {t.destination}</p>
                    <p className="mt-0.5 font-mono text-xs text-asphalt-500">
                      {vehicle?.regNumber ?? '—'} · {driver?.name ?? '—'} · {t.cargoWeightKg} kg · {t.distanceKm} km
                    </p>
                  </div>
                  <RouteStepper status={t.status} />
                </div>

                {actionError[t.id] && (
                  <p className="mt-2 rounded-md bg-beacon-100 px-3 py-2 text-xs text-beacon">{actionError[t.id]}</p>
                )}

                {canWrite && (
                  <div className="mt-3 flex gap-2">
                    {t.status === 'Draft' && (
                      <>
                        <ActionButton onClick={() => handleDispatch(t.id)} icon={Flag} label="Dispatch" tone="signal" />
                        <ActionButton onClick={() => handleCancel(t.id)} icon={X} label="Cancel" tone="beacon" />
                      </>
                    )}
                    {t.status === 'Dispatched' && (
                      <>
                        <ActionButton onClick={() => openComplete(t)} icon={Check} label="Complete" tone="signal" />
                        <ActionButton onClick={() => handleCancel(t.id)} icon={X} label="Cancel" tone="beacon" />
                      </>
                    )}
                  </div>
                )}

                {t.status === 'Completed' && (
                  <p className="mt-2 font-mono text-xs text-asphalt-500">
                    Final odometer {t.finalOdometer?.toLocaleString() ?? '—'} km · Fuel used {t.fuelConsumedL ?? '—'} L
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </main>

      {createOpen && (
        <Modal title="Create trip" onClose={() => setCreateOpen(false)}>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Source" required value={form.source} onChange={(v) => setForm({ ...form, source: v })} />
              <Field label="Destination" required value={form.destination} onChange={(v) => setForm({ ...form, destination: v })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-asphalt">Vehicle</label>
              <select required value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} className="focus-ring w-full rounded-md border border-concrete-300 px-3 py-2 text-sm outline-none">
                <option value="">Select an available vehicle</option>
                {availableVehicles.map((v) => <option key={v.id} value={v.id}>{v.name} — {v.regNumber} (max {v.maxLoadKg} kg)</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-asphalt">Driver</label>
              <select required value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })} className="focus-ring w-full rounded-md border border-concrete-300 px-3 py-2 text-sm outline-none">
                <option value="">Select an available driver</option>
                {availableDrivers.map((d) => <option key={d.id} value={d.id}>{d.name} — {d.licenseCategory}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cargo weight (kg)" type="number" required value={form.cargoWeightKg} onChange={(v) => setForm({ ...form, cargoWeightKg: v })} />
              <Field label="Planned distance (km)" type="number" required value={form.distanceKm} onChange={(v) => setForm({ ...form, distanceKm: v })} />
            </div>
            {errors.length > 0 && (
              <ul className="rounded-md bg-beacon-100 px-3 py-2 text-sm text-beacon">
                {errors.map((err) => <li key={err}>{err}</li>)}
              </ul>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setCreateOpen(false)} className="focus-ring rounded-md border border-concrete-300 px-3.5 py-2 text-sm text-asphalt hover:bg-concrete-100">Cancel</button>
              <button type="submit" className="focus-ring rounded-md bg-asphalt px-3.5 py-2 text-sm font-medium text-concrete hover:bg-asphalt-700">Save as draft</button>
            </div>
          </form>
        </Modal>
      )}

      {completeTarget && (
        <Modal title={`Complete trip · ${completeTarget.source} → ${completeTarget.destination}`} onClose={() => setCompleteTarget(null)}>
          <form onSubmit={handleComplete} className="space-y-3">
            <Field label="Final odometer (km)" type="number" required value={completeForm.finalOdometer} onChange={(v) => setCompleteForm({ ...completeForm, finalOdometer: v })} />
            <Field label="Fuel consumed (L)" type="number" required value={completeForm.fuelConsumedL} onChange={(v) => setCompleteForm({ ...completeForm, fuelConsumedL: v })} />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setCompleteTarget(null)} className="focus-ring rounded-md border border-concrete-300 px-3.5 py-2 text-sm text-asphalt hover:bg-concrete-100">Cancel</button>
              <button type="submit" className="focus-ring rounded-md bg-signal px-3.5 py-2 text-sm font-medium text-white hover:opacity-90">Mark completed</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}

function ActionButton({ onClick, icon: Icon, label, tone }) {
  const toneClasses = tone === 'signal' ? 'bg-signal-100 text-signal hover:bg-signal-100/70' : 'bg-beacon-100 text-beacon hover:bg-beacon-100/70'
  return (
    <button onClick={onClick} className={`focus-ring flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${toneClasses}`}>
      <Icon size={13} /> {label}
    </button>
  )
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-asphalt">{label}</label>
      <input {...props} onChange={(e) => props.onChange(e.target.value)} className="focus-ring w-full rounded-md border border-concrete-300 px-3 py-2 text-sm outline-none" />
    </div>
  )
}
