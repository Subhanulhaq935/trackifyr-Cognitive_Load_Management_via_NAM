/**
 * @fileoverview Profile page component - displays and allows editing of user profile.
 * @author Muhammad Moin U Din (BCSF22M023)
 * @author Muhammad Junaid Malik (BCSF22M031)
 * @author Muhammad Subhan Ul Haq (BCSF22M043)
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import ThemeToggle from '@/components/ThemeToggle'

export default function ProfilePage() {
  const router = useRouter()
  const { isAuthenticated, user, isAuthLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/signin')
    }
  }, [isAuthLoading, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
      })
    }
  }, [user])

  if (isAuthLoading || !isAuthenticated) {
    return null
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required'
    }

    return newErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSave = () => {
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      if (typeof window !== 'undefined') {
        const updatedUser = { ...user, fullName: formData.fullName.trim(), email: user?.email }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setIsEditing(false)
        setErrors({})
        window.location.reload()
      }
    } catch {
      setErrors({ submit: 'Failed to save profile. Please try again.' })
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 lg:pl-64">
        <Header title="Profile" />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 rounded-2xl bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:bg-slate-900/85 dark:ring-1 dark:ring-slate-700">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <div className="flex items-center space-x-6">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-600 text-3xl font-bold text-white">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{user?.fullName || 'User'}</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{user?.email || 'email@example.com'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2 dark:border-slate-600 dark:bg-slate-800/80">
                    <span className="text-xs font-medium text-gray-600 dark:text-slate-400">Theme</span>
                    <ThemeToggle className="!h-9 !w-9" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:bg-slate-900/85 dark:ring-1 dark:ring-slate-700">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full rounded-lg border px-4 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 ${
                      isEditing
                        ? errors.fullName
                          ? 'border-red-300 focus:ring-2 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-2 focus:ring-indigo-500'
                        : 'border-gray-200 bg-gray-50 dark:bg-slate-800/80'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    disabled
                    aria-readonly="true"
                    className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-gray-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-500">Email cannot be changed here.</p>
                </div>

                {errors.submit && (
                  <div className="pt-2 text-sm text-red-600">
                    {errors.submit}
                  </div>
                )}
                {isEditing && (
                  <div className="pt-4">
                    <button
                      onClick={handleSave}
                      className="rounded-lg bg-indigo-600 px-6 py-2 text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
