import { useState, useEffect, useCallback } from 'react'
import type { AuthSession, Coach } from '../types/coach'
import { getSession, saveSession, clearSession } from '../services/auth'
import { authApi } from '../services/api'

interface UseAuthReturn {
  session: AuthSession | null
  coaches: Coach[]
  isLoading: boolean
  error: string | null
  selectCoach: (coachId: string, phoneSuffix?: string) => Promise<boolean>
  logout: () => void
  needsPhoneVerification: boolean
  pendingCoachId: string | null
}

export function useAuth(): UseAuthReturn {
  const [session, setSession] = useState<AuthSession | null>(getSession)
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsPhoneVerification, setNeedsPhoneVerification] = useState(false)
  const [pendingCoachId, setPendingCoachId] = useState<string | null>(null)

  useEffect(() => {
    authApi.getCoaches().then(setCoaches).catch(() => {})
  }, [])

  const selectCoach = useCallback(async (coachId: string, phoneSuffix?: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await authApi.selectCoach(coachId, phoneSuffix)

      if (result.requiresPhoneVerification && !phoneSuffix) {
        setNeedsPhoneVerification(true)
        setPendingCoachId(coachId)
        return false
      }

      const newSession: AuthSession = {
        coachId: result.coach.id,
        name: result.coach.name,
        lastCarNumber: result.coach.lastCarNumber,
        authenticated: true,
      }
      saveSession(newSession)
      setSession(newSession)
      setNeedsPhoneVerification(false)
      setPendingCoachId(null)
      return true
    } catch (err) {
      const msg = err instanceof Error ? err.message : '코치 선택에 실패했습니다.'
      setError(msg)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
    setCoaches([])
    setNeedsPhoneVerification(false)
    setPendingCoachId(null)
    authApi.getCoaches().then(setCoaches).catch(() => {})
  }, [])

  return {
    session,
    coaches,
    isLoading,
    error,
    selectCoach,
    logout,
    needsPhoneVerification,
    pendingCoachId,
  }
}
