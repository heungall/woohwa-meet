export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface LoginRequest {
  password: string
}

export interface LoginResponse {
  verified: boolean
}

export interface CoachSelectRequest {
  coachId: string
  phoneSuffix?: string
}

export interface CoachSelectResponse {
  coach: {
    id: string
    name: string
    lastCarNumber?: string
  }
  requiresPhoneVerification: boolean
}

export interface CreateReservationRequest {
  date: string
  time: string
  room: 1 | 2 | 3
  coachId: string
  carNumber?: string
}

export interface AdminLoginResponse {
  token: string
  email: string
}
