import { useMemo, useState } from 'react'
import { Car, Wrench, Route, Users, Gauge } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts'
import Topbar from '../components/layout/Topbar'
import KpiCard from '../components/ui/KpiCard'
import StatusBadge from '../components/ui/StatusBadge'
import { useData } from '../context/DataContext'

const PIE_COLORS = ['#1E8E5A', '#3E5C88', '#F5B400', '#3A3D47']

export default function Dashboard() {
  const { vehicles, drivers, trips } = useData()
  const [typeFilter, setTypeFilter] = useState('All')
  const [regionFilter, setRegionFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  const types = useMemo(() => ['All', ...new Set(vehicles.map((v) => v.type))], [vehicles])
  const regions = useMemo(() => ['All', ...new Set(vehicles.map((v) => v.region))], [vehicles])

  const filteredVehicles = vehicles.filter(
    (v) =>
      (typeFilter === 'All' || v.type === typeFilter) &&
      (regionFilter === 'All' || v.region === regionFilter) &&
      (statusFilter === 'All' || v.status === statusFilter),
  )

  const activeVehicles = filteredVehicles.filter((v) => v.status !== 'Retired').length
  const availableVehicles = filteredVehicles.filter((v) => v.status === 'Available').length
  const inMaintenance = filteredVehicles.filter((v) => v.status === 'In Shop').length
  const activeTrips = trips.filter((t) => t.status === 'Dispatched').length
  const pendingTrips = trips.filter((t) => t.status === 'Draft').length
  const driversOnDuty = drivers.filter((d) => d.status === 'On Trip' || d.status === 'Available').length
  const utilization = filteredVehicles.length
    ? Math.round((filteredVehicles.filter((v) => v.status === 'On Trip').length / filteredVehicles.length) * 100)
    : 0

  const statusBreakdown = ['Available', 'On Trip', 'In Shop', 'Retired'].map((s) => ({
    status: s,
    count: vehicles.filter((v) => v.status === s).length,
  }))

  const tripsByStatus = ['Draft', 'Dispatched', 'Completed', 'Cancelled'].map((s) => ({
    name: s,
    value: trips.filter((t) => t.status === s).length,
  })).filter((d) => d.value > 0)

  const recentTrips = [...trips].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 5)

  return (
    <>
      <Topbar title="Dashboard" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <FilterSelect label="Type" value={typeFilter} onChange={setTypeFilter} options={types} />
          <FilterSelect label="Region" value={regionFilter} onChange={setRegionFilter} options={regions} />
          <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={['All', 'Available', 'On Trip', 'In Shop', 'Retired']} />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <KpiCard label="Active Vehicles" value={activeVehicles} icon={Car} />
          <KpiCard label="Available Vehicles" value={availableVehicles} icon={Car} />
          <KpiCard label="In Maintenance" value={inMaintenance} icon={Wrench} />
          <KpiCard label="Active Trips" value={activeTrips} icon={Route} />
          <KpiCard label="Pending Trips" value={pendingTrips} icon={Route} />
          <KpiCard label="Drivers On Duty" value={driversOnDuty} icon={Users} />
          <KpiCard label="Fleet Utilization" value={utilization} unit="%" icon={Gauge} accent />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-concrete-300 bg-white p-4">
            <h3 className="font-display text-base font-medium text-asphalt">Fleet status breakdown</h3>
            <div className="mt-3 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3E5E0" vertical={false} />
                  <XAxis dataKey="status" tick={{ fontSize: 12, fill: '#3A3D47' }} axisLine={{ stroke: '#C9CCC5' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#3A3D47' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#EDEFEC' }} />
                  <Bar dataKey="count" fill="#3E5C88" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-lg border border-concrete-300 bg-white p-4">
            <h3 className="font-display text-base font-medium text-asphalt">Trips by lifecycle stage</h3>
            <div className="mt-3 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={tripsByStatus} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {tripsByStatus.map((entry, i) => (
                      <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-concrete-300 bg-white p-4">
          <h3 className="font-display text-base font-medium text-asphalt">Recent activity</h3>
          <div className="mt-3 divide-y divide-concrete-200">
            {recentTrips.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium text-asphalt">{t.source} → {t.destination}</p>
                  <p className="font-mono text-xs text-asphalt-500">{t.createdAt} · {t.cargoWeightKg} kg · {t.distanceKm} km</p>
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="flex items-center gap-2 text-sm text-asphalt-500">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring rounded-md border border-concrete-300 bg-white px-2.5 py-1.5 text-sm text-asphalt outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  )
}
