import { format, startOfWeek, addWeeks, addDays, isBefore, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'

export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 })
}

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 5 }, (_, i) => addDays(weekStart, i))
}

export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function formatDateLabel(date: Date): string {
  return format(date, 'M/d (E)', { locale: ko })
}

export function formatWeekRange(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 4)
  return `${format(weekStart, 'M월 d일')} ~ ${format(weekEnd, 'M월 d일')}`
}

export function isCurrentWeek(weekStart: Date): boolean {
  const thisWeekStart = getWeekStart(new Date())
  return formatDate(weekStart) === formatDate(thisWeekStart)
}

export function canNavigateBack(weekStart: Date): boolean {
  const thisWeekStart = getWeekStart(new Date())
  return !isBefore(weekStart, addWeeks(thisWeekStart, 1))
}

export function canNavigateForward(weekStart: Date): boolean {
  const thisWeekStart = getWeekStart(new Date())
  const maxWeekStart = addWeeks(thisWeekStart, 4)
  return isBefore(weekStart, maxWeekStart)
}

export function isCancelable(date: string, time: string): boolean {
  const reservationStart = parseISO(`${date}T${time}:00`)
  const deadline = new Date(reservationStart.getTime() - 60 * 60 * 1000)
  return isBefore(new Date(), deadline)
}

export function getDayOfWeek(date: Date): 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  return days[date.getDay()] as 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI'
}
