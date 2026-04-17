import { SESSION_KEY, LOGIN_ATTEMPTS_KEY, LOCKOUT_KEY, MAX_LOGIN_ATTEMPTS, LOCKOUT_MINUTES } from '../utils/constants'
import type { AuthSession } from '../types/coach'

export function getSession(): AuthSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

export function saveSession(session: AuthSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

export function isLockedOut(): boolean {
  const lockoutUntil = localStorage.getItem(LOCKOUT_KEY)
  if (!lockoutUntil) return false
  if (Date.now() < parseInt(lockoutUntil)) return true
  localStorage.removeItem(LOCKOUT_KEY)
  localStorage.removeItem(LOGIN_ATTEMPTS_KEY)
  return false
}

export function getLockoutRemainingMinutes(): number {
  const lockoutUntil = localStorage.getItem(LOCKOUT_KEY)
  if (!lockoutUntil) return 0
  return Math.ceil((parseInt(lockoutUntil) - Date.now()) / 60000)
}

export function recordLoginFailure(): void {
  const attempts = parseInt(localStorage.getItem(LOGIN_ATTEMPTS_KEY) ?? '0') + 1
  localStorage.setItem(LOGIN_ATTEMPTS_KEY, String(attempts))

  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    const lockoutUntil = Date.now() + LOCKOUT_MINUTES * 60 * 1000
    localStorage.setItem(LOCKOUT_KEY, String(lockoutUntil))
    localStorage.removeItem(LOGIN_ATTEMPTS_KEY)
  }
}

export function resetLoginAttempts(): void {
  localStorage.removeItem(LOGIN_ATTEMPTS_KEY)
  localStorage.removeItem(LOCKOUT_KEY)
}

export function getRemainingAttempts(): number {
  const attempts = parseInt(localStorage.getItem(LOGIN_ATTEMPTS_KEY) ?? '0')
  return Math.max(0, MAX_LOGIN_ATTEMPTS - attempts)
}
