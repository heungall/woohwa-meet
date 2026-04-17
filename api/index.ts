import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
)

const SALT = process.env.PASSWORD_SALT ?? 'woohwa_salt_2026'

function hashPw(pw: string): string {
  return crypto.createHash('sha256').update(pw.toLowerCase().trim() + SALT).digest('hex')
}

function ok(res: VercelResponse, data: unknown) {
  return res.status(200).json({ success: true, data })
}

function fail(res: VercelResponse, msg: string) {
  return res.status(200).json({ success: false, error: msg })
}

async function verifyAdminToken(token: string): Promise<string | null> {
  try {
    const r = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`)
    const info = await r.json() as { error?: string; email?: string }
    console.log('[verifyAdmin] tokeninfo:', JSON.stringify(info))
    if (info.error || !info.email) return null
    const email = info.email.toLowerCase().trim()
    const { data, error } = await supabase.from('admin_list').select('email').ilike('email', email).single()
    console.log('[verifyAdmin] db result:', JSON.stringify({ data, error }))
    return data?.email ?? null
  } catch (e) {
    console.error('[verifyAdmin] error:', e)
    return null
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return fail(res, '허용되지 않는 요청입니다.')

  const { action, ...p } = (req.body ?? {}) as Record<string, unknown>

  try {
    switch (String(action)) {

      // ── 인증 ──────────────────────────────────────────────────────
      case 'verifyPassword': {
        const { data } = await supabase.from('settings').select('value').eq('key', 'userPasswordHash').single()
        if (!data?.value) return ok(res, { verified: false })
        return ok(res, { verified: hashPw(String(p.password ?? '')) === data.value })
      }

      case 'getCoaches': {
        const { data } = await supabase.from('coaches').select('id, name, active').eq('active', true).order('name')
        return ok(res, data ?? [])
      }

      case 'selectCoach': {
        const coachId = String(p.coachId ?? '')
        const { data: coach } = await supabase.from('coaches').select('*').eq('id', coachId).eq('active', true).single()
        if (!coach) return fail(res, '코치를 찾을 수 없습니다.')

        const { data: sameNames } = await supabase.from('coaches').select('id').eq('name', coach.name).eq('active', true)
        if (sameNames && sameNames.length > 1) {
          if (!p.phoneSuffix) {
            return ok(res, { coach: { id: coach.id, name: coach.name }, requiresPhoneVerification: true })
          }
          const phone = String(coach.phone).replace(/\D/g, '')
          if (!phone.endsWith(String(p.phoneSuffix).trim())) {
            return fail(res, '연락처 뒷자리가 일치하지 않습니다.')
          }
        }

        return ok(res, {
          coach: { id: coach.id, name: coach.name, lastCarNumber: coach.last_car_number ?? '' },
          requiresPhoneVerification: false,
        })
      }

      // ── 예약 ──────────────────────────────────────────────────────
      case 'getWeeklyReservations': {
        const weekStart = String(p.weekStart ?? '')
        const coachId = String(p.coachId ?? '')
        const dates: string[] = []
        const base = new Date(weekStart + 'T00:00:00+09:00')
        for (let i = 0; i < 5; i++) {
          const d = new Date(base)
          d.setDate(d.getDate() + i)
          dates.push(d.toISOString().split('T')[0])
        }
        const { data } = await supabase.from('reservations').select('*').in('date', dates).eq('status', 'active')
        return ok(res, (data ?? []).map(r => ({
          id: r.id, date: r.date, time: r.time, room: r.room,
          coachId: r.coach_id, name: r.name,
          carNumber: r.coach_id === coachId ? r.car_number : undefined,
          createdAt: r.created_at, status: r.status,
        })))
      }

      case 'createReservation': {
        const coachId = String(p.coachId ?? '')
        const slots = p.slots as Array<{ date: string; time: string; room: number }>
        const carNumber = p.carNumber ? String(p.carNumber) : ''

        const { data: coach } = await supabase.from('coaches').select('*').eq('id', coachId).single()
        if (!coach) return fail(res, '코치를 찾을 수 없습니다.')

        const now = new Date().toISOString()
        const created = []

        for (const slot of slots) {
          const dateStr = String(slot.date)
          const timeStr = String(slot.time)
          const room = Number(slot.room)

          if (new Date(`${dateStr}T${timeStr}:00+09:00`) <= new Date()) {
            return fail(res, '지난 시간은 예약할 수 없습니다.')
          }

          const id = `R${dateStr.replace(/-/g, '')}${timeStr.replace(':', '')}${room}`
          const { error } = await supabase.from('reservations').insert({
            id, date: dateStr, time: timeStr, room,
            coach_id: coachId, name: coach.name, phone: coach.phone,
            car_number: carNumber, created_at: now, status: 'active',
          })

          if (error) {
            if (error.code === '23505') return fail(res, `${dateStr} ${timeStr} 상담실 ${room}은 이미 예약되었습니다.`)
            return fail(res, '예약에 실패했습니다. 잠시 후 다시 시도해주세요.')
          }
          created.push({ id, date: dateStr, time: timeStr, room, coachId, name: coach.name, carNumber, createdAt: now, status: 'active' })
        }

        if (carNumber) {
          await supabase.from('coaches').update({ last_car_number: carNumber }).eq('id', coachId)
        }
        await supabase.from('access_log').insert({ action: 'CREATE_RESERVATION', coach_id: coachId, detail: `${slots.length}건` })
        return ok(res, created)
      }

      case 'cancelReservation': {
        const reservationId = String(p.reservationId ?? '')
        const coachId = String(p.coachId ?? '')
        const { data: r } = await supabase.from('reservations').select('*').eq('id', reservationId).single()
        if (!r) return fail(res, '예약을 찾을 수 없습니다.')
        if (r.coach_id !== coachId) return fail(res, '본인 예약만 취소할 수 있습니다.')
        if (r.status !== 'active') return fail(res, '이미 취소된 예약입니다.')

        const deadline = new Date(new Date(`${r.date}T${r.time}:00+09:00`).getTime() - 3600000)
        if (new Date() >= deadline) return fail(res, '취소 시한이 지났습니다. 시작 1시간 전까지만 취소할 수 있습니다.')

        await supabase.from('reservations').update({ status: 'cancelled' }).eq('id', reservationId)
        await supabase.from('access_log').insert({ action: 'CANCEL_RESERVATION', coach_id: coachId, detail: reservationId })
        return ok(res, null)
      }

      case 'getBlockedSlots': {
        const weekStart = String(p.weekStart ?? '')
        const { data } = await supabase.from('blocked_slots').select('*')
          .or(`type.eq.common,week_start_date.eq.${weekStart}`)
        return ok(res, (data ?? []).map(r => ({
          id: r.id, type: r.type, weekStartDate: r.week_start_date,
          dayOfWeek: r.day_of_week, time: r.time, room: r.room, reason: r.reason,
        })))
      }

      case 'getGuideContent': {
        const { data } = await supabase.from('settings').select('value').eq('key', 'guideContent').single()
        return ok(res, { content: data?.value ?? '' })
      }

      // ── 관리자 ────────────────────────────────────────────────────
      case 'verifyAdmin': {
        const email = await verifyAdminToken(String(p.token ?? ''))
        return ok(res, { valid: !!email })
      }

      case 'adminGetReservations': {
        const email = await verifyAdminToken(String(p.token ?? ''))
        if (!email) return fail(res, '관리자 인증이 필요합니다.')
        let query = supabase.from('reservations').select('*').eq('status', 'active').order('date').order('time')
        if (p.from) query = query.gte('date', String(p.from))
        if (p.to) query = query.lte('date', String(p.to))
        const { data } = await query
        return ok(res, (data ?? []).map(r => ({
          id: r.id, date: r.date, time: r.time, room: r.room,
          coachId: r.coach_id, name: r.name, phone: r.phone,
          carNumber: r.car_number, createdAt: r.created_at, status: r.status,
        })))
      }

      case 'adminCancelReservation': {
        const email = await verifyAdminToken(String(p.token ?? ''))
        if (!email) return fail(res, '관리자 인증이 필요합니다.')
        await supabase.from('reservations').update({ status: 'cancelled' }).eq('id', String(p.reservationId))
        return ok(res, null)
      }

      case 'adminGetCoaches': {
        const email = await verifyAdminToken(String(p.token ?? ''))
        if (!email) return fail(res, '관리자 인증이 필요합니다.')
        const { data } = await supabase.from('coaches').select('*').order('name')
        return ok(res, (data ?? []).map(r => ({
          id: r.id, name: r.name, phone: r.phone,
          lastCarNumber: r.last_car_number ?? '', active: r.active,
        })))
      }

      case 'adminCreateCoach': {
        const email = await verifyAdminToken(String(p.token ?? ''))
        if (!email) return fail(res, '관리자 인증이 필요합니다.')
        const { data: existing } = await supabase.from('coaches').select('id').order('id', { ascending: false }).limit(1)
        const lastNum = parseInt((existing?.[0]?.id ?? 'C000').replace('C', '')) || 0
        const newId = 'C' + String(lastNum + 1).padStart(3, '0')
        const coach = p.coach as { name: string; phone: string }
        await supabase.from('coaches').insert({ id: newId, name: coach.name, phone: coach.phone, active: true, last_car_number: '' })
        return ok(res, { id: newId, name: coach.name, phone: coach.phone, active: true, lastCarNumber: '' })
      }

      case 'adminUpdateCoach': {
        const email = await verifyAdminToken(String(p.token ?? ''))
        if (!email) return fail(res, '관리자 인증이 필요합니다.')
        const updates = p.updates as Record<string, unknown>
        const dbUpdates: Record<string, unknown> = {}
        if ('active' in updates) dbUpdates.active = updates.active
        if ('name' in updates) dbUpdates.name = updates.name
        if ('phone' in updates) dbUpdates.phone = updates.phone
        await supabase.from('coaches').update(dbUpdates).eq('id', String(p.coachId))
        return ok(res, null)
      }

      case 'adminGetBlockedSlots': {
        const email = await verifyAdminToken(String(p.token ?? ''))
        if (!email) return fail(res, '관리자 인증이 필요합니다.')
        const { data } = await supabase.from('blocked_slots').select('*')
        return ok(res, (data ?? []).map(r => ({
          id: r.id, type: r.type, weekStartDate: r.week_start_date,
          dayOfWeek: r.day_of_week, time: r.time, room: r.room, reason: r.reason,
        })))
      }

      case 'adminCreateBlockedSlot': {
        const email = await verifyAdminToken(String(p.token ?? ''))
        if (!email) return fail(res, '관리자 인증이 필요합니다.')
        const slot = p.slot as { type: string; weekStartDate?: string; dayOfWeek: string; time: string; room: string | number; reason?: string }
        const id = `BLK_${Date.now()}`
        await supabase.from('blocked_slots').insert({
          id, type: slot.type, week_start_date: slot.weekStartDate ?? '',
          day_of_week: slot.dayOfWeek, time: slot.time, room: String(slot.room), reason: slot.reason ?? '',
        })
        return ok(res, { id, ...slot })
      }

      case 'adminDeleteBlockedSlot': {
        const email = await verifyAdminToken(String(p.token ?? ''))
        if (!email) return fail(res, '관리자 인증이 필요합니다.')
        await supabase.from('blocked_slots').delete().eq('id', String(p.slotId))
        return ok(res, null)
      }

      case 'adminUpdatePassword': {
        const email = await verifyAdminToken(String(p.token ?? ''))
        if (!email) return fail(res, '관리자 인증이 필요합니다.')
        if (!p.newPassword || String(p.newPassword).length < 4) return fail(res, '비밀번호는 4자 이상이어야 합니다.')
        await supabase.from('settings').upsert({ key: 'userPasswordHash', value: hashPw(String(p.newPassword)) })
        return ok(res, null)
      }

      case 'adminUpdateGuideContent': {
        const email = await verifyAdminToken(String(p.token ?? ''))
        if (!email) return fail(res, '관리자 인증이 필요합니다.')
        await supabase.from('settings').upsert({ key: 'guideContent', value: String(p.content ?? '') })
        return ok(res, null)
      }

      // 최초 1회 초기화
      case 'initSetup': {
        const { data: existing } = await supabase.from('settings').select('value').eq('key', 'userPasswordHash').single()
        if (existing?.value) return fail(res, '이미 초기화되었습니다.')
        await supabase.from('settings').upsert({ key: 'userPasswordHash', value: hashPw('woohwa') })
        await supabase.from('settings').upsert({ key: 'guideContent', value: '' })
        return ok(res, { message: '초기화 완료. 초기 비밀번호: woohwa' })
      }

      default:
        return fail(res, '알 수 없는 요청입니다.')
    }
  } catch (e) {
    console.error('[API Error]', e)
    return fail(res, '요청을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.')
  }
}
