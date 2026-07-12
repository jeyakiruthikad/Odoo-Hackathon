import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { TrafficCone } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { DEMO_USERS } from '../data/mockData'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (user) return <Navigate to="/" replace />

  const handleSubmit = (e) => {
    e.preventDefault()
    const result = login(email, password)
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate('/')
  }

  const fillDemo = (u) => {
    setEmail(u.email)
    setPassword(u.password)
    setError('')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-asphalt px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2 text-concrete">
          <TrafficCone size={26} className="text-lane" />
          <span className="font-display text-2xl font-semibold tracking-wide">TransitOps</span>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-xl">
          <h1 className="font-display text-xl font-medium text-asphalt">Sign in to your fleet</h1>
          <p className="mt-1 text-sm text-asphalt-500">Enter your operations credentials to continue.</p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-asphalt">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus-ring w-full rounded-md border border-concrete-300 px-3 py-2 text-sm outline-none"
                placeholder="you@transitops.io"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-asphalt">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="focus-ring w-full rounded-md border border-concrete-300 px-3 py-2 text-sm outline-none"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="rounded-md bg-beacon-100 px-3 py-2 text-sm text-beacon" role="alert">{error}</p>
            )}
            <button
              type="submit"
              className="focus-ring w-full rounded-md bg-lane py-2.5 text-sm font-semibold text-asphalt hover:bg-lane-600"
            >
              Sign in
            </button>
          </form>
        </div>

        <div className="mt-4 rounded-lg border border-asphalt-600 bg-asphalt-700 p-4">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-asphalt-300">Demo access badges</p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_USERS.map((u) => (
              <button
                key={u.id}
                onClick={() => fillDemo(u)}
                className="focus-ring rounded-md border border-asphalt-500 px-2.5 py-2 text-left text-xs text-concrete hover:bg-asphalt-600"
              >
                <p className="font-medium">{u.role}</p>
                <p className="font-mono text-asphalt-300">{u.email}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
