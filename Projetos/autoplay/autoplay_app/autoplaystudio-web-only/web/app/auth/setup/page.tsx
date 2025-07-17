'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function SetupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const token = searchParams.get('token')

  const [formData, setFormData] = useState({
    name: '',
    jobTitle: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [inviteInfo, setInviteInfo] = useState<any>(null)

  useEffect(() => {
    if (!email || !token) {
      router.push('/auth/login')
      return
    }

    // Buscar informações reais do convite
    const fetchInviteInfo = async () => {
      try {
        const response = await fetch(
          `/api/invite-info?email=${encodeURIComponent(
            email
          )}&token=${encodeURIComponent(token)}`
        )
        const data = await response.json()

        if (response.ok && data.success) {
          setInviteInfo(data.invite)
        } else {
          console.error('Failed to fetch invite info:', data.error)
          // Fallback para dados simulados se não conseguir buscar
          setInviteInfo({
            role: 'guest',
            roleName: 'Guest',
            clientName: 'Unknown Company',
            type: 'client',
          })
        }
      } catch (error) {
        console.error('Error fetching invite info:', error)
        // Fallback para dados simulados em caso de erro
        setInviteInfo({
          role: 'guest',
          roleName: 'Guest',
          clientName: 'Unknown Company',
          type: 'client',
        })
      }
    }

    fetchInviteInfo()
  }, [email, token, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name || !formData.password) {
      setError('Please fill in all required fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      // 1. Atualizar senha do usuário
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password,
      })

      if (updateError) throw updateError

      // 2. Atualizar dados do perfil na tabela users
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { error: userError } = await supabase
          .from('users')
          .update({
            name: formData.name,
            job_title: formData.jobTitle,
          })
          .eq('id', user.id)

        if (userError) throw userError
      }

      // Sucesso - redirecionar para dashboard
      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!email || !token) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex h-screen">
      {/* Lado esquerdo (formulário) */}
      <div className="w-1/2 flex flex-col justify-center items-center p-10 bg-white">
        {/* Logo */}
        <div className="mb-10">
          <div className="w-12 h-12 bg-black rounded flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            Welcome aboard!
          </h1>
          <p className="text-gray-500 mb-6">
            Complete your profile setup and create your password
          </p>

          {/* Invite confirmation */}
          {inviteInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700">
                <strong>
                  Joining{' '}
                  {inviteInfo.type === 'studio'
                    ? inviteInfo.studioName || 'Studio'
                    : inviteInfo.clientName || 'Client Company'}
                </strong>
                <br />
                Role: {inviteInfo.roleName || inviteInfo.role || 'Member'}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title
              </label>
              <input
                type="text"
                name="jobTitle"
                placeholder="e.g. Creative Director, Designer, Project Manager..."
                value={formData.jobTitle}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password *
              </label>
              <input
                type="password"
                name="password"
                placeholder="Create a secure password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 font-medium"
            >
              {loading ? 'Setting up your account...' : 'Complete Setup'}
            </button>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By completing setup, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </div>

      {/* Lado direito (imagem) */}
      <div
        className="w-1/2 bg-cover bg-center hidden md:block relative"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>
    </div>
  )
}
