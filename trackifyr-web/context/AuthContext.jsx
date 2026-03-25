/**
 * @fileoverview Authentication context provider - manages user authentication state
 * using localStorage for persistence.
 * @author Muhammad Moin U Din (BCSF22M023)
 * @author Muhammad Junaid Malik (BCSF22M031)
 * @author Muhammad Subhan Ul Haq (BCSF22M043)
 */

'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        })

        if (res.ok) {
          const data = await res.json()
          if (data?.success && data?.user) {
            setUser(data.user)
            setIsAuthenticated(true)
          } else {
            setUser(null)
            setIsAuthenticated(false)
          }
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }
      } catch {
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setIsAuthLoading(false)
      }
    }

    loadMe()
  }, [])

  const signup = (userData) => {
    return (async () => {
      if (!userData || !userData.email || !userData.password) {
        return { success: false, error: 'Invalid user data provided' }
      }

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData),
      })

      const data = await res.json()
      return data
    })()
  }

  const signin = (email, password) => {
    return (async () => {
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' }
      }

      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (res.ok && data?.success && data?.user) {
        setUser(data.user)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
      return data
    })()
  }

  const signout = async () => {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // ignore
    }

    setUser(null)
    setIsAuthenticated(false)
    setIsAuthLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAuthLoading, signup, signin, signout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}



