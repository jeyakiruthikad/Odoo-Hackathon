import { useState } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import Topbar from '../components/layout/Topbar'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { VEHICLE_STATUS } from '../data/mockData'

const EMPTY = { regNumber: '', name: '', type: 'Van', maxLoadKg: '', odometer: '', acquisitionCost: '', status: 'Available', region: '' }

export default function Vehicles() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useData()
  const { can } = useAuth()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  const canWrite = can('vehicles:write')

  const filtered = vehicles.filter(
    (v) => v.regNumber.toLowerCase().includes(search.toLowerCase()) || v.name.toLowerCase().includes(search.toLowerCase()),
  )

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(''); setModalOpen(true) }
  const openEdit = (v) => { setEditing(v); setForm(v); setError(''); setModalOpen(true) }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      maxLoadKg: Number(form.maxLoadKg),
      odometer: Number(form.odometer),
      acquisitionCost: Number(form.acquisitionCost),
    }
    const result = editing ? updateVehicle(editing.id, payload) : addVehicle(payload)
    if (!result.ok) { setError(result.error); return }
    setModalOpen(false)
  }

  return (
    <>
      <Topbar title="Vehicle Registry" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="relative w-full max-w-xs">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-asphalt-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reg. number or name"
              className="focus-ring w-full rounded-md border border-concrete-300 bg-white py-2 pl-9 pr-3 text-sm outline-none"
            />
          </div>
          {canWrite && (
            <button onClick={openCreate} className="focus-ring flex items-center gap-1.5 rounded-md bg-asphalt px-3.5 py-2 text-sm font-medium text-concrete hover:bg-asphalt-700">
              <Plus size={16} /> Register vehicle
            </button>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border border-concrete-300 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-concrete-100 text-xs uppercase tracking-wide text-asphalt-500">
              <tr>
                <th className="px-4 py-3">Reg. Number</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Max Load</th>
                <th className="px-4 py-3">Odometer</th>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3">Status</th>
                {canWrite && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-concrete-200">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-concrete-100/60">
                  <td className="px-4 py-3 font-mono text-xs">{v.regNumber}</td>
                  <td className="px-4 py-3 font-medium text-asphalt">{v.name}</td>
                  <td className="px-4 py-3">{v.type}</td>
                  <td className="px-4 py-3 tabular">{v.maxLoadKg.toLocaleString()} kg</td>
                  <td className="px-4 py-3 tabular font-mono text-xs">{v.odometer.toLocaleString()} km</td>
                  <td className="px-4 py-3">{v.region}</td>
                  <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                  {canWrite && (
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => openEdit(v)} className="focus-ring rounded p-1.5 text-asphalt-500 hover:bg-concrete-200" aria-label={`Edit ${v.name}`}>
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => deleteVehicle(v.id)} className="focus-ring rounded p-1.5 text-beacon hover:bg-beacon-100" aria-label={`Delete ${v.name}`}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-asphalt-500">No vehicles match that search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {modalOpen && (
        <Modal title={editing ? `Edit ${editing.name}` : 'Register a vehicle'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Registration number" required value={form.regNumber} onChange={(v) => setForm({ ...form, regNumber: v })} placeholder="TN-07-AX-2201" mono />
            <Field label="Vehicle name / model" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Van-05" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-asphalt">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="focus-ring w-full rounded-md border border-concrete-300 px-3 py-2 text-sm outline-none">
                  {['Van', 'Mini Truck', 'Truck', 'Bike'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-asphalt">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="focus-ring w-full rounded-md border border-concrete-300 px-3 py-2 text-sm outline-none">
                  {VEHICLE_STATUS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Max load (kg)" type="number" required value={form.maxLoadKg} onChange={(v) => setForm({ ...form, maxLoadKg: v })} />
              <Field label="Odometer (km)" type="number" required value={form.odometer} onChange={(v) => setForm({ ...form, odometer: v })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Acquisition cost (₹)" type="number" required value={form.acquisitionCost} onChange={(v) => setForm({ ...form, acquisitionCost: v })} />
              <Field label="Region" required value={form.region} onChange={(v) => setForm({ ...form, region: v })} placeholder="Chennai" />
            </div>
            {error && <p className="rounded-md bg-beacon-100 px-3 py-2 text-sm text-beacon" role="alert">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="focus-ring rounded-md border border-concrete-300 px-3.5 py-2 text-sm text-asphalt hover:bg-concrete-100">Cancel</button>
              <button type="submit" className="focus-ring rounded-md bg-asphalt px-3.5 py-2 text-sm font-medium text-concrete hover:bg-asphalt-700">{editing ? 'Save changes' : 'Register vehicle'}</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}

function Field({ label, mono, ...props }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-asphalt">{label}</label>
      <input {...props} onChange={(e) => props.onChange(e.target.value)} className={`focus-ring w-full rounded-md border border-concrete-300 px-3 py-2 text-sm outline-none ${mono ? 'font-mono' : ''}`} />
    </div>
  )
}
