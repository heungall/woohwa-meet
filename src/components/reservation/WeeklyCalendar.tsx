import { useState } from 'react'
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

const STATUS_STYLES: Record<TimeSlotData['status'], string> = {
  available: 'bg-white border-gray-200 hover:border-woohwa-green hover:bg-green-50 cursor-pointer',
  mine: 'bg-woohwa-green/20 border-woohwa-green cursor-pointer',
  taken: 'bg-gray-100 border-gray-200 cursor-default',
  blocked: 'bg-gray-200 border-gray-300 cursor-default',
}

export function WeeklyCalendar({ slots, isLoading, weekStart, onWeekChange, onSlotClick, selectedSlots = [] }: WeeklyCalendarProps) {
  const [mobileRoom, setMobileRoom] = useState<1 | 2 | 3>(1)
  const weekDays = getWeekDays(weekStart)

  const getSlot = (date: string, time: string, room: 1 | 2 | 3): TimeSlotData | undefined =>
    slots.find((s) => s.date === date && s.time === time && s.room === room)

  const isSelected = (date: string, time: string, room: 1 | 2 | 3): boolean =>
    selectedSlots.some((s) => s.date === date && s.time === time && s.room === room)

  return (
    <div>
      {/* 주차 선택기 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onWeekChange(subWeeks(weekStart, 1))}
          disabled={!canNavigateBack(weekStart)}
          className="flex items-center gap-1 px-4 py-2 rounded-xl border-2 border-gray-200 text-base font-medium min-h-touch disabled:opacity-30 disabled:cursor-not-allowed hover:border-woohwa-green transition-colors"
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
          className="flex items-center gap-1 px-4 py-2 rounded-xl border-2 border-gray-200 text-base font-medium min-h-touch disabled:opacity-30 disabled:cursor-not-allowed hover:border-woohwa-green transition-colors"
        >
          다음 주 ▶
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

      {isLoading && (
        <div className="py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {!isLoading && (
        <>
          {/* 모바일: 탭으로 상담실 전환 */}
          <div className="sm:hidden mb-3">
            <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden">
              {ROOMS.map((room) => (
                <button
                  key={room}
                  onClick={() => setMobileRoom(room)}
                  className={`flex-1 py-3 text-base font-medium min-h-touch transition-colors ${
                    mobileRoom === room
                      ? 'bg-woohwa-green text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  상담실 {room}
                </button>
              ))}
            </div>
          </div>

          {/* PC: 상담실별 3컬럼 / 모바일: 1 상담실 */}
          <div className="hidden sm:grid sm:grid-cols-3 gap-3">
            {ROOMS.map((room) => (
              <RoomColumn
                key={room}
                room={room}
                weekDays={weekDays}
                getSlot={getSlot}
                isSelected={isSelected}
                onSlotClick={onSlotClick}
              />
            ))}
          </div>

          <div className="sm:hidden">
            <RoomColumn
              room={mobileRoom}
              weekDays={weekDays}
              getSlot={getSlot}
              isSelected={isSelected}
              onSlotClick={onSlotClick}
            />
          </div>
        </>
      )}
    </div>
  )
}

interface RoomColumnProps {
  room: 1 | 2 | 3
  weekDays: Date[]
  getSlot: (date: string, time: string, room: 1 | 2 | 3) => TimeSlotData | undefined
  isSelected: (date: string, time: string, room: 1 | 2 | 3) => boolean
  onSlotClick: (slot: TimeSlotData) => void
}

function RoomColumn({ room, weekDays, getSlot, isSelected, onSlotClick }: RoomColumnProps) {
  return (
    <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-woohwa-green text-white text-center py-2 font-bold text-base">
        상담실 {room}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[280px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="w-14 py-2 text-sm font-medium text-gray-500 border-b border-r border-gray-200">
                시간
              </th>
              {weekDays.map((day) => (
                <th key={formatDate(day)} className="py-2 text-sm font-medium text-gray-700 border-b border-gray-200 text-center">
                  {formatDateLabel(day)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((time) => (
              <tr key={time} className="border-b border-gray-100">
                <td className="py-2 text-sm text-center text-gray-500 border-r border-gray-200 font-medium">
                  {time}
                </td>
                {weekDays.map((day) => {
                  const dateStr = formatDate(day)
                  const slot = getSlot(dateStr, time, room) ?? {
                    date: dateStr,
                    time,
                    room,
                    status: 'available' as const,
                  }
                  const selected = isSelected(dateStr, time, room)

                  return (
                    <td key={dateStr} className="p-1 text-center">
                      <button
                        onClick={() => onSlotClick(slot)}
                        disabled={slot.status === 'blocked' || slot.status === 'taken'}
                        className={`w-full min-h-[44px] rounded-lg border-2 text-xs font-medium transition-all ${
                          selected
                            ? 'bg-woohwa-green border-woohwa-green-dark text-white'
                            : STATUS_STYLES[slot.status]
                        }`}
                      >
                        {slot.status === 'mine' && <span className="text-woohwa-green-dark">내 예약</span>}
                        {slot.status === 'taken' && <span className="text-gray-500">{slot.reservation?.name}</span>}
                        {slot.status === 'blocked' && <span className="text-gray-400">이용불가</span>}
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
}
