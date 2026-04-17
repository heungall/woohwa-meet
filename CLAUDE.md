# WOOHWA 상담실 예약 시스템

**프로젝트**: 명지전문대 상담실 1·2·3 예약 시스템  
**브랜드**: WOOHWA (우화) — "Transformational Moments"  
**타겟**: 50~60대 코치 모바일 사용성 최우선

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React 18 + Vite + TypeScript + Tailwind CSS |
| 백엔드 | Vercel Serverless Functions (`api/index.ts`) |
| 데이터베이스 | Supabase (PostgreSQL) |
| 배포 | Vercel (프론트 + 백엔드 통합) |
| 관리자 인증 | Google OAuth 2.0 Implicit Flow |

---

## 프로젝트 구조

```
woohwa-meet/
├── api/
│   └── index.ts          # Vercel 서버리스 함수 (모든 API 처리)
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── PasswordForm.tsx
│   │   │   └── CoachSelector.tsx
│   │   ├── reservation/
│   │   │   ├── WeeklyCalendar.tsx
│   │   │   └── ReservationModal.tsx
│   │   ├── guide/
│   │   │   └── GuideTab.tsx
│   │   ├── admin/
│   │   │   ├── AdminAuth.tsx
│   │   │   └── Dashboard.tsx
│   │   └── common/
│   │       ├── Header.tsx
│   │       ├── Layout.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── Toast.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useReservations.ts
│   │   └── useAdminAuth.ts
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   ├── reservation.ts
│   │   └── coach.ts
│   ├── utils/
│   │   ├── date.ts
│   │   ├── validation.ts
│   │   └── constants.ts
│   ├── App.tsx
│   └── main.tsx
├── docs/
│   └── supabase_setup.sql  # DB 초기 설정 SQL
├── vercel.json
├── .env.local              # 로컬 환경변수 (gitignore)
└── .env.example
```

---

## 환경변수

```env
# Vercel 서버사이드 전용 (클라이언트 노출 금지)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
PASSWORD_SALT=woohwa_salt_2026

# 빌드에 포함 (관리자 Google OAuth)
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

---

## API 설계

모든 요청은 `POST /api` 단일 엔드포인트, body에 `action` 필드로 라우팅.

```typescript
// 공통 요청 형태
fetch('/api', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'actionName', ...params })
})

// 공통 응답 형태
{ success: true, data: any }
{ success: false, error: string }
```

### 사용자 액션
| action | 설명 |
|--------|------|
| `verifyPassword` | 공통 비밀번호 검증 |
| `getCoaches` | 활성 코치 목록 |
| `selectCoach` | 코치 선택 (동명이인 처리) |
| `getWeeklyReservations` | 주간 예약 현황 |
| `createReservation` | 예약 생성 |
| `cancelReservation` | 예약 취소 |
| `getBlockedSlots` | 불가시간 조회 |
| `getGuideContent` | 길안내 콘텐츠 |

### 관리자 액션 (token 필수)
| action | 설명 |
|--------|------|
| `verifyAdmin` | Google 토큰 검증 + admin_list 확인 |
| `adminGetReservations` | 전체 예약 조회 |
| `adminCancelReservation` | 예약 강제 취소 |
| `adminGetCoaches` | 전체 코치 조회 |
| `adminCreateCoach` | 코치 추가 |
| `adminUpdateCoach` | 코치 수정/비활성화 |
| `adminGetBlockedSlots` | 불가시간 전체 조회 |
| `adminCreateBlockedSlot` | 불가시간 추가 |
| `adminDeleteBlockedSlot` | 불가시간 삭제 |
| `adminUpdatePassword` | 공통 비밀번호 변경 |
| `adminUpdateGuideContent` | 길안내 콘텐츠 수정 |

---

## 데이터베이스 스키마

```sql
-- 코치 명단
coaches (id, name, phone, last_car_number, active)

-- 예약
reservations (id, date, time, room, coach_id, name, phone, car_number, created_at, status)
-- unique index: (date, time, room) WHERE status='active'

-- 불가시간
blocked_slots (id, type, week_start_date, day_of_week, time, room, reason)

-- 시스템 설정 (비밀번호 해시, 길안내 콘텐츠 등)
settings (key, value)

-- 관리자 이메일 화이트리스트
admin_list (email, role)
```

---

## 핵심 비즈니스 규칙

- 예약 가능: 월~금, 09:00~19:00, 1시간 단위
- 조회 범위: 이번 주 ~ 4주 후 (과거 조회 불가)
- 취소 가능: 예약 시작 1시간 전까지, 본인만 가능
- 비밀번호: `SHA-256(password.toLowerCase().trim() + SALT)` 해시 저장
- 동명이인: 연락처 뒷자리 4자리로 구분
- 차량번호: 코치별 마지막 입력값 자동 기억

---

## 브랜드 & UX 가이드

```
WOOHWA Green:      #9BC53D
WOOHWA Green Dark: #86A934
배경:              #FBF9F7 (크림)

최소 터치 타겟: 44px (min-h-touch / min-w-touch 커스텀 토큰)
기본 폰트:      16px (text-base) 이상
중요 버튼:      text-lg~xl, py-4~5
행간:           fontSize 토큰에 lineHeight 명시 (tailwind.config.js)
```

**우선순위**: 사용성 > 보안 > 성능 > 기능

### UI 컨벤션 (50~60대 모바일 기준)

| 항목 | 규칙 |
|------|------|
| 보조 텍스트 | `text-base text-gray-600` 이상 — `text-sm`, `gray-400` 사용 금지 |
| 에러 메시지 | `text-base text-red-600` |
| 드롭다운 | `appearance-none` 사용 시 반드시 커스텀 화살표 SVG 오버레이 추가 |
| 모달 버튼 | 주 행동(오른쪽) / 보조 행동(왼쪽 텍스트 링크) 구분 |
| 헤더 | `whitespace-nowrap` + `truncate` + `shrink-0` 조합으로 한 줄 유지 |
| 캘린더 슬롯 | `h-12`(48px), `text-sm font-semibold`, 상태별 명확한 배경색 |
| 코치 선택 | 드롭다운 유지 (코치 ~50명), 화살표 SVG 필수 |

---

## 초기 설정 (최초 1회)

1. Supabase에서 `docs/supabase_setup.sql` 실행
2. Vercel 환경변수 설정
3. 초기 비밀번호 설정 (Supabase SQL Editor):
   ```sql
   INSERT INTO settings (key, value)
   VALUES ('userPasswordHash', encode(digest('woohwa' || 'woohwa_salt_2026', 'sha256'), 'hex'));
   ```
4. 관리자 이메일 등록:
   ```sql
   INSERT INTO admin_list (email, role) VALUES ('your@gmail.com', 'admin');
   ```
