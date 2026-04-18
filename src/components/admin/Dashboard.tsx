import { useState, useEffect, useCallback } from 'react'
import type { Reservation } from '../../types/reservation'
import type { Coach } from '../../types/coach'
import { adminApi } from '../../services/api'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { Footer } from '../common/Footer'
import { format, startOfWeek, endOfWeek, addWeeks, isToday, parseISO } from 'date-fns'
import type { BlockedSlot } from '../../types/reservation'
import { TIME_SLOTS, DAYS_OF_WEEK, DAY_LABELS } from '../../utils/constants'

interface DashboardProps {
  token: string
  onLogout: () => void
}

type TabKey = 'reservations' | 'blocked' | 'coaches'

export function Dashboard({ token, onLogout }: DashboardProps) {
  const [tab, setTab] = useState<TabKey>('reservations')

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'reservations', label: '예약 현황' },
    { key: 'blocked', label: '불가시간' },
    { key: 'coaches', label: '코치 관리' },
  ]

  return (
    <div className="min-h-screen bg-woohwa-cream flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🦋</span>
          <span className="text-xl font-bold text-gray-900">WOOHWA 관리자</span>
        </div>
        <button onClick={onLogout} className="text-sm text-gray-500 hover:text-gray-700 underline min-h-touch px-2 flex items-center">
          로그아웃
        </button>
      </header>

      <div className="border-b border-gray-200 bg-white">
        <nav className="max-w-5xl mx-auto px-4 flex overflow-x-auto">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-5 py-4 text-base font-medium whitespace-nowrap border-b-2 transition-colors min-h-touch ${
                tab === key
                  ? 'border-woohwa-green text-woohwa-green-dark'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 flex-1 w-full">
        {tab === 'reservations' && <ReservationList token={token} />}
        {tab === 'blocked' && <BlockedSlotsManager token={token} />}
        {tab === 'coaches' && <CoachManager token={token} />}
      </div>
      <Footer />
    </div>
  )
}

function ReservationList({ token }: { token: string }) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterCoachId, setFilterCoachId] = useState('')
  const [coaches, setCoaches] = useState<Coach[]>([])

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const now = new Date()
      const from = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
      const to = format(endOfWeek(addWeeks(now, 1), { weekStartsOn: 1 }), 'yyyy-MM-dd')
      const [res, coachList] = await Promise.all([
        adminApi.getAllReservations(token, from, to),
        adminApi.getCoaches(token),
      ])
      setReservations(res)
      setCoaches(coachList)
    } catch {
      // silently fail
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => { load() }, [load])

  const filtered = filterCoachId
    ? reservations.filter((r) => r.coachId === filterCoachId)
    : reservations

  const active = filtered.filter((r) => r.status === 'active')
  const todayCount = active.filter((r) => isToday(parseISO(r.date))).length

  const [copied, setCopied] = useState(false)

  const exportCsv = () => {
    const rows = [
      ['날짜', '시간', '상담실', '이름', '연락처', '차량번호', '예약일시'].join(','),
      ...active.map((r) =>
        [r.date, r.time, r.room, r.name, r.phone ?? '', r.carNumber ?? '', r.createdAt].join(',')
      ),
    ]
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `예약현황_${format(new Date(), 'yyyyMMdd')}.csv`
    a.click()
  }

  const copyToClipboard = () => {
    const header = ['날짜', '시간', '상담실', '이름', '연락처', '차량번호'].join('\t')
    const rows = active.map((r) =>
      [r.date, r.time, `상담실 ${r.room}`, r.name, r.phone ?? '-', r.carNumber ?? '-'].join('\t')
    )
    navigator.clipboard.writeText([header, ...rows].join('\n')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (isLoading) return <LoadingSpinner size="lg" />

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">오늘 예약</p>
          <p className="text-3xl font-bold text-woohwa-green">{todayCount}건</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">이번주+다음주 예약</p>
          <p className="text-3xl font-bold text-woohwa-green">{active.length}건</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={filterCoachId}
          onChange={(e) => setFilterCoachId(e.target.value)}
          className="border-2 border-gray-200 rounded-xl px-3 py-2 text-base"
        >
          <option value="">전체 코치</option>
          {coaches.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          onClick={exportCsv}
          className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-base font-medium hover:bg-gray-50 min-h-touch"
        >
          CSV 내보내기
        </button>
        <button
          onClick={copyToClipboard}
          className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-base font-medium hover:bg-gray-50 min-h-touch"
        >
          {copied ? '복사됨 ✓' : '복사하기'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                {['날짜', '시간', '상담실', '이름', '연락처', '차량번호'].map((h) => (
                  <th key={h} className="px-4 py-3 text-sm font-medium text-gray-600 text-left border-b border-gray-200">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {active.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-base">예약이 없습니다</td></tr>
              )}
              {active.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-base">{r.date}</td>
                  <td className="px-4 py-3 text-base">{r.time}</td>
                  <td className="px-4 py-3 text-base">상담실 {r.room}</td>
                  <td className="px-4 py-3 text-base font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-base">{r.phone ?? '-'}</td>
                  <td className="px-4 py-3 text-base">{r.carNumber ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function BlockedSlotsManager({ token }: { token: string }) {
  const [slots, setSlots] = useState<BlockedSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    type: 'common' as 'common' | 'weekly',
    dayOfWeek: 'MON',
    time: '09:00',
    room: 'all',
    reason: '',
  })

  useEffect(() => {
    adminApi.getBlockedSlots(token).then(setSlots).finally(() => setIsLoading(false))
  }, [token])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const newSlot = await adminApi.createBlockedSlot(token, {
      type: form.type,
      dayOfWeek: form.dayOfWeek as BlockedSlot['dayOfWeek'],
      time: form.time,
      room: form.room as BlockedSlot['room'],
      reason: form.reason,
    })
    setSlots(prev => [...prev, newSlot])
    setShowForm(false)
    setForm({ type: 'common', dayOfWeek: 'MON', time: '09:00', room: 'all', reason: '' })
  }

  const handleDelete = async (id: string) => {
    await adminApi.deleteBlockedSlot(token, id)
    setSlots(prev => prev.filter(s => s.id !== id))
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">불가시간 관리</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-woohwa-green text-white rounded-xl text-base font-medium min-h-touch hover:bg-woohwa-green-dark"
        >
          + 불가시간 추가
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border-2 border-woohwa-green p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">유형</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as 'common' | 'weekly' }))}
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-base focus:border-woohwa-green outline-none">
                <option value="common">매주 반복</option>
                <option value="weekly">특정 주만</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">요일</label>
              <select value={form.dayOfWeek} onChange={e => setForm(f => ({ ...f, dayOfWeek: e.target.value }))}
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-base focus:border-woohwa-green outline-none">
                {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{DAY_LABELS[d]}요일</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시간</label>
              <select value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-base focus:border-woohwa-green outline-none">
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상담실</label>
              <select value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))}
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-base focus:border-woohwa-green outline-none">
                <option value="all">전체</option>
                <option value="1">1호</option>
                <option value="2">2호</option>
                <option value="3">3호</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">사유 (선택)</label>
            <input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              placeholder="예: 학교 행사, 정기 점검"
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-base focus:border-woohwa-green outline-none" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border-2 border-gray-200 rounded-lg text-base">취소</button>
            <button type="submit" className="px-4 py-2 bg-woohwa-green text-white rounded-lg text-base font-medium">저장</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {['유형', '요일', '시간', '상담실', '사유', ''].map(h => (
                <th key={h} className="px-4 py-3 text-sm font-medium text-gray-600 text-left border-b border-gray-200">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-base">등록된 불가시간이 없습니다</td></tr>
            )}
            {slots.map(s => (
              <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-base">{s.type === 'common' ? '매주 반복' : '특정 주'}</td>
                <td className="px-4 py-3 text-base">{DAY_LABELS[s.dayOfWeek]}요일</td>
                <td className="px-4 py-3 text-base">{s.time}</td>
                <td className="px-4 py-3 text-base">{s.room === 'all' ? '전체' : `${s.room}호`}</td>
                <td className="px-4 py-3 text-base text-gray-500">{s.reason || '-'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CoachManager({ token }: { token: string }) {
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')

  useEffect(() => {
    adminApi.getCoaches(token).then(setCoaches).finally(() => setIsLoading(false))
  }, [token])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newPhone) return
    const coach = await adminApi.createCoach(token, { name: newName, phone: newPhone, active: true })
    setCoaches((prev) => [...prev, coach])
    setNewName('')
    setNewPhone('')
    setShowForm(false)
  }

  const toggleActive = async (coach: Coach) => {
    await adminApi.updateCoach(token, coach.id, { active: !coach.active })
    setCoaches((prev) => prev.map((c) => (c.id === coach.id ? { ...c, active: !c.active } : c)))
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">코치 명단</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-woohwa-green text-white rounded-xl text-base font-medium min-h-touch hover:bg-woohwa-green-dark"
        >
          + 코치 추가
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border-2 border-woohwa-green p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-base focus:border-woohwa-green outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
              <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="010-0000-0000" className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-base focus:border-woohwa-green outline-none" required />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border-2 border-gray-200 rounded-lg text-base">취소</button>
            <button type="submit" className="px-4 py-2 bg-woohwa-green text-white rounded-lg text-base font-medium">저장</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {['이름', '차량번호', '상태'].map((h) => (
                <th key={h} className="px-4 py-3 text-sm font-medium text-gray-600 text-left border-b border-gray-200">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coaches.map((c) => (
              <tr key={c.id} className="border-b border-gray-100">
                <td className="px-4 py-3 text-base font-medium">{c.name}</td>
                <td className="px-4 py-3 text-base">{c.lastCarNumber ?? '-'}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(c)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {c.active ? '활성' : '비활성'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

