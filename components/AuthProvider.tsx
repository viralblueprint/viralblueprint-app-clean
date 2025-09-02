'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { User } from '@supabase/supabase-js'
import { createDefaultAlbumsForUser } from '@/lib/create-default-albums'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // Create default albums if user is logged in
      if (session?.user) {
        createDefaultAlbumsForUser()
      }
    })

    // Listen for changes on auth state (signed in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // Create default albums on sign in
      if (event === 'SIGNED_IN' && session?.user) {
        createDefaultAlbumsForUser()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('Signing in with:', email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    console.log('Sign in result:', { data, error })
    if (data?.user) {
      setUser(data.user)
    }
    return { data, error }
  }

  const signUp = async (email: string, password: string) => {
    console.log('Signing up with:', email)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    console.log('Sign up result:', { data, error })
    if (data?.user) {
      setUser(data.user)
    }
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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