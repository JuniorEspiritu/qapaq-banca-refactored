import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import * as api from '../lib/api.js'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => api.getUser())

  const login = useCallback(async (codigo, password) => {
    const data = await api.login(codigo, password)
    api.saveSession(data.access_token, data.usuario)
    setUser(data.usuario)
    return data.usuario
  }, [])

  const logout = useCallback(() => {
    api.clearSession()
    setUser(null)
  }, [])

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    rol: user?.rol,
    login,
    logout,
  }), [user, login, logout])

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
