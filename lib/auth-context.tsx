'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  bio: string | null
  createdAt: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for token in localStorage on mount
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      fetchCurrentUser(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setToken(authToken)
      } else {
        localStorage.removeItem('token')
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      localStorage.removeItem('token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Login failed')
    }

    const data = await response.json()
    setUser(data.user)
    setToken(data.token)
    localStorage.setItem('token', data.token)
  }

  const signup = async (name: string, email: string, password: string) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Signup failed')
    }

    const data = await response.json()
    setUser(data.user)
    setToken(data.token)
    localStorage.setItem('token', data.token)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
