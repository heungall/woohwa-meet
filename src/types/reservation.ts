export interface Reservation {
  id: string
  date: string
  time: string
  room: 1 | 2 | 3
  coachId: string
  name: string
  phone?: string
  carNumber?: string
  createdAt: string
  status: 'active' | 'cancelled'
}

export interface BlockedSlot {
  id: string
  type: 'common' | 'weekly'
  weekStartDate?: string
  dayOfWeek: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'
  time: string
  room: 1 | 2 | 3 | 'all'
  reason?: string
}

export interface TimeSlotData {
  date: string
  time: string
  room: 1 | 2 | 3
  status: 'available' | 'mine' | 'taken' | 'blocked'
  reservation?: Pick<Reservation, 'id' | 'name' | 'coachId'>
}

export interface WeeklyCalendarData {
  weekStart: string
  slots: TimeSlotData[]
}
