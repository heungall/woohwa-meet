import { addWeeks, subWeeks } from 'date-fns'
import type { TimeSlotData } from '../../types/reservation'
import { TIME_SLOTS, ROOMS } from '../../utils/constants'
import { formatDate, formatDateLabel, formatWeekRange, getWeekDays, canNavigateBack, canNavigateForward } from '../../utils/date'
import { LoadingSpinner } from '../common/LoadingSpinner'

interface WeeklyCalendarProps {
  slots: TimeSlotData[]
  isLoading: boolean
  weekStart: Date
  onWeekChange: (date: Date) => void
  onSlotClick: (slot: TimeSlotData) => void
  selectedSlots?: Array<{ date: string; time: string; room: 1 | 2 | 3 }>
}

const STATUS_BASE = 'w-full min-h-[44px] rounded-lg border-2 text-xs font-medium transition-all flex items-center justify-center'

function slotStyle(status: TimeSlotData['status'], selected: boolean): string {
  if (selected) return `${STATUS_BASE} bg-woohwa-green border-woohwa-green-dark text-white`
  switch (status) {
    case 'available': return `${STATUS_BASE} bg-white border-gray-200 hover:border-woohwa-green hover:bg-green-50 cursor-pointer`
    case 'mine':      return `${STATUS_BASE} bg-woohwa-green/20 border-woohwa-green cursor-pointer`
    case 'taken':     return `${STATUS_BASE} bg-gray-100 border-gray-200 cursor-default`
    case 'blocked':   return `${STATUS_BASE} bg-gray-200 border-gray-300 cursor-default`
  }
}

export function WeeklyCalendar({ slots, isLoading, weekStart, onWeekChange, onSlotClick, selectedSlots = [] }: WeeklyCalendarProps) {
  const weekDays = getWeekDays(weekStart)

  const getSlot = (date: string, time: string, room: 1 | 2 | 3): TimeSlotData =>
    slots.find((s) => s.date === date && s.time === time && s.room === room) ?? {
      date, time, room, status: 'available',
    }

  const isSelected = (date: string, time: string, room: 1 | 2 | 3): boolean =>
    selectedSlots.some((s) => s.date === date && s.time === time && s.room === room)

  return (
    <div>
      {/* 주차 선택기 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onWeekChange(subWeeks(weekStart, 1))}
          disabled={!canNavigateBack(weekStart)}
          className="flex items-center gap-1 px-4 py-2 rounded-xl border-2 border-gray-200 text-base font-medium min-h-[44px] disabled:opacity-30 disabled:cursor-not-allowed hover:border-woohwa-green transition-colors"
        >
          ◀ 이전 주
        </button>

        <div className="text-center">
          <p className="text-base font-semibold text-gray-900">{formatWeekRange(weekStart)}</p>
          <p className="text-sm text-woohwa-green font-medium">월~금</p>
        </div>

        <button
          onClick={() => onWeekChange(addWeeks(weekStart, 1))}
          disabled={!canNavigateForward(weekStart)}
          className="flex items-center gap-1 px-4 py-2 rounded-xl border-2 border-gray-200 text-base font-medium min-h-[44px] disabled:opacity-30 disabled:cursor-not-allowed hover:border-woohwa-green transition-colors"
        >
          다음 주 ▶
        </button>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-3 mb-5 text-sm">
        {[
          { color: 'bg-white border border-gray-300', label: '예약 가능' },
          { color: 'bg-woohwa-green/20 border border-woohwa-green', label: '내 예약' },
          { color: 'bg-gray-100 border border-gray-200', label: '예약됨' },
          { color: 'bg-gray-200 border border-gray-300', label: '이용 불가' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded ${color}`} />
            <span className="text-gray-600">{label}</span>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="py-12"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="space-y-4">
          {weekDays.map((day) => {
            const dateStr = formatDate(day)
            return (
              <div key={dateStr} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                {/* 날짜 헤더 */}
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
                  <span className="text-base font-bold text-gray-800">{formatDateLabel(day)}</span>
                </div>

                {/* 상담실 테이블 */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[320px]">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="w-16 py-2 text-sm font-medium text-gray-500 text-center border-r border-gray-100">
                          시간
                        </th>
                        {ROOMS.map((room) => (
                          <th key={room} className="py-2 text-sm font-bold text-woohwa-green-dark text-center">
                            상담실 {room}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {TIME_SLOTS.map((time) => (
                        <tr key={time} className="border-b border-gray-50">
                          <td className="py-1 px-2 text-sm text-center text-gray-500 border-r border-gray-100 font-medium">
                            {time}
                          </td>
                          {ROOMS.map((room) => {
                            const slot = getSlot(dateStr, time, room)
                            const selected = isSelected(dateStr, time, room)
                            return (
                              <td key={room} className="p-1">
                                <button
                                  onClick={() => onSlotClick(slot)}
                                  disabled={slot.status === 'blocked' || slot.status === 'taken'}
                                  className={slotStyle(slot.status, selected)}
                                >
                                  {slot.status === 'mine' && <span className="text-woohwa-green-dark text-xs">내 예약</span>}
                                  {slot.status === 'taken' && <span className="text-gray-500 text-xs">{slot.reservation?.name}</span>}
                                  {slot.status === 'blocked' && <span className="text-gray-400 text-xs">불가</span>}
                                  {slot.status === 'available' && selected && <span>✓</span>}
                                </button>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
