import { useState, useCallback, useEffect } from 'react'
import type { Reservation, BlockedSlot, TimeSlotData } from '../types/reservation'
import { reservationApi } from '../services/api'
import { formatDate, getWeekStart } from '../utils/date'
import { TIME_SLOTS, ROOMS } from '../utils/constants'
import { addDays, addWeeks } from 'date-fns'

interface UseReservationsReturn {
  slots: TimeSlotData[]
  isLoading: boolean
  error: string | null
  weekStart: Date
  setWeekStart: (date: Date) => void
  createReservation: (
    selectedSlots: Array<{ date: string; time: string; room: 1 | 2 | 3 }>,
    carNumber?: string,
  ) => Promise<boolean>
  cancelReservation: (reservationId: string) => Promise<boolean>
  refresh: () => void
}

export function useReservations(coachId: string): UseReservationsReturn {
  const [weekStart, setWeekStartState] = useState<Date>(() => {
    const now = new Date()
    const base = getWeekStart(now)
    return now.getDay() === 1 ? addWeeks(base, 1) : base
  })
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const weekStartStr = formatDate(weekStart)
      const [res, blocked] = await Promise.all([
        reservationApi.getWeeklySlots(weekStartStr, coachId),
        reservationApi.getBlockedSlots(weekStartStr),
      ])
      setReservations(res)
      setBlockedSlots(blocked)
    } catch {
      setError('예약 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }, [weekStart, coachId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const slots: TimeSlotData[] = buildSlots(weekStart, reservations, blockedSlots, coachId)

  const setWeekStart = useCallback((date: Date) => {
    setWeekStartState(date)
  }, [])

  const createReservation = useCallback(
    async (
      selectedSlots: Array<{ date: string; time: string; room: 1 | 2 | 3 }>,
      carNumber?: string,
    ): Promise<boolean> => {
      try {
        await reservationApi.createReservation(coachId, selectedSlots, carNumber)
        await fetchData()
        return true
      } catch (err) {
        const msg = err instanceof Error ? err.message : '예약에 실패했습니다.'
        setError(msg)
        return false
      }
    },
    [coachId, fetchData],
  )

  const cancelReservation = useCallback(
    async (reservationId: string): Promise<boolean> => {
      try {
        await reservationApi.cancelReservation(reservationId, coachId)
        await fetchData()
        return true
      } catch (err) {
        const msg = err instanceof Error ? err.message : '취소에 실패했습니다.'
        setError(msg)
        return false
      }
    },
    [coachId, fetchData],
  )

  return { slots, isLoading, error, weekStart, setWeekStart, createReservation, cancelReservation, refresh: fetchData }
}

function buildSlots(
  weekStart: Date,
  reservations: Reservation[],
  blockedSlots: BlockedSlot[],
  coachId: string,
): TimeSlotData[] {
  const slots: TimeSlotData[] = []
  const resMap = new Map<string, Reservation>()
  const blockedSet = new Set<string>()

  reservations.forEach((r) => {
    if (r.status === 'active') {
      resMap.set(`${r.date}_${r.time}_${r.room}`, r)
    }
  })

  const dayMap: Record<string, string> = { 0: 'SUN', 1: 'MON', 2: 'TUE', 3: 'WED', 4: 'THU', 5: 'FRI', 6: 'SAT' }

  for (let d = 0; d < 7; d++) {
    const day = addDays(weekStart, d)
    const dateStr = formatDate(day)
    const dayOfWeek = dayMap[day.getDay()]

    blockedSlots.forEach((b) => {
      if (b.dayOfWeek !== dayOfWeek) return
      const isWeeklyMatch =
        b.type === 'common' ||
        (b.type === 'weekly' && b.weekStartDate === formatDate(weekStart))
      if (!isWeeklyMatch) return

      const bIdx = TIME_SLOTS.indexOf(b.time as typeof TIME_SLOTS[number])
      if (bIdx === -1) return
      const expandedTimes = [
        TIME_SLOTS[bIdx - 1],
        TIME_SLOTS[bIdx],
        TIME_SLOTS[bIdx + 1],
      ].filter(Boolean) as string[]

      expandedTimes.forEach((time) => {
        if (b.room === 'all') {
          ROOMS.forEach((room) => blockedSet.add(`${dateStr}_${time}_${room}`))
        } else {
          blockedSet.add(`${dateStr}_${time}_${b.room}`)
        }
      })
    })

    TIME_SLOTS.forEach((time) => {
      ROOMS.forEach((room) => {
        const key = `${dateStr}_${time}_${room}`
        const reservation = resMap.get(key)
        const isBlocked = blockedSet.has(key)

        let status: TimeSlotData['status'] = 'available'
        if (isBlocked) status = 'blocked'
        else if (reservation) {
          status = reservation.coachId === coachId ? 'mine' : 'taken'
        }

        slots.push({
          date: dateStr,
          time,
          room,
          status,
          reservation: reservation
            ? { id: reservation.id, name: reservation.name, coachId: reservation.coachId }
            : undefined,
        })
      })
    })
  }

  return slots
}
