import { useState } from 'react'
import type { TimeSlotData } from '../../types/reservation'
import { validateCarNumber } from '../../utils/validation'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { isCancelable } from '../../utils/date'

interface ReservationModalProps {
  coachName: string
  selectedSlots: Array<{ date: string; time: string; room: 1 | 2 | 3 }>
  lastCarNumber?: string
  onConfirm: (carNumber?: string) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

export function ReservationModal({
  coachName,
  selectedSlots,
  lastCarNumber,
  onConfirm,
  onCancel,
  isLoading,
}: ReservationModalProps) {
  const [carNumber, setCarNumber] = useState(lastCarNumber ?? '')
  const [carError, setCarError] = useState('')

  const handleConfirm = async () => {
    if (carNumber && !validateCarNumber(carNumber)) {
      setCarError('차량번호 형식이 올바르지 않습니다. (예: 12가3456)')
      return
    }
    await onConfirm(carNumber || undefined)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">예약 확인</h3>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <span className="text-base text-gray-600 font-medium">예약자</span>
            <p className="text-lg font-semibold text-gray-900 mt-1">{coachName} 코치</p>
          </div>

          <div>
            <span className="text-base text-gray-500">예약 시간</span>
            <div className="mt-1 space-y-1">
              {selectedSlots.map((slot) => (
                <p key={`${slot.date}_${slot.time}_${slot.room}`} className="text-base font-medium text-gray-900">
                  상담실 {slot.room} · {slot.date} {slot.time}
                </p>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="carNumber" className="block text-base text-gray-600 font-medium mb-1">
              차량번호 <span className="text-base text-gray-500">(선택사항)</span>
            </label>
            <input
              id="carNumber"
              type="text"
              value={carNumber}
              onChange={(e) => {
                setCarNumber(e.target.value)
                setCarError('')
              }}
              placeholder="예: 12가3456"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-woohwa-green"
            />
            {carError && <p className="text-base text-red-600 mt-1">{carError}</p>}
            {lastCarNumber && (
              <p className="text-base text-gray-600 mt-1">이전 차량번호: {lastCarNumber}</p>
            )}
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="w-1/3 py-4 rounded-xl border-2 border-gray-200 text-lg font-medium text-gray-700 min-h-touch hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-2/3 py-4 rounded-xl bg-woohwa-green text-white text-lg font-bold min-h-touch hover:bg-woohwa-green-dark transition-colors disabled:opacity-50"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : '예약하기'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface CancelModalProps {
  slot: TimeSlotData
  onConfirm: (reservationId: string) => Promise<void>
  onClose: () => void
  isLoading: boolean
}

export function CancelModal({ slot, onConfirm, onClose, isLoading }: CancelModalProps) {
  const canCancel = isCancelable(slot.date, slot.time)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">내 예약</h3>
        </div>

        <div className="p-6 space-y-3">
          <p className="text-base text-gray-700">
            상담실 {slot.room} · {slot.date} {slot.time}
          </p>

          {!canCancel && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-orange-700 text-base">
              예약 시작 1시간 전까지만 취소할 수 있습니다.
            </div>
          )}
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-xl border-2 border-gray-200 text-lg font-medium text-gray-700 min-h-touch hover:bg-gray-50 transition-colors"
          >
            닫기
          </button>
          {canCancel && slot.reservation && (
            <button
              onClick={() => onConfirm(slot.reservation!.id)}
              disabled={isLoading}
              className="flex-1 py-4 rounded-xl bg-red-500 text-white text-lg font-bold min-h-touch hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : '예약 취소'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
