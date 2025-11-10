'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupForm() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Check if username is already taken (check both cards and profiles tables)
      const [cardResult, profileResult] = await Promise.all([
        supabase.from('cards').select('username').eq('username', username).maybeSingle(),
        supabase.from('profiles').select('username').eq('username', username).maybeSingle(),
      ])

      if (cardResult.data || profileResult.data) {
        throw new Error('Username is already taken')
      }

      // Sign up the user
      console.log('Attempting signup with:', { email, username, hasPassword: !!password })
      
      const signUpResult = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName,
          },
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
        },
      })

      console.log('Signup result:', {
        hasUser: !!signUpResult.data?.user,
        hasError: !!signUpResult.error,
        user: signUpResult.data?.user,
        error: signUpResult.error,
        session: signUpResult.data?.session,
      })

      if (signUpResult.error) {
        const errorMsg = signUpResult.error?.message || JSON.stringify(signUpResult.error) || 'Failed to create account'
        console.error('Signup error:', {
          error: signUpResult.error,
          message: signUpResult.error?.message,
          status: signUpResult.error?.status,
          name: signUpResult.error?.name,
          toString: signUpResult.error?.toString(),
        })
        throw new Error(errorMsg)
      }

      if (!signUpResult.data?.user) {
        console.error('No user data returned from signup', signUpResult.data)
        throw new Error('User creation failed - no user data returned. Check if email confirmation is required.')
      }

      console.log('User created successfully:', signUpResult.data.user.id)

      // Don't create card here - let dashboard handle it
      // This avoids issues with email confirmation and timing
      // The dashboard will create the card if it doesn't exist
      
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      console.error('Signup form error:', error)
      setError(error.message || 'An error occurred during signup. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Username <span className="text-red-500">*</span>
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white"
          placeholder="clementgeorge"
        />
        <p className="text-xs text-gray-500 mt-1">Your card will be at sterlingcards.com/{username}</p>
      </div>

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password <span className="text-red-500">*</span>
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white"
          placeholder="••••••••"
        />
        <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
  )
}

