import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Truck, Users, Route, Wrench, Fuel, BarChart3, TrafficCone,
} from 'lucide-react'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vehicles', label: 'Vehicle Registry', icon: Truck },
  { to: '/drivers', label: 'Drivers', icon: Users },
  { to: '/trips', label: 'Trips', icon: Route },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/fuel-expenses', label: 'Fuel & Expenses', icon: Fuel },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
]

export default function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-asphalt text-concrete md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <TrafficCone size={22} className="text-lane" />
        <span className="font-display text-xl font-semibold tracking-wide">TransitOps</span>
      </div>
      <nav className="mt-2 flex-1 space-y-1 px-3">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `focus-ring group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                isActive ? 'bg-asphalt-600 text-concrete' : 'text-concrete-300 hover:bg-asphalt-700 hover:text-concrete'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-lane transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                <Icon size={17} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-asphalt-600 px-5 py-4 text-xs text-asphalt-300">
        <p className="font-mono tracking-tight">v0.1 — hackathon build</p>
      </div>
    </aside>
  )
}
