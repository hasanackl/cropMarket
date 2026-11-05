import { useState, type ReactNode } from 'react'
import type { AuthUser } from '../types'
import { AuthContext } from './AuthContext'

const STORAGE_KEY = 'authUser'

function readStoredUser(): AuthUser | null {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : null
}

type AuthProviderProps = {
  children: ReactNode
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser)

  function login(newUser: AuthUser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    setUser(newUser)
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return <AuthContext value={{ user, login, logout }}>{children}</AuthContext>
}

export default AuthProvider