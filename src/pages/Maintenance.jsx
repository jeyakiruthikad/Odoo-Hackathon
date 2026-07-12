import { useState } from 'react'
import { Plus, CheckCircle2 } from 'lucide-react'
import Topbar from '../components/layout/Topbar'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'

const EMPTY = { vehicleId: '', type: 'Oil Change', description: '', cost: '', date: new Date().toISOString().slice(0, 10) }

export default function Maintenance() {
  const { maintenanceLogs, vehicles, addMaintenance, closeMaintenance } = useData()
  const { can } = useAuth()
  const canWrite = can('maintenance:write')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const vehicleById = (id) => vehicles.find((v) => v.id === id)
  // Vehicles that are Retired shouldn't get new maintenance records; vehicles
  // already In Shop can still receive additional line items on their record.
  const eligibleVehicles = vehicles.filter((v) => v.status !== 'Retired')

  const handleSubmit = (e) => {
    e.preventDefault()
    addMaintenance({ ...form, cost: Number(form.cost) })
    setOpen(false)
    setForm(EMPTY)
  }

  return (
    <>
      <Topbar title="Maintenance" />
      <main className="flex-1 overflow-y-auto p-6">
        {canWrite && (
          <div className="mb-4 flex justify-end">
            <button onClick={() => setOpen(true)} className="focus-ring flex items-center gap-1.5 rounded-md bg-asphalt px-3.5 py-2 text-sm font-medium text-concrete hover:bg-asphalt-700">
              <Plus size={16} /> New maintenance record
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-concrete-300 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-concrete-100 text-xs uppercase tracking-wide text-asphalt-500">
              <tr>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Cost</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Record Status</th>
                <th className="px-4 py-3">Vehicle Status</th>
                {canWrite && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-concrete-200">
              {maintenanceLogs.map((m) => {
                const vehicle = vehicleById(m.vehicleId)
                return (
                  <tr key={m.id} className="hover:bg-concrete-100/60">
                    <td className="px-4 py-3 font-medium text-asphalt">{vehicle?.name ?? '—'} <span className="font-mono text-xs text-asphalt-500">({vehicle?.regNumber})</span></td>
                    <td className="px-4 py-3">{m.type}</td>
                    <td className="px-4 py-3 text-asphalt-500">{m.description}</td>
                    <td className="px-4 py-3 tabular">₹{m.cost.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-xs">{m.date}</td>
                    <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                    <td className="px-4 py-3">{vehicle && <StatusBadge status={vehicle.status} />}</td>
                    {canWrite && (
                      <td className="px-4 py-3 text-right">
                        {m.status === 'Active' && (
                          <button onClick={() => closeMaintenance(m.id)} className="focus-ring inline-flex items-center gap-1.5 rounded-md bg-signal-100 px-3 py-1.5 text-xs font-medium text-signal hover:bg-signal-100/70">
                            <CheckCircle2 size={13} /> Close
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
              {maintenanceLogs.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-asphalt-500">No maintenance records yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {open && (
        <Modal title="New maintenance record" onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-asphalt">Vehicle</label>
              <select required value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} className="focus-ring w-full rounded-md border border-concrete-300 px-3 py-2 text-sm outline-none">
                <option value="">Select a vehicle</option>
                {eligibleVehicles.map((v) => <option key={v.id} value={v.id}>{v.name} — {v.regNumber}</option>)}
              </select>
              <p className="mt-1 text-xs text-asphalt-500">Adding this record switches the vehicle to "In Shop" and removes it from dispatch selection.</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-asphalt">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="focus-ring w-full rounded-md border border-concrete-300 px-3 py-2 text-sm outline-none">
                {['Oil Change', 'Tyre Replacement', 'Brake Service', 'Engine Repair', 'Inspection', 'Other'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <Field label="Description" required value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cost (₹)" type="number" required value={form.cost} onChange={(v) => setForm({ ...form, cost: v })} />
              <Field label="Date" type="date" required value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="focus-ring rounded-md border border-concrete-300 px-3.5 py-2 text-sm text-asphalt hover:bg-concrete-100">Cancel</button>
              <button type="submit" className="focus-ring rounded-md bg-asphalt px-3.5 py-2 text-sm font-medium text-concrete hover:bg-asphalt-700">Create record</button>
            </div>
          </form>
        </Modal>
      )}
    </>
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
