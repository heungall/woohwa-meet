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

function slotLabel(slot: TimeSlotData, selected: boolean) {
  if (selected) return '✓'
  if (slot.status === 'mine') return '내예약'
  if (slot.status === 'taken') return slot.reservation?.name ?? ''
  if (slot.status === 'blocked') return '불가'
  return ''
}

function slotClass(status: TimeSlotData['status'], selected: boolean) {
  const base = 'w-full h-10 rounded text-xs font-medium transition-all border-2 flex items-center justify-center'
  if (selected) return `${base} bg-woohwa-green border-woohwa-green-dark text-white`
  switch (status) {
    case 'available': return `${base} bg-white border-gray-200 hover:border-woohwa-green hover:bg-green-50 cursor-pointer`
    case 'mine':      return `${base} bg-woohwa-green/20 border-woohwa-green text-woohwa-green-dark cursor-pointer`
    case 'taken':     return `${base} bg-gray-100 border-gray-200 text-gray-500 cursor-default`
    case 'blocked':   return `${base} bg-gray-200 border-gray-300 text-gray-400 cursor-default`
  }
}

export function WeeklyCalendar({ slots, isLoading, weekStart, onWeekChange, onSlotClick, selectedSlots = [] }: WeeklyCalendarProps) {
  const weekDays = getWeekDays(weekStart)

  const getSlot = (date: string, time: string, room: 1 | 2 | 3): TimeSlotData =>
    slots.find(s => s.date === date && s.time === time && s.room === room) ??
    { date, time, room, status: 'available' }

  const isSelected = (date: string, time: string, room: 1 | 2 | 3) =>
    selectedSlots.some(s => s.date === date && s.time === time && s.room === room)

  return (
    <div>
      {/* 주차 선택기 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onWeekChange(subWeeks(weekStart, 1))}
          disabled={!canNavigateBack(weekStart)}
          className="px-4 py-2 rounded-xl border-2 border-gray-200 text-base font-medium min-h-[44px] disabled:opacity-30 disabled:cursor-not-allowed hover:border-woohwa-green transition-colors"
        >
          ◀ 이전
        </button>

        <div className="text-center">
          <p className="text-base font-semibold text-gray-900">{formatWeekRange(weekStart)}</p>
        </div>

        <button
          onClick={() => onWeekChange(addWeeks(weekStart, 1))}
          disabled={!canNavigateForward(weekStart)}
          className="px-4 py-2 rounded-xl border-2 border-gray-200 text-base font-medium min-h-[44px] disabled:opacity-30 disabled:cursor-not-allowed hover:border-woohwa-green transition-colors"
        >
          다음 ▶
        </button>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-3 mb-4 text-sm">
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
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: '640px' }}>
              <thead>
                {/* 1행: 날짜 */}
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="w-14 py-2 text-sm text-gray-400 font-medium border-r border-gray-200" rowSpan={2}>
                    시간
                  </th>
                  {weekDays.map(day => (
                    <th key={formatDate(day)} colSpan={3} className="py-2 text-sm font-bold text-gray-800 text-center border-r border-gray-200 last:border-r-0">
                      {formatDateLabel(day)}
                    </th>
                  ))}
                </tr>
                {/* 2행: 상담실 번호 */}
                <tr className="bg-gray-50 border-b-2 border-gray-300">
                  {weekDays.map(day =>
                    ROOMS.map((room, i) => (
                      <th key={`${formatDate(day)}-${room}`}
                        className={`py-1 text-xs font-bold text-woohwa-green-dark text-center ${i === 2 ? 'border-r border-gray-200 last:border-r-0' : ''}`}
                      >
                        {room}호
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((time, ti) => (
                  <tr key={time} className={ti % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="py-1 px-1 text-xs text-center text-gray-500 border-r border-gray-200 font-medium whitespace-nowrap">
                      {time}
                    </td>
                    {weekDays.map((day, di) =>
                      ROOMS.map((room, ri) => {
                        const dateStr = formatDate(day)
                        const slot = getSlot(dateStr, time, room)
                        const selected = isSelected(dateStr, time, room)
                        const isLastRoom = ri === 2
                        return (
                          <td key={`${dateStr}-${room}`}
                            className={`p-0.5 ${isLastRoom && di < 4 ? 'border-r border-gray-200' : ''}`}
                          >
                            <button
                              onClick={() => onSlotClick(slot)}
                              disabled={slot.status === 'blocked' || slot.status === 'taken'}
                              className={slotClass(slot.status, selected)}
                              title={slot.status === 'taken' ? `${slot.reservation?.name} 예약` : ''}
                            >
                              {slotLabel(slot, selected)}
                            </button>
                          </td>
                        )
                      })
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
