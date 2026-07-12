import { useState } from 'react'
import { Plus, Fuel as FuelIcon, Receipt } from 'lucide-react'
import Topbar from '../components/layout/Topbar'
import Modal from '../components/ui/Modal'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'

const EMPTY_FUEL = { vehicleId: '', liters: '', cost: '', date: new Date().toISOString().slice(0, 10) }
const EMPTY_EXPENSE = { vehicleId: '', category: 'Toll', amount: '', date: new Date().toISOString().slice(0, 10), note: '' }

export default function FuelExpenses() {
  const { vehicles, fuelLogs, expenses, maintenanceLogs, addFuelLog, addExpense } = useData()
  const { can } = useAuth()
  const canWrite = can('fuel:write') || can('expenses:write')
  const [fuelOpen, setFuelOpen] = useState(false)
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [fuelForm, setFuelForm] = useState(EMPTY_FUEL)
  const [expenseForm, setExpenseForm] = useState(EMPTY_EXPENSE)

  const vehicleById = (id) => vehicles.find((v) => v.id === id)

  const costByVehicle = vehicles.map((v) => {
    const fuelCost = fuelLogs.filter((f) => f.vehicleId === v.id).reduce((s, f) => s + f.cost, 0)
    const maintCost = maintenanceLogs.filter((m) => m.vehicleId === v.id).reduce((s, m) => s + m.cost, 0)
    return { vehicle: v, fuelCost, maintCost, total: fuelCost + maintCost }
  }).filter((r) => r.total > 0)

  const submitFuel = (e) => {
    e.preventDefault()
    addFuelLog({ ...fuelForm, liters: Number(fuelForm.liters), cost: Number(fuelForm.cost) })
    setFuelOpen(false)
    setFuelForm(EMPTY_FUEL)
  }
  const submitExpense = (e) => {
    e.preventDefault()
    addExpense({ ...expenseForm, amount: Number(expenseForm.amount) })
    setExpenseOpen(false)
    setExpenseForm(EMPTY_EXPENSE)
  }

  return (
    <>
      <Topbar title="Fuel & Expense Management" />
      <main className="flex-1 overflow-y-auto p-6">
        {canWrite && (
          <div className="mb-4 flex justify-end gap-2">
            <button onClick={() => setExpenseOpen(true)} className="focus-ring flex items-center gap-1.5 rounded-md border border-concrete-300 bg-white px-3.5 py-2 text-sm font-medium text-asphalt hover:bg-concrete-100">
              <Receipt size={15} /> Log expense
            </button>
            <button onClick={() => setFuelOpen(true)} className="focus-ring flex items-center gap-1.5 rounded-md bg-asphalt px-3.5 py-2 text-sm font-medium text-concrete hover:bg-asphalt-700">
              <FuelIcon size={15} /> Log fuel
            </button>
          </div>
        )}

        <div className="mb-6 rounded-lg border border-concrete-300 bg-white p-4">
          <h3 className="font-display text-base font-medium text-asphalt">Operational cost per vehicle</h3>
          <p className="mt-0.5 text-xs text-asphalt-500">Fuel + maintenance, computed automatically.</p>
          <div className="mt-3 overflow-hidden rounded-md border border-concrete-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-concrete-100 text-xs uppercase tracking-wide text-asphalt-500">
                <tr>
                  <th className="px-3 py-2">Vehicle</th>
                  <th className="px-3 py-2">Fuel Cost</th>
                  <th className="px-3 py-2">Maintenance Cost</th>
                  <th className="px-3 py-2">Total Operational Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-concrete-200">
                {costByVehicle.map((r) => (
                  <tr key={r.vehicle.id}>
                    <td className="px-3 py-2 font-medium text-asphalt">{r.vehicle.name} <span className="font-mono text-xs text-asphalt-500">({r.vehicle.regNumber})</span></td>
                    <td className="px-3 py-2 tabular">₹{r.fuelCost.toLocaleString()}</td>
                    <td className="px-3 py-2 tabular">₹{r.maintCost.toLocaleString()}</td>
                    <td className="px-3 py-2 tabular font-medium">₹{r.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-concrete-300 bg-white p-4">
            <h3 className="font-display text-base font-medium text-asphalt">Fuel logs</h3>
            <ul className="mt-3 divide-y divide-concrete-200">
              {fuelLogs.slice().reverse().map((f) => (
                <li key={f.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-asphalt">{vehicleById(f.vehicleId)?.name ?? '—'}</span>
                  <span className="tabular text-asphalt-500">{f.liters} L</span>
                  <span className="font-mono text-xs text-asphalt-500">{f.date}</span>
                  <span className="tabular font-medium">₹{f.cost.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-concrete-300 bg-white p-4">
            <h3 className="font-display text-base font-medium text-asphalt">Expenses</h3>
            <ul className="mt-3 divide-y divide-concrete-200">
              {expenses.slice().reverse().map((e) => (
                <li key={e.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-asphalt">{vehicleById(e.vehicleId)?.name ?? '—'}</span>
                  <span className="text-asphalt-500">{e.category}</span>
                  <span className="font-mono text-xs text-asphalt-500">{e.date}</span>
                  <span className="tabular font-medium">₹{e.amount.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      {fuelOpen && (
        <Modal title="Log fuel" onClose={() => setFuelOpen(false)}>
          <form onSubmit={submitFuel} className="space-y-3">
            <VehicleSelect vehicles={vehicles} value={fuelForm.vehicleId} onChange={(v) => setFuelForm({ ...fuelForm, vehicleId: v })} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Liters" type="number" required value={fuelForm.liters} onChange={(v) => setFuelForm({ ...fuelForm, liters: v })} />
              <Field label="Cost (₹)" type="number" required value={fuelForm.cost} onChange={(v) => setFuelForm({ ...fuelForm, cost: v })} />
            </div>
            <Field label="Date" type="date" required value={fuelForm.date} onChange={(v) => setFuelForm({ ...fuelForm, date: v })} />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setFuelOpen(false)} className="focus-ring rounded-md border border-concrete-300 px-3.5 py-2 text-sm text-asphalt hover:bg-concrete-100">Cancel</button>
              <button type="submit" className="focus-ring rounded-md bg-asphalt px-3.5 py-2 text-sm font-medium text-concrete hover:bg-asphalt-700">Save fuel log</button>
            </div>
          </form>
        </Modal>
      )}

      {expenseOpen && (
        <Modal title="Log expense" onClose={() => setExpenseOpen(false)}>
          <form onSubmit={submitExpense} className="space-y-3">
            <VehicleSelect vehicles={vehicles} value={expenseForm.vehicleId} onChange={(v) => setExpenseForm({ ...expenseForm, vehicleId: v })} />
            <div>
              <label className="mb-1 block text-sm font-medium text-asphalt">Category</label>
              <select value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} className="focus-ring w-full rounded-md border border-concrete-300 px-3 py-2 text-sm outline-none">
                {['Toll', 'Maintenance', 'Parking', 'Permit', 'Other'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Amount (₹)" type="number" required value={expenseForm.amount} onChange={(v) => setExpenseForm({ ...expenseForm, amount: v })} />
              <Field label="Date" type="date" required value={expenseForm.date} onChange={(v) => setExpenseForm({ ...expenseForm, date: v })} />
            </div>
            <Field label="Note" value={expenseForm.note} onChange={(v) => setExpenseForm({ ...expenseForm, note: v })} />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setExpenseOpen(false)} className="focus-ring rounded-md border border-concrete-300 px-3.5 py-2 text-sm text-asphalt hover:bg-concrete-100">Cancel</button>
              <button type="submit" className="focus-ring rounded-md bg-asphalt px-3.5 py-2 text-sm font-medium text-concrete hover:bg-asphalt-700">Save expense</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}

function VehicleSelect({ vehicles, value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-asphalt">Vehicle</label>
      <select required value={value} onChange={(e) => onChange(e.target.value)} className="focus-ring w-full rounded-md border border-concrete-300 px-3 py-2 text-sm outline-none">
        <option value="">Select a vehicle</option>
        {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name} — {v.regNumber}</option>)}
      </select>
    </div>
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
