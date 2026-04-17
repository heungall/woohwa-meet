interface HeaderProps {
  coachName?: string
  onLogout?: () => void
}

export function Header({ coachName, onLogout }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-2 overflow-hidden">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-full bg-woohwa-green flex items-center justify-center">
            <span className="text-white text-lg">🦋</span>
          </div>
          <span className="font-bold text-xl text-gray-900 whitespace-nowrap">WOOHWA</span>
          <span className="text-gray-500 text-sm whitespace-nowrap">상담실 예약</span>
        </div>

        {coachName && onLogout && (
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm text-gray-600 truncate min-w-0">
              <span className="font-medium text-gray-900">{coachName}</span> 코치님
            </span>
            <button
              onClick={onLogout}
              className="text-sm text-gray-500 hover:text-gray-700 underline min-h-touch px-2 flex items-center shrink-0"
            >
              로그아웃
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
