import { useState, useEffect } from 'react'
import { adminApi } from '../services/api'

const ADMIN_TOKEN_KEY = 'woohwa_admin_token'
const ADMIN_EMAIL_KEY = 'woohwa_admin_email'

interface AdminSession {
  token: string
  email: string
}

interface UseAdminAuthReturn {
  adminSession: AdminSession | null
  isVerifying: boolean
  error: string | null
  handleGoogleCallback: (token: string, email: string) => Promise<void>
  logout: () => void
}

export function useAdminAuth(): UseAdminAuthReturn {
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => {
    const token = sessionStorage.getItem(ADMIN_TOKEN_KEY)
    const email = sessionStorage.getItem(ADMIN_EMAIL_KEY)
    return token && email ? { token, email } : null
  })
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (adminSession) {
      adminApi.verifyAdmin(adminSession.token).catch(() => {
        setAdminSession(null)
        sessionStorage.removeItem(ADMIN_TOKEN_KEY)
        sessionStorage.removeItem(ADMIN_EMAIL_KEY)
      })
    }
  }, [])

  const handleGoogleCallback = async (token: string, email: string) => {
    setIsVerifying(true)
    setError(null)
    try {
      const result = await adminApi.verifyAdmin(token)
      if (result.valid) {
        sessionStorage.setItem(ADMIN_TOKEN_KEY, token)
        sessionStorage.setItem(ADMIN_EMAIL_KEY, email)
        setAdminSession({ token, email })
      } else {
        setError('관리자 권한이 없습니다. 담당자에게 문의해주세요.')
      }
    } catch {
      setError('인증에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsVerifying(false)
    }
  }

  const logout = () => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY)
    sessionStorage.removeItem(ADMIN_EMAIL_KEY)
    setAdminSession(null)
    window.location.href = '/'
  }

  return { adminSession, isVerifying, error, handleGoogleCallback, logout }
}
