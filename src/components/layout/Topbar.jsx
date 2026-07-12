import { LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Topbar({ title }) {
  const { user, logout } = useAuth()
  return (
    <header className="flex items-center justify-between border-b border-concrete-300 bg-white px-6 py-4">
      <h1 className="font-display text-2xl font-medium text-asphalt">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-md border border-concrete-300 bg-concrete-100 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-signal" aria-hidden="true" />
          <div className="text-right leading-tight">
            <p className="text-sm font-medium text-asphalt">{user?.name}</p>
            <p className="font-mono text-[11px] uppercase tracking-wide text-asphalt-500">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="focus-ring flex items-center gap-1.5 rounded-md border border-concrete-300 px-3 py-2 text-sm text-asphalt-500 hover:bg-concrete-100"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </header>
  )
}
