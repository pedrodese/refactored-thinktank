import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  apiFetch,
  clearTokens,
  getRefreshToken,
  setSessionExpiredHandler,
  setTokens,
  type TokenPair,
} from './api-client'

// Só o essencial da sessão logada — não confundir com `types/user.ts`, que é
// o shape da listagem antiga (ainda em Inertia) de /users.
export interface CurrentUser {
  id: string
  fullName: string
  authorizationLevel: string
  email: string
}

interface AuthContextValue {
  user: CurrentUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setSessionExpiredHandler(() => setUser(null))

    if (!getRefreshToken()) {
      setIsLoading(false)
      return
    }

    apiFetch<CurrentUser>('/users/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))

    return () => setSessionExpiredHandler(null)
  }, [])

  const login = async (email: string, password: string) => {
    setTokens(await apiFetch<TokenPair>('/auth/login', { method: 'POST', body: { email, password } }))
    setUser(await apiFetch<CurrentUser>('/users/me'))
  }

  const logout = async () => {
    const refreshToken = getRefreshToken()
    clearTokens()
    setUser(null)
    if (refreshToken) {
      await apiFetch('/auth/logout', { method: 'POST', body: { refreshToken } }).catch(() => {})
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
