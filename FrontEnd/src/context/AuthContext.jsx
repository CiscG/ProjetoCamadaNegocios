import { createContext, useContext, useState, useCallback } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

const STORAGE_KEY = 'alugafacil-user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = useCallback(async (email, senha) => {
    const data = await api.login(email, senha)
    const u = data.usuario
    setUser(u)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    return u
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const isHost = user?.tipo === 'anfitriao' || user?.tipo === 'ambos'
  const isGuest = user?.tipo === 'hospede' || user?.tipo === 'ambos'

  return (
    <AuthContext.Provider value={{ user, login, logout, isHost, isGuest }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
