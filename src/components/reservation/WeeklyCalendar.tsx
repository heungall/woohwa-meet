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

function slotClass(status: TimeSlotData['status'], selected: boolean, isPast: boolean) {
  const base = 'w-full h-12 rounded text-sm font-semibold transition-all border-2 flex items-center justify-center px-1'
  if (isPast && status !== 'mine') return `${base} bg-gray-100 border-gray-200 text-gray-300 cursor-default`
  if (selected) return `${base} bg-woohwa-green border-woohwa-green-dark text-white`
  switch (status) {
    case 'available': return `${base} bg-white border-gray-300 hover:border-woohwa-green hover:bg-green-50 cursor-pointer`
    case 'mine':      return `${base} bg-woohwa-green/30 border-woohwa-green text-woohwa-green-dark cursor-pointer`
    case 'taken':     return `${base} bg-gray-200 border-gray-300 text-gray-600 cursor-default`
    case 'blocked':   return `${base} bg-gray-300 border-gray-400 text-gray-500 cursor-default`
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
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => onWeekChange(subWeeks(weekStart, 1))}
          disabled={!canNavigateBack(weekStart)}
          className="px-5 py-3 rounded-xl border-2 border-gray-200 text-lg font-medium min-h-[52px] disabled:opacity-30 disabled:cursor-not-allowed hover:border-woohwa-green transition-colors"
        >
          ◀ 이전
        </button>

        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">{formatWeekRange(weekStart)}</p>
        </div>

        <button
          onClick={() => onWeekChange(addWeeks(weekStart, 1))}
          disabled={!canNavigateForward(weekStart)}
          className="px-5 py-3 rounded-xl border-2 border-gray-200 text-lg font-medium min-h-[52px] disabled:opacity-30 disabled:cursor-not-allowed hover:border-woohwa-green transition-colors"
        >
          다음 ▶
        </button>
      </div>

      {/* 범례 */}
      <div className="flex justify-between mb-5">
        {[
          { color: 'bg-white border-2 border-gray-300', label: '예약 가능' },
          { color: 'bg-woohwa-green/30 border-2 border-woohwa-green', label: '내 예약' },
          { color: 'bg-gray-200 border-2 border-gray-300', label: '예약됨' },
          { color: 'bg-gray-300 border-2 border-gray-400', label: '이용 불가' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded shrink-0 ${color}`} />
            <span className="text-sm text-gray-700 font-medium whitespace-nowrap">{label}</span>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="py-12"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: '920px' }}>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="w-16 py-3 text-sm text-gray-500 font-semibold border-r border-gray-200 sticky left-0 bg-gray-50 z-10" rowSpan={2}>
                    시간
                  </th>
                  {weekDays.map(day => (
                    <th key={formatDate(day)} colSpan={3} className="py-3 text-base font-bold text-gray-800 text-center border-r border-gray-200 last:border-r-0">
                      {formatDateLabel(day)}
                    </th>
                  ))}
                </tr>
                <tr className="bg-gray-50 border-b-2 border-gray-300">
                  {weekDays.map(day =>
                    ROOMS.map((room, i) => (
                      <th key={`${formatDate(day)}-${room}`}
                        className={`py-2 text-sm font-bold text-woohwa-green-dark text-center ${i === 2 ? 'border-r border-gray-200 last:border-r-0' : ''}`}
                        style={{ minWidth: '58px' }}
                      >
                        {room}호
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((time, ti) => (
                  <tr key={time} className={ti % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                    <td className={`py-1 px-1 text-sm text-center text-gray-700 border-r border-gray-200 font-semibold whitespace-nowrap sticky left-0 z-10 ${ti % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      {time}
                    </td>
                    {weekDays.map((day, di) =>
                      ROOMS.map((room, ri) => {
                        const dateStr = formatDate(day)
                        const slot = getSlot(dateStr, time, room)
                        const selected = isSelected(dateStr, time, room)
                        const isLastRoom = ri === 2
                        const isPast = new Date(`${dateStr}T${time}:00`) < new Date()
                        return (
                          <td key={`${dateStr}-${room}`}
                            className={`p-0.5 ${isLastRoom && di < 4 ? 'border-r border-gray-200' : ''}`}
                          >
                            <button
                              onClick={() => onSlotClick(slot)}
                              disabled={isPast || slot.status === 'blocked' || slot.status === 'taken'}
                              className={slotClass(slot.status, selected, isPast)}
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
