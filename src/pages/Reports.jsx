import { Download } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import Topbar from '../components/layout/Topbar'
import { useData } from '../context/DataContext'
import { exportToCsv } from '../utils/csvExport'
import { REVENUE_PER_KM } from '../data/mockData'

export default function Reports() {
  const { vehicles, trips, maintenanceLogs, fuelLogs } = useData()

  const rows = vehicles.map((v) => {
    const completedTrips = trips.filter((t) => t.vehicleId === v.id && t.status === 'Completed')
    const totalDistance = completedTrips.reduce((s, t) => s + (t.distanceKm || 0), 0)
    const vehicleFuelLogs = fuelLogs.filter((f) => f.vehicleId === v.id)
    const totalFuelL = vehicleFuelLogs.reduce((s, f) => s + f.liters, 0)
    const fuelCost = vehicleFuelLogs.reduce((s, f) => s + f.cost, 0)
    const maintCost = maintenanceLogs.filter((m) => m.vehicleId === v.id).reduce((s, m) => s + m.cost, 0)
    const operationalCost = fuelCost + maintCost
    const fuelEfficiency = totalFuelL > 0 ? totalDistance / totalFuelL : null
    const revenue = totalDistance * REVENUE_PER_KM
    const roi = v.acquisitionCost > 0 ? (revenue - operationalCost) / v.acquisitionCost : null

    return {
      vehicle: v,
      totalDistance,
      totalFuelL,
      fuelEfficiency,
      operationalCost,
      revenue,
      roi,
    }
  })

  const fleetUtilization = vehicles.length
    ? Math.round((vehicles.filter((v) => v.status === 'On Trip').length / vehicles.length) * 100)
    : 0

  const utilizationSeries = ['Available', 'On Trip', 'In Shop', 'Retired'].map((s) => ({
    status: s,
    count: vehicles.filter((v) => v.status === s).length,
  }))

  const handleExport = () => {
    exportToCsv('transitops-report.csv', rows.map((r) => ({
      RegistrationNumber: r.vehicle.regNumber,
      Vehicle: r.vehicle.name,
      TotalDistanceKm: r.totalDistance,
      TotalFuelL: r.totalFuelL.toFixed(1),
      FuelEfficiencyKmPerL: r.fuelEfficiency ? r.fuelEfficiency.toFixed(2) : '',
      OperationalCost: r.operationalCost,
      Revenue: r.revenue,
      ROI: r.roi !== null ? r.roi.toFixed(3) : '',
    })))
  }

  return (
    <>
      <Topbar title="Reports & Analytics" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-asphalt-500">Fleet utilization today: <span className="font-medium text-asphalt">{fleetUtilization}%</span></p>
          <button onClick={handleExport} className="focus-ring flex items-center gap-1.5 rounded-md bg-asphalt px-3.5 py-2 text-sm font-medium text-concrete hover:bg-asphalt-700">
            <Download size={15} /> Export CSV
          </button>
        </div>

        <div className="mb-6 rounded-lg border border-concrete-300 bg-white p-4">
          <h3 className="font-display text-base font-medium text-asphalt">Fleet status distribution</h3>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={utilizationSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3E5E0" vertical={false} />
                <XAxis dataKey="status" tick={{ fontSize: 12, fill: '#3A3D47' }} axisLine={{ stroke: '#C9CCC5' }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#3A3D47' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#F5B400" strokeWidth={2.5} dot={{ fill: '#1B1D22', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-concrete-300 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-concrete-100 text-xs uppercase tracking-wide text-asphalt-500">
              <tr>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Distance (Completed)</th>
                <th className="px-4 py-3">Fuel Used</th>
                <th className="px-4 py-3">Fuel Efficiency</th>
                <th className="px-4 py-3">Operational Cost</th>
                <th className="px-4 py-3">Est. Revenue</th>
                <th className="px-4 py-3">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-concrete-200">
              {rows.map((r) => (
                <tr key={r.vehicle.id} className="hover:bg-concrete-100/60">
                  <td className="px-4 py-3 font-medium text-asphalt">{r.vehicle.name} <span className="font-mono text-xs text-asphalt-500">({r.vehicle.regNumber})</span></td>
                  <td className="px-4 py-3 tabular">{r.totalDistance.toLocaleString()} km</td>
                  <td className="px-4 py-3 tabular">{r.totalFuelL.toFixed(1)} L</td>
                  <td className="px-4 py-3 tabular">{r.fuelEfficiency ? `${r.fuelEfficiency.toFixed(2)} km/L` : '—'}</td>
                  <td className="px-4 py-3 tabular">₹{r.operationalCost.toLocaleString()}</td>
                  <td className="px-4 py-3 tabular">₹{r.revenue.toLocaleString()}</td>
                  <td className={`px-4 py-3 tabular font-medium ${r.roi !== null && r.roi >= 0 ? 'text-signal' : 'text-beacon'}`}>
                    {r.roi !== null ? `${(r.roi * 100).toFixed(1)}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-asphalt-500">
          Revenue is not part of the entity model, so it's estimated at ₹{REVENUE_PER_KM}/km on completed-trip distance for demo purposes — swap in real billing data once available.
        </p>
      </main>
    </>
  )
}
