# WOOHWA 상담실 예약 시스템

**프로젝트**: WOOHWA 명지전문대 상담실 예약 시스템
**버전**: 1.0 
**작성자**: 희여 코치 (흥얼)
**Claude Code 협업 가이드**

---

## 🦋 프로젝트 개요

명지전문대학교 연구동 2층 상담실 1·2·3의 예약을 WOOHWA 코치들이 웹에서 간편하게 관리할 수 있는 시스템입니다.

**브랜드**: WOOHWA (우화) — 번데기에서 나비로의 변화, "Transformational Moments"
**타겟**: 50~60대 포함 코치들의 모바일 웹 사용성 최우선

---

## 📋 요구사항 요약

### 핵심 기능
- **예약 시스템**: 월~금, 9시~20시, 1시간 단위 (상담실 1/2/3)
- **사용자 인증**: 공통 비밀번호 `woohwa` + 코치 이름 선택 (평문 표시)
- **예약 정책**: 본인만 취소, 시작 1시간 전까지
- **관리자 화면**: 예약 현황, 불가시간 관리, 코치 관리
- **길안내 탭**: 관리자가 나중에 콘텐츠 편집 가능

### 중요 제약사항
- 과거 예약 조회 불가, 미래 4주까지만
- 동명이인은 연락처 뒷자리 4자리로 구분
- 차량번호 마지막 입력값 자동 기억
- 대외비 (코치 이름·연락처는 관리자만)
- 알림 기능 없음 (v1.0)

---

## 🛠 기술 스택

### Frontend
```
React 18 + Vite
- TypeScript
- Tailwind CSS (WOOHWA Green: #9BC53D 계열)
- React Router
- fetch API (no axios 의존성)
```

### Backend
```
Google Apps Script (JavaScript ES6+)
- doPost/doGet endpoints
- LockService (동시 예약 충돌 방지)
- MailApp (관리자 알림용만)
```

### Database
```
Google Spreadsheet (6개 시트)
- Reservations: 예약 데이터
- BlockedSlots: 학교 지정 불가 시간
- Coaches: 코치 명단
- AdminList: 관리자 Gmail 화이트리스트
- Settings: 시스템 설정
- AccessLog: 접근 이력
```

### 배포
```
- Frontend: GitHub Pages 또는 Vercel
- Backend: Google Apps Script Web App
- HTTPS 필수 (모든 통신)
```

---

## 📁 프로젝트 구조

```
woohwa-reservation-system/
├── README.md
├── CLAUDE.md (이 파일)
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── PasswordForm.tsx
│   │   │   └── CoachSelector.tsx
│   │   ├── reservation/
│   │   │   ├── WeeklyCalendar.tsx
│   │   │   ├── TimeSlot.tsx
│   │   │   └── ReservationModal.tsx
│   │   ├── guide/
│   │   │   └── GuideTab.tsx
│   │   ├── admin/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ReservationList.tsx
│   │   │   ├── BlockedSlotsManager.tsx
│   │   │   └── CoachManager.tsx
│   │   └── common/
│   │       ├── Header.tsx
│   │       ├── Layout.tsx
│   │       └── LoadingSpinner.tsx
│   ├── types/
│   │   ├── reservation.ts
│   │   ├── coach.ts
│   │   └── api.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useReservations.ts
│   │   └── useAdminAuth.ts
│   ├── services/
│   │   ├── api.ts
│   │   └── auth.ts
│   ├── utils/
│   │   ├── date.ts
│   │   ├── validation.ts
│   │   └── constants.ts
│   ├── App.tsx
│   └── main.tsx
├── apps-script/
│   ├── Code.js (메인 엔드포인트)
│   ├── ReservationService.js
│   ├── AuthService.js
│   ├── AdminService.js
│   └── Utils.js
└── docs/
    ├── SRS_v1.2.md
    ├── API_Documentation.md
    └── Deployment_Guide.md
```

---

## 🎨 브랜드 & 디자인 가이드

### 컬러 팔레트
```css
:root {
  /* Primary - WOOHWA Green */
  --woohwa-green: #9BC53D; /* 배너에서 추출 예정 */
  --woohwa-green-light: #B6D157;
  --woohwa-green-dark: #86A934;
  
  /* Neutral */
  --cream: #FBF9F7;
  --white: #FFFFFF;
  --gray-100: #F5F5F5;
  --gray-500: #9CA3AF;
  --gray-900: #111827;
  
  /* Semantic */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
}
```

### 타이포그래피
```css
font-family: 'Noto Sans KR', -apple-system, sans-serif;

/* 50~60대 가독성 고려 */
--text-base: 16px;    /* 기본 */
--text-lg: 18px;      /* 중요 버튼 */
--text-xl: 20px;      /* 헤딩 */
--text-2xl: 24px;     /* 메인 타이틀 */
```

### 터치 타겟
```css
/* 50~60대 모바일 사용성 고려 */
min-height: 44px;
min-width: 44px;
```

---

## 📱 반응형 브레이크포인트

```css
/* Mobile First */
sm: 640px   /* 모바일 가로 */
md: 768px   /* 태블릿 */
lg: 1024px  /* 데스크톱 */
xl: 1280px  /* 대형 데스크톱 */
```

**우선순위**: 모바일 > 태블릿 > PC

---

## 🔒 보안 가이드 (MOIS 2021 기준)

### 필수 적용 항목

**1. Input Validation (Category 1)**
```typescript
// [SECURE] SQL Injection 방지 - 모든 DB 쿼리는 파라미터 바인딩 사용
// Apps Script에서는 직접 스프레드시트 접근이므로 해당 없음

// [SECURE] XSS 방지 - 모든 사용자 입력 HTML 이스케이프
const escapeHtml = (str: string): string => {
  return str.replace(/[&<>"']/g, (char) => {
    const escape: Record<string, string> = {
      '&': '&amp;', '<': '&lt;', '>': '&gt;',
      '"': '&quot;', "'": '&#x27;'
    };
    return escape[char];
  });
};

// [SECURE] Path Traversal 방지 - 파일 경로 화이트리스트 검증
const ALLOWED_PATHS = ['/api/reservations', '/api/auth'];
if (!ALLOWED_PATHS.includes(requestPath)) {
  throw new Error('Unauthorized path');
}
```

**2. Security Features (Category 2)**
```typescript
// [SECURE] 비밀번호 해시화 - bcrypt 사용 불가하므로 SHA-256 + salt
// Apps Script Utilities.computeDigest 사용
const hashPassword = (password: string, salt: string): string => {
  const combined = password + salt;
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256, 
    combined
  );
  return digest.map(byte => (byte + 256).toString(16).slice(-2)).join('');
};

// [SECURE] 보안 난수 생성 - 세션 토큰용
const generateSecureToken = (): string => {
  return Utilities.getUuid();
};

// [SECURE] Rate Limiting - 로그인 시도 제한
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 10;
```

**3. Error Handling (Category 4)**
```typescript
// [SECURE] 에러 정보 노출 방지 - 일반적인 메시지만 반환
try {
  // API 호출
} catch (error) {
  console.error('Internal error:', error); // 서버 로그만
  return { error: '요청을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.' };
}
```

**4. Resource Management (Category 5)**
```typescript
// [SECURE] 리소스 해제 - try-finally 또는 with 문 사용
let lock: GoogleAppsScript.Lock.Lock | null = null;
try {
  lock = LockService.getScriptLock();
  lock.waitLock(10000);
  // 작업 수행
} finally {
  // [SECURE] Lock 해제 보장
  if (lock) {
    lock.releaseLock();
  }
}
```

---

## 🌐 API 설계

### Base URL
```
Production: https://script.google.com/macros/s/{SCRIPT_ID}/exec
Development: https://script.google.com/macros/d/{SCRIPT_ID}/exec
```

### Authentication
```typescript
// 공통 헤더
headers: {
  'Content-Type': 'application/json',
  'X-Password-Hash': 'hashed_password',  // 평문 비번 클라이언트에서 해시화 후 전송
  'X-Coach-ID': 'C001'  // 로그인 후 세션에서
}
```

### Endpoints
```typescript
// 인증
POST /auth/login
POST /auth/coach-select

// 예약 (사용자)
GET /reservations/week?date=2026-04-20
POST /reservations
DELETE /reservations/{id}

// 관리자 인증
POST /admin/auth/google

// 관리자 기능
GET /admin/reservations
POST /admin/blocked-slots
GET /admin/coaches
POST /admin/coaches
PUT /admin/settings
```

---

## 📊 데이터 스키마

### Reservations 시트
```typescript
interface Reservation {
  id: string;              // R20260420_0900_1
  date: string;            // 2026-04-20
  time: string;            // 09:00
  room: number;            // 1, 2, 3
  coachId: string;         // C001
  name: string;            // 희여
  phone: string;           // 010-1234-5678
  carNumber?: string;      // 12가3456
  createdAt: string;       // ISO datetime
  status: 'active' | 'cancelled';
}
```

### Coaches 시트
```typescript
interface Coach {
  id: string;              // C001
  name: string;            // 희여
  phone: string;           // 010-1234-5678
  lastCarNumber?: string;  // 12가3456 (자동 업데이트)
  active: boolean;
}
```

### BlockedSlots 시트
```typescript
interface BlockedSlot {
  id: string;              // BLK001
  type: 'common' | 'weekly';
  weekStartDate?: string;  // 2026-04-20 (weekly 타입)
  dayOfWeek: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';
  time: string;            // 09:00
  room: number | 'all';
  reason?: string;
}
```

---

## 🔄 개발 워크플로우

### 1. 초기 설정
```bash
# 프로젝트 생성
npm create vite@latest woohwa-reservation-system -- --template react-ts
cd woohwa-reservation-system
npm install

# Tailwind CSS 설정
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 추가 의존성
npm install react-router-dom date-fns
npm install -D @types/google-apps-script
```

### 2. 개발 순서
1. **Google Spreadsheet 템플릿 생성** (6개 시트)
2. **Apps Script 백엔드** (인증, 예약 CRUD)
3. **React Frontend** (인증 → 예약 화면 → 관리자)
4. **브랜드 디자인 적용** (WOOHWA Green, 번데기 모티프)
5. **50~60대 사용성 테스트**

### 3. Claude Code 협업 가이드

**컴포넌트 생성 시**
```
새 컴포넌트 작성할 때:
1. 파일명: PascalCase.tsx
2. 보안 검증 필수 (MOIS 가이드)
3. 50~60대 사용성 고려 (큰 버튼, 명확한 텍스트)
4. WOOHWA 브랜드 컬러 적용
5. 반응형 (모바일 우선)

예시:
"ReservationModal 컴포넌트 만들어줘. 
이름/차량번호 입력받고, 확인/취소 버튼. 
차량번호는 props로 받은 lastCarNumber로 미리 채워줘.
50대 사용자도 쓸 수 있게 버튼 크게, 글자 16px 이상."
```

**API 함수 작성 시**
```
"예약 생성 API 함수 만들어줘.
- POST /reservations 엔드포인트 호출
- 동시 예약 충돌 처리 (409 에러)
- MOIS 보안 가이드 적용
- 에러는 사용자 친화적 메시지로 변환"
```

**보안 우선 원칙**
- 모든 사용자 입력은 검증 + 이스케이프
- 에러 메시지는 내부 정보 노출 금지
- 인증 상태 서버 검증 필수
- 관리자 기능은 이중 인증

---

## 🧪 테스트 가이드

### 사용성 테스트 (50~60대 타겟)
```
체크리스트:
□ 비밀번호 입력 시 내용이 보이는가?
□ 버튼 터치 영역이 44px 이상인가?
□ 글자 크기가 16px 이상인가?
□ 에러 메시지가 이해하기 쉬운가?
□ 3탭 이내로 예약 완료되는가?
□ 모바일에서 가로스크롤이 생기지 않는가?
```

### 보안 테스트
```
□ 비밀번호 5회 실패 시 잠금되는가?
□ 관리자가 아닌 사용자가 /admin 접근 시 차단되는가?
□ 다른 코치 예약을 취소할 수 없는가?
□ XSS 공격이 차단되는가? (script 태그 입력 시)
□ 과거 날짜 예약이 차단되는가?
```

---

## 🚀 배포 가이드

### Frontend (GitHub Pages)
```bash
# 빌드
npm run build

# GitHub Pages 배포
npm install -D gh-pages
npm run deploy
```

### Backend (Apps Script)
```
1. script.google.com에서 새 프로젝트 생성
2. apps-script/ 폴더의 .js 파일들 복사
3. 웹 앱으로 배포: "본인으로 실행, 누구나 접근"
4. 배포 URL을 프론트엔드 API_URL에 설정
```

---

## 📞 연락처 & 지원

**희여 코치 (프로젝트 오너)**
- GitHub: @heungall  
- 브랜드: WOOHWA (@hear_coach)

**개발 우선순위**: 사용성 > 보안 > 성능 > 기능

---

## 📝 변경 이력

### v1.0 (2026-04-17)
- 초기 프로젝트 설정
- SRS v1.2 기반 아키텍처 설계
- Claude Code 협업 가이드 작성

---

*"번데기에서 나비로의 변화, WOOHWA" — 기술로 코칭의 순간을 더 아름답게 만들어갑니다.*
