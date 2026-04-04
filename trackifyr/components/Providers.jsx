/**
 * @fileoverview Providers component - wraps application with context providers.
 * @author Muhammad Moin U Din (BCSF22M023)
 * @author Muhammad Junaid Malik (BCSF22M031)
 * @author Muhammad Subhan Ul Haq (BCSF22M043)
 */

'use client'

import { useEffect } from 'react'
import { AuthProvider } from '@/context/AuthContext'

export default function Providers({ children }) {
  // #region agent log
  useEffect(() => {
    const AGENT_LOG = 'http://127.0.0.1:7902/ingest/12dc9b3d-fb1e-4500-92ef-90b256789304'
    const send = (hypothesisId, message, data) => {
      fetch(AGENT_LOG, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '6cdaaf' },
        body: JSON.stringify({
          sessionId: '6cdaaf',
          hypothesisId,
          location: 'Providers.jsx',
          message,
          data: data || {},
          timestamp: Date.now(),
        }),
      }).catch(() => {})
    }
    send('H1', 'providers_mount', { href: typeof window !== 'undefined' ? window.location.href : '' })
    const onErr = (e) => {
      const err = e && e.error
      send('H1', 'window_error', {
        msg: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        name: err && err.name,
        stack: err && err.stack ? String(err.stack).slice(0, 2000) : '',
        targetSrc:
          e.target && 'src' in e.target && e.target.src ? String(e.target.src).slice(0, 800) : '',
      })
    }
    const onRej = (e) => {
      send('H1', 'unhandledrejection', {
        reason: String(e.reason && e.reason.message ? e.reason.message : e.reason),
      })
    }
    window.addEventListener('error', onErr, true)
    window.addEventListener('unhandledrejection', onRej)
    return () => {
      window.removeEventListener('error', onErr, true)
      window.removeEventListener('unhandledrejection', onRej)
    }
  }, [])
  // #endregion

  return <AuthProvider>{children}</AuthProvider>
}



