export const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00',
] as const

export const ROOMS = [1, 2, 3] as const

export const DAYS_OF_WEEK = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const

export const DAY_LABELS: Record<string, string> = {
  MON: '월',
  TUE: '화',
  WED: '수',
  THU: '목',
  FRI: '금',
  SAT: '토',
  SUN: '일',
}

export const MAX_FUTURE_WEEKS = 4
export const CANCEL_DEADLINE_HOURS = 1
export const MAX_LOGIN_ATTEMPTS = 5
export const LOCKOUT_MINUTES = 10

export const SESSION_KEY = 'woohwa_session'
export const LOGIN_ATTEMPTS_KEY = 'woohwa_login_attempts'
export const LOCKOUT_KEY = 'woohwa_lockout_until'
