import { useState } from 'react'
import type { Coach } from '../../types/coach'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { Footer } from '../common/Footer'

interface CoachSelectorProps {
  coaches: Coach[]
  onSelect: (coachId: string, phoneSuffix?: string) => Promise<boolean>
  isLoading: boolean
  error: string | null
  needsPhoneVerification: boolean
  pendingCoachId: string | null
}


export function CoachSelector({
  coaches,
  onSelect,
  isLoading,
  error,
  needsPhoneVerification,
  pendingCoachId,
}: CoachSelectorProps) {
  const [selectedId, setSelectedId] = useState('')
  const [phoneSuffix, setPhoneSuffix] = useState('')

  const activeCoaches = coaches.filter((c) => c.active)

  const handleSelect = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId) return
    if (needsPhoneVerification && pendingCoachId) {
      if (phoneSuffix.length !== 4) return
      await onSelect(pendingCoachId, phoneSuffix)
    } else {
      await onSelect(selectedId)
    }
  }

  if (needsPhoneVerification) {
    const coach = coaches.find((c) => c.id === pendingCoachId)
    return (
      <div className="min-h-screen bg-woohwa-cream flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900">본인 확인</h2>
            <p className="text-lg text-gray-500 mt-2">
              <strong>{coach?.name}</strong> 코치님이 여러 분이에요
            </p>
          </div>

          <form onSubmit={handleSelect} className="space-y-5">
            <div>
              <label htmlFor="phoneSuffix" className="block text-lg font-medium text-gray-700 mb-2">
                연락처 뒷자리 4자리
              </label>
              <input
                id="phoneSuffix"
                type="tel"
                value={phoneSuffix}
                onChange={(e) => setPhoneSuffix(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="0000"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-2xl text-center tracking-widest focus:outline-none focus:border-woohwa-green"
                maxLength={4}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || phoneSuffix.length !== 4}
              className="w-full bg-woohwa-green text-white rounded-xl py-5 text-xl font-bold disabled:opacity-50 hover:bg-woohwa-green-dark transition-colors"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : '확인'}
            </button>
          </form>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-woohwa-cream flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="WOOHWA" className="mx-auto mb-2 w-full" />
          <p className="text-lg text-gray-500">본인 이름을 눌러주세요</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSelect} className="space-y-5">
          <div>
            <label htmlFor="coach" className="block text-lg font-medium text-gray-700 mb-2">
              이름
            </label>
            <div className="relative">
              <select
                id="coach"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-xl focus:outline-none focus:border-woohwa-green appearance-none bg-white pr-12"
              >
                <option value="">선택해주세요</option>
                {activeCoaches.map((coach) => (
                  <option key={coach.id} value={coach.id}>
                    {coach.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !selectedId}
            className="w-full bg-woohwa-green text-white rounded-xl py-5 text-xl font-bold disabled:opacity-50 hover:bg-woohwa-green-dark transition-colors"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : '입장하기'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/admin"
            className="text-base text-gray-400 hover:text-gray-600 transition-colors"
          >
            관리자 로그인
          </a>
        </div>
      </div>
      <Footer />
    </div>
  )
}
