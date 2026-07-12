import { createContext, useContext, useEffect, useState } from 'react'
import { DEMO_USERS, ROLES } from '../data/mockData'

const AuthContext = createContext(null)

// Which roles may perform which actions. Read access to pages is broader
// (everyone authenticated can view most modules); this map governs
// mutation / action rights referenced across the app.
const PERMISSIONS = {
  [ROLES.FLEET_MANAGER]: ['vehicles:write', 'drivers:write', 'trips:write', 'maintenance:write', 'fuel:write', 'expenses:write'],
  [ROLES.DRIVER]: ['trips:write'],
  [ROLES.SAFETY_OFFICER]: ['drivers:write'],
  [ROLES.FINANCIAL_ANALYST]: ['fuel:write', 'expenses:write'],
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('transitops_user')
    return stored ? JSON.parse(stored) : null
  })

  useEffect(() => {
    if (user) localStorage.setItem('transitops_user', JSON.stringify(user))
    else localStorage.removeItem('transitops_user')
  }, [user])

  const login = (email, password) => {
    const match = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
    )
    if (!match) return { ok: false, error: 'Incorrect email or password.' }
    const { password: _pw, ...safeUser } = match
    setUser(safeUser)
    return { ok: true }
  }

  const logout = () => setUser(null)

  const can = (permission) => !!user && (PERMISSIONS[user.role] || []).includes(permission)

  return (
    <AuthContext.Provider value={{ user, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
