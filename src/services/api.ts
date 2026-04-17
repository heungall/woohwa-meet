import type { ApiResponse } from '../types/api'
import type { Reservation, BlockedSlot } from '../types/reservation'
import type { Coach } from '../types/coach'

async function request<T>(action: string, params: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch('/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...params }),
  })

  if (!res.ok) {
    throw new Error('요청을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.')
  }

  const data: ApiResponse<T> = await res.json()

  if (!data.success) {
    throw new Error(data.error ?? '요청을 처리할 수 없습니다.')
  }

  return data.data as T
}

export const authApi = {
  verifyPassword: (password: string) =>
    request<{ verified: boolean }>('verifyPassword', { password }),

  getCoaches: () =>
    request<Coach[]>('getCoaches'),

  selectCoach: (coachId: string, phoneSuffix?: string) =>
    request<{ coach: Coach; requiresPhoneVerification: boolean }>('selectCoach', {
      coachId,
      phoneSuffix,
    }),
}

export const reservationApi = {
  getWeeklySlots: (weekStart: string, coachId: string) =>
    request<Reservation[]>('getWeeklyReservations', { weekStart, coachId }),

  createReservation: (
    coachId: string,
    slots: Array<{ date: string; time: string; room: 1 | 2 | 3 }>,
    carNumber?: string,
  ) =>
    request<Reservation[]>('createReservation', { coachId, slots, carNumber }),

  cancelReservation: (reservationId: string, coachId: string) =>
    request<void>('cancelReservation', { reservationId, coachId }),

  getBlockedSlots: (weekStart: string) =>
    request<BlockedSlot[]>('getBlockedSlots', { weekStart }),
}

export const adminApi = {
  verifyAdmin: (token: string) =>
    request<{ valid: boolean }>('verifyAdmin', { token }),

  getAllReservations: (token: string, from?: string, to?: string) =>
    request<Reservation[]>('adminGetReservations', { token, from, to }),

  cancelReservation: (token: string, reservationId: string) =>
    request<void>('adminCancelReservation', { token, reservationId }),

  getCoaches: (token: string) =>
    request<Coach[]>('adminGetCoaches', { token }),

  createCoach: (token: string, coach: Omit<Coach, 'id'>) =>
    request<Coach>('adminCreateCoach', { token, coach }),

  updateCoach: (token: string, coachId: string, updates: Partial<Coach>) =>
    request<Coach>('adminUpdateCoach', { token, coachId, updates }),

  getBlockedSlots: (token: string) =>
    request<BlockedSlot[]>('adminGetBlockedSlots', { token }),

  createBlockedSlot: (token: string, slot: Omit<BlockedSlot, 'id'>) =>
    request<BlockedSlot>('adminCreateBlockedSlot', { token, slot }),

  deleteBlockedSlot: (token: string, slotId: string) =>
    request<void>('adminDeleteBlockedSlot', { token, slotId }),

  getSettings: (token: string) =>
    request<Record<string, string>>('adminGetSettings', { token }),

  updatePassword: (token: string, newPassword: string) =>
    request<void>('adminUpdatePassword', { token, newPassword }),

  updateGuideContent: (token: string, content: string) =>
    request<void>('adminUpdateGuideContent', { token, content }),

  getGuideContent: () =>
    request<{ content: string }>('getGuideContent'),
}
