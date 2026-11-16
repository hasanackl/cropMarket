import { useEffect, useState, type ReactNode } from 'react'
import type { AuthUser } from '../types'
import { AuthContext } from './AuthContext'
import { getTokenExpiry } from '../utils/getTokenExpiry'

const STORAGE_KEY = 'authUser'

function readStoredUser(): AuthUser | null {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (stored === null) {
    return null
  }

  const user: AuthUser = JSON.parse(stored)

  // An expired token is useless, so the app starts logged out
  if (getTokenExpiry(user.token) <= Date.now()) {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }

  return user
}

type AuthProviderProps = {
  children: ReactNode
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser)
  const [isSessionExpired, setIsSessionExpired] = useState(false)

  useEffect(() => {
    if (user === null) {
      return
    }

    const timeLeft = getTokenExpiry(user.token) - Date.now()

    // Log out on our own at the moment the token stops working
    const timer = setTimeout(() => {
      localStorage.removeItem(STORAGE_KEY)
      setUser(null)
      setIsSessionExpired(true)
    }, timeLeft)

    return () => clearTimeout(timer)
  }, [user])

  function login(newUser: AuthUser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    setUser(newUser)
    setIsSessionExpired(false)
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return <AuthContext value={{ user, isSessionExpired, login, logout }}>{children}</AuthContext>
}

export default AuthProvider