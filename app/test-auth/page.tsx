'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function TestAuthPage() {
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Test page - Session:', session)
      setSession(session)
      setUser(session?.user)
      setLoading(false)
    })

    // Get user
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      console.log('Test page - User:', user, 'Error:', error)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Test page - Auth event:', event, session)
      setSession(session)
      setUser(session?.user)
    })

    return () => subscription.unsubscribe()
  }, [])

  const testSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword123'
    })
    console.log('Test sign in:', { data, error })
  }

  const testSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    })
    console.log('Test sign up:', { data, error })
  }

  const testSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    console.log('Test sign out:', { error })
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {user ? user.email : 'Not logged in'}</p>
        <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
        <p><strong>Session:</strong> {session ? 'Active' : 'None'}</p>
      </div>

      <div className="space-x-4">
        <button 
          onClick={testSignUp}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Test Sign Up
        </button>
        <button 
          onClick={testSignIn}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Test Sign In
        </button>
        <button 
          onClick={testSignOut}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Test Sign Out
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold mb-2">Environment Variables:</h2>
        <p className="text-xs break-all">URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
        <p className="text-xs break-all">Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...</p>
      </div>
    </div>
  )
}