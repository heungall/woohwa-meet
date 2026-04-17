import { useState, useEffect, useCallback } from 'react'
import type { AuthSession, Coach } from '../types/coach'
import { getSession, saveSession, clearSession, isLockedOut, recordLoginFailure, resetLoginAttempts, getLockoutRemainingMinutes, getRemainingAttempts } from '../services/auth'
import { authApi } from '../services/api'

interface UseAuthReturn {
  session: AuthSession | null
  coaches: Coach[]
  passwordVerified: boolean
  isLoading: boolean
  error: string | null
  isLocked: boolean
  lockoutMinutes: number
  remainingAttempts: number
  verifyPassword: (password: string) => Promise<boolean>
  selectCoach: (coachId: string, phoneSuffix?: string) => Promise<boolean>
  logout: () => void
  needsPhoneVerification: boolean
  pendingCoachId: string | null
}

export function useAuth(): UseAuthReturn {
  const [session, setSession] = useState<AuthSession | null>(getSession)
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [passwordVerified, setPasswordVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(isLockedOut)
  const [lockoutMinutes, setLockoutMinutes] = useState(getLockoutRemainingMinutes)
  const [remainingAttempts, setRemainingAttempts] = useState(getRemainingAttempts)
  const [needsPhoneVerification, setNeedsPhoneVerification] = useState(false)
  const [pendingCoachId, setPendingCoachId] = useState<string | null>(null)

  useEffect(() => {
    if (!isLocked) return
    const interval = setInterval(() => {
      if (!isLockedOut()) {
        setIsLocked(false)
        setLockoutMinutes(0)
        setRemainingAttempts(getRemainingAttempts())
        clearInterval(interval)
      } else {
        setLockoutMinutes(getLockoutRemainingMinutes())
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [isLocked])

  const verifyPassword = useCallback(async (password: string): Promise<boolean> => {
    if (isLockedOut()) {
      setIsLocked(true)
      setLockoutMinutes(getLockoutRemainingMinutes())
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await authApi.verifyPassword(password)
      if (!result.verified) {
        recordLoginFailure()
        const remaining = getRemainingAttempts()
        setRemainingAttempts(remaining)
        if (isLockedOut()) {
          setIsLocked(true)
          setLockoutMinutes(getLockoutRemainingMinutes())
          setError(`비밀번호 5회 실패로 ${getLockoutRemainingMinutes()}분간 입력이 제한됩니다.`)
        } else {
          setError(`비밀번호가 올바르지 않습니다. (${remaining}회 남음)`)
        }
        return false
      }

      // 비밀번호 확인 즉시 코치 목록도 로드
      resetLoginAttempts()
      const coachList = await authApi.getCoaches()
      setCoaches(coachList)
      setPasswordVerified(true)
      return true
    } catch (err) {
      const msg = err instanceof Error ? err.message : '요청을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.'
      setError(msg)
      return false
    } finally {
      setIsLoading(false)
    }
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
    setPasswordVerified(false)
    setCoaches([])
    setNeedsPhoneVerification(false)
    setPendingCoachId(null)
  }, [])

  return {
    session,
    coaches,
    passwordVerified,
    isLoading,
    error,
    isLocked,
    lockoutMinutes,
    remainingAttempts,
    verifyPassword,
    selectCoach,
    logout,
    needsPhoneVerification,
    pendingCoachId,
  }
}
