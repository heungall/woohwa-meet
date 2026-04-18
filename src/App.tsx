import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useAdminAuth } from './hooks/useAdminAuth'
import { useReservations } from './hooks/useReservations'
import { CoachSelector } from './components/auth/CoachSelector'
import { Layout } from './components/common/Layout'
import { WeeklyCalendar } from './components/reservation/WeeklyCalendar'
import { ReservationModal, CancelModal } from './components/reservation/ReservationModal'
import { GuideTab } from './components/guide/GuideTab'
import { AdminAuth } from './components/admin/AdminAuth'
import { Dashboard } from './components/admin/Dashboard'
import { Toast } from './components/common/Toast'
import type { TimeSlotData } from './types/reservation'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<UserApp />} />
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
  )
}

type MainTab = 'reservation' | 'guide'

function UserApp() {
  const { session, coaches, isLoading, error, selectCoach, logout, needsPhoneVerification, pendingCoachId } = useAuth()
  const [tab, setTab] = useState<MainTab>('reservation')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [selectedSlots, setSelectedSlots] = useState<Array<{ date: string; time: string; room: 1 | 2 | 3 }>>([])
  const [activeModal, setActiveModal] = useState<'reservation' | 'cancel' | null>(null)
  const [cancelSlot, setCancelSlot] = useState<TimeSlotData | null>(null)
  const [modalLoading, setModalLoading] = useState(false)

  const { slots, isLoading: slotsLoading, weekStart, setWeekStart, createReservation, cancelReservation } = useReservations(session?.coachId ?? '')

  if (!session?.authenticated) {
    return (
      <CoachSelector
        coaches={coaches}
        onSelect={selectCoach}
        isLoading={isLoading}
        error={error}
        needsPhoneVerification={needsPhoneVerification}
        pendingCoachId={pendingCoachId}
      />
    )
  }

  const handleSlotClick = (slot: TimeSlotData) => {
    if (slot.status === 'mine') {
      setCancelSlot(slot)
      setActiveModal('cancel')
      return
    }
    if (slot.status !== 'available') return

    const key = `${slot.date}_${slot.time}_${slot.room}`
    const isSelected = selectedSlots.some((s) => `${s.date}_${s.time}_${s.room}` === key)

    if (isSelected) {
      setSelectedSlots((prev) => prev.filter((s) => `${s.date}_${s.time}_${s.room}` !== key))
    } else {
      setSelectedSlots((prev) => [...prev, { date: slot.date, time: slot.time, room: slot.room }])
      if (selectedSlots.length === 0) {
        // first slot selected — show modal
        setTimeout(() => setActiveModal('reservation'), 0)
      }
    }
  }

  const handleReserveConfirm = async (carNumber?: string) => {
    setModalLoading(true)
    const ok = await createReservation(selectedSlots, carNumber)
    setModalLoading(false)
    if (ok) {
      setActiveModal(null)
      setSelectedSlots([])
      setToast({ message: '예약이 완료되었습니다 🦋', type: 'success' })
    } else {
      setToast({ message: '예약에 실패했습니다. 다시 시도해주세요.', type: 'error' })
    }
  }

  const handleCancelConfirm = async (reservationId: string) => {
    setModalLoading(true)
    const ok = await cancelReservation(reservationId)
    setModalLoading(false)
    if (ok) {
      setActiveModal(null)
      setCancelSlot(null)
      setToast({ message: '예약이 취소되었습니다.', type: 'success' })
    } else {
      setToast({ message: '취소에 실패했습니다.', type: 'error' })
    }
  }

  return (
    <Layout coachName={session.name} onLogout={logout}>
      {/* 탭 */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl border border-gray-200 p-1">
        {([['reservation', '📅 예약하기'], ['guide', '🗺️ 길안내']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-3 rounded-lg text-base font-medium min-h-touch transition-colors ${
              tab === key ? 'bg-woohwa-green text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'reservation' && (
        <>
          {selectedSlots.length > 0 && (
            <div className="mb-4 bg-woohwa-green/10 border-2 border-woohwa-green rounded-xl p-4 flex items-center justify-between">
              <span className="text-base font-medium text-woohwa-green-dark">
                {selectedSlots.length}개 슬롯 선택됨
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedSlots([])}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg text-base"
                >
                  초기화
                </button>
                <button
                  onClick={() => setActiveModal('reservation')}
                  className="px-4 py-2 bg-woohwa-green text-white rounded-lg text-base font-medium"
                >
                  예약하기
                </button>
              </div>
            </div>
          )}

          <WeeklyCalendar
            slots={slots}
            isLoading={slotsLoading}
            weekStart={weekStart}
            onWeekChange={setWeekStart}
            onSlotClick={handleSlotClick}
            selectedSlots={selectedSlots}
          />
        </>
      )}

      {tab === 'guide' && <GuideTab />}

      {activeModal === 'reservation' && selectedSlots.length > 0 && (
        <ReservationModal
          coachName={session.name}
          selectedSlots={selectedSlots}
          lastCarNumber={session.lastCarNumber}
          onConfirm={handleReserveConfirm}
          onCancel={() => { setActiveModal(null); setSelectedSlots([]) }}
          isLoading={modalLoading}
        />
      )}

      {activeModal === 'cancel' && cancelSlot && (
        <CancelModal
          slot={cancelSlot}
          onConfirm={handleCancelConfirm}
          onClose={() => { setActiveModal(null); setCancelSlot(null) }}
          isLoading={modalLoading}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Layout>
  )
}

function AdminApp() {
  const { adminSession, isVerifying, error, handleGoogleCallback, logout } = useAdminAuth()
  const location = useLocation()

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1))
    const token = hash.get('access_token')
    if (!token || adminSession || isVerifying) return

    fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`)
      .then(r => r.json())
      .then((info: { email?: string }) => {
        if (info.email) {
          handleGoogleCallback(token, info.email)
          window.history.replaceState({}, '', '/admin')
        }
      })
      .catch(() => {})
  }, [location.hash])

  if (!adminSession) {
    return (
      <AdminAuth
        onLogin={handleGoogleCallback}
        isVerifying={isVerifying}
        error={error}
      />
    )
  }

  return <Dashboard token={adminSession.token} onLogout={logout} />
}
