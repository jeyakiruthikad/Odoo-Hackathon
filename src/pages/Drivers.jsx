import { useState } from 'react'
import { Plus, Pencil, Trash2, Search, AlertTriangle } from 'lucide-react'
import Topbar from '../components/layout/Topbar'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { DRIVER_STATUS } from '../data/mockData'
import { isLicenseExpired } from '../utils/businessRules'

const EMPTY = { name: '', licenseNumber: '', licenseCategory: 'LMV', licenseExpiry: '', contact: '', safetyScore: '', status: 'Available' }

export default function Drivers() {
  const { drivers, addDriver, updateDriver, deleteDriver } = useData()
  const { can } = useAuth()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)

  const canWrite = can('drivers:write')

  const filtered = drivers.filter(
    (d) => d.name.toLowerCase().includes(search.toLowerCase()) || d.licenseNumber.toLowerCase().includes(search.toLowerCase()),
  )

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModalOpen(true) }
  const openEdit = (d) => { setEditing(d); setForm(d); setModalOpen(true) }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = { ...form, safetyScore: Number(form.safetyScore) }
    if (editing) updateDriver(editing.id, payload)
    else addDriver(payload)
    setModalOpen(false)
  }

  return (
    <>
      <Topbar title="Driver Management" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="relative w-full max-w-xs">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-asphalt-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or license number"
              className="focus-ring w-full rounded-md border border-concrete-300 bg-white py-2 pl-9 pr-3 text-sm outline-none"
            />
          </div>
          {canWrite && (
            <button onClick={openCreate} className="focus-ring flex items-center gap-1.5 rounded-md bg-asphalt px-3.5 py-2 text-sm font-medium text-concrete hover:bg-asphalt-700">
              <Plus size={16} /> Add driver
            </button>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border border-concrete-300 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-concrete-100 text-xs uppercase tracking-wide text-asphalt-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">License</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Expiry</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Safety Score</th>
                <th className="px-4 py-3">Status</th>
                {canWrite && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-concrete-200">
              {filtered.map((d) => {
                const expired = isLicenseExpired(d)
                return (
                  <tr key={d.id} className="hover:bg-concrete-100/60">
                    <td className="px-4 py-3 font-medium text-asphalt">{d.name}</td>
                    <td className="px-4 py-3 font-mono text-xs">{d.licenseNumber}</td>
                    <td className="px-4 py-3">{d.licenseCategory}</td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-xs ${expired ? 'text-beacon font-medium' : 'text-asphalt'}`}>
                        {d.licenseExpiry}
                        {expired && <AlertTriangle size={12} className="ml-1 inline" />}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{d.contact}</td>
                    <td className="px-4 py-3 tabular">{d.safetyScore}</td>
                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                    {canWrite && (
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          <button onClick={() => openEdit(d)} className="focus-ring rounded p-1.5 text-asphalt-500 hover:bg-concrete-200" aria-label={`Edit ${d.name}`}>
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => deleteDriver(d.id)} className="focus-ring rounded p-1.5 text-beacon hover:bg-beacon-100" aria-label={`Delete ${d.name}`}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-asphalt-500">No drivers match that search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {modalOpen && (
        <Modal title={editing ? `Edit ${editing.name}` : 'Add a driver'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Full name" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="License number" required mono value={form.licenseNumber} onChange={(v) => setForm({ ...form, licenseNumber: v })} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-asphalt">License category</label>
                <select value={form.licenseCategory} onChange={(e) => setForm({ ...form, licenseCategory: e.target.value })} className="focus-ring w-full rounded-md border border-concrete-300 px-3 py-2 text-sm outline-none">
                  {['LMV', 'HMV', 'MCWG'].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <Field label="License expiry" type="date" required value={form.licenseExpiry} onChange={(v) => setForm({ ...form, licenseExpiry: v })} />
            </div>
            <Field label="Contact number" required value={form.contact} onChange={(v) => setForm({ ...form, contact: v })} placeholder="+91 98400 11223" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Safety score (0-100)" type="number" min="0" max="100" required value={form.safetyScore} onChange={(v) => setForm({ ...form, safetyScore: v })} />
              <div>
                <label className="mb-1 block text-sm font-medium text-asphalt">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="focus-ring w-full rounded-md border border-concrete-300 px-3 py-2 text-sm outline-none">
                  {DRIVER_STATUS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="focus-ring rounded-md border border-concrete-300 px-3.5 py-2 text-sm text-asphalt hover:bg-concrete-100">Cancel</button>
              <button type="submit" className="focus-ring rounded-md bg-asphalt px-3.5 py-2 text-sm font-medium text-concrete hover:bg-asphalt-700">{editing ? 'Save changes' : 'Add driver'}</button>
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
