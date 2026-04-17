import { useState } from 'react'
import { LoadingSpinner } from '../common/LoadingSpinner'

interface PasswordFormProps {
  onSubmit: (password: string) => Promise<boolean>
  isLoading: boolean
  error: string | null
  isLocked: boolean
  lockoutMinutes: number
  remainingAttempts: number
}

export function PasswordForm({ onSubmit, isLoading, error, isLocked, lockoutMinutes, remainingAttempts }: PasswordFormProps) {
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim() || isLocked) return
    await onSubmit(password)
  }

  return (
    <div className="min-h-screen bg-woohwa-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🦋</div>
          <h1 className="text-2xl font-bold text-gray-900">WOOHWA</h1>
          <p className="text-base text-gray-500 mt-1">상담실 예약 시스템</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-base font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              id="password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              disabled={isLocked || isLoading}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-woohwa-green disabled:bg-gray-50 disabled:text-gray-400"
              autoComplete="off"
            />
            <p className="text-sm text-gray-400 mt-1">입력하신 내용이 그대로 표시됩니다</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-base">
              {error}
            </div>
          )}

          {isLocked && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-orange-700 text-base">
              {lockoutMinutes}분 후 다시 시도해주세요.
            </div>
          )}

          {!isLocked && remainingAttempts < 5 && remainingAttempts > 0 && (
            <p className="text-sm text-orange-500 text-center">
              남은 시도 횟수: {remainingAttempts}회
            </p>
          )}

          <button
            type="submit"
            disabled={isLocked || isLoading || !password.trim()}
            className="w-full bg-woohwa-green text-white rounded-xl py-4 text-lg font-bold min-h-touch disabled:opacity-50 disabled:cursor-not-allowed hover:bg-woohwa-green-dark transition-colors"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : '입장하기'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <a
            href="/admin"
            className="text-sm text-gray-400 hover:text-gray-600 underline"
          >
            관리자 로그인
          </a>
        </div>
      </div>
    </div>
  )
}
