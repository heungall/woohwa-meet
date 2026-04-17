export interface Coach {
  id: string
  name: string
  phone: string
  lastCarNumber?: string
  active: boolean
}

export interface AuthSession {
  coachId: string
  name: string
  lastCarNumber?: string
  authenticated: boolean
}
