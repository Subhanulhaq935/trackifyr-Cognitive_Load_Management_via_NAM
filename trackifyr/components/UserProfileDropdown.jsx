/**
 * @fileoverview UserProfileDropdown component - displays user profile dropdown
 * with profile link and logout functionality.
 * @author Muhammad Moin U Din (BCSF22M023)
 * @author Muhammad Junaid Malik (BCSF22M031)
 * @author Muhammad Subhan Ul Haq (BCSF22M043)
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function UserProfileDropdown() {
  const router = useRouter()
  const { signout, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLogout = () => {
    signout()
    router.push('/signin')
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 rounded-lg border-l border-gray-200 px-2 py-1 pl-3 transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-slate-600 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-900"
      >
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium leading-tight text-gray-900 dark:text-slate-100">{user?.fullName || 'User'}</p>
          <p className="max-w-[140px] truncate text-xs leading-tight text-gray-500 dark:text-slate-400">{user?.email || ''}</p>
        </div>
        <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 text-sm font-semibold text-white shadow-sm ring-1 ring-white dark:ring-slate-700">
          {user?.fullName?.charAt(0) || 'U'}
          <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
            isOpen ? 'bg-green-500' : 'bg-gray-400'
          } transition-colors duration-200`}></div>
        </div>
        <svg 
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 dark:text-slate-500 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 animate-in rounded-lg border border-gray-200 bg-white py-2 shadow-xl dark:border-slate-600 dark:bg-slate-900">
          <div className="border-b border-gray-100 px-4 py-3 dark:border-slate-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{user?.fullName || 'User'}</p>
            <p className="mt-0.5 break-all text-xs text-gray-500 dark:text-slate-400">{user?.email || 'email@example.com'}</p>
          </div>
          
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2.5 text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <svg className="mr-3 h-4 w-4 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 transition-colors duration-150 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              <svg className="mr-3 h-4 w-4 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

