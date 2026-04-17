# 🦋 WOOHWA 상담실 예약시스템 개발 TODO

**프로젝트**: WOOHWA 명지전문대 상담실 예약시스템
**전체 기간**: 약 4주 (25일)
**현재 상황**: SRS v1.2 확정, CLAUDE.md 작성 완료 ✅
**시작일**: 2026-04-17

---

## 📊 진행 상황 개요

```
Phase 1: 백엔드 인프라     [    ] 0% (3-4일)
Phase 2: 프론트엔드 기초   [    ] 0% (5-6일)  
Phase 3: 관리자 화면       [    ] 0% (3-4일)
Phase 4: 디자인 & UX      [    ] 0% (3-4일)
Phase 5: 테스트 & 배포     [    ] 0% (3-4일)

전체 진행률: 0%
```

---

## 📋 Phase 1: 백엔드 인프라 (3-4일)

### 🎯 목표
Google Spreadsheet + Apps Script 백엔드 API 구축 완료

### ✅ 할일 목록

#### 1-1. Google Spreadsheet 세팅 ⭐ **최우선**
- [ ] 새 Google Spreadsheet 생성
- [ ] 6개 시트 생성 (Reservations, BlockedSlots, Coaches, AdminList, Settings, AccessLog)
- [ ] 각 시트 헤더 로우 설정 (CLAUDE.md 스키마 기준)
- [ ] 샘플 데이터 2-3개씩 입력
- [ ] 스프레드시트 공유 설정 (본인만 편집 가능)

```bash
# Claude Code 명령어
"Google Spreadsheet 템플릿 생성해줘.
6개 시트: Reservations, BlockedSlots, Coaches, AdminList, Settings, AccessLog
각 시트마다 CLAUDE.md의 스키마에 맞는 헤더 로우 생성
A1에 컬럼명 넣고 B1부터 샘플 데이터 2-3개씩"
```

**산출물**: 스프레드시트 링크 + 스프레드시트 ID
**후속작업**: 흥얼이 실제 코치 명단, 관리자 Gmail 입력

#### 1-2. Apps Script 백엔드 API
- [ ] 새 Apps Script 프로젝트 생성
- [ ] `Code.js` - 메인 라우팅 (doPost/doGet)
- [ ] `AuthService.js` - 인증 관련 함수들
- [ ] `ReservationService.js` - 예약 CRUD
- [ ] `AdminService.js` - 관리자 기능
- [ ] `Utils.js` - 공통 유틸리티
- [ ] 환경변수 설정 (스프레드시트 ID)
- [ ] 웹앱으로 배포 ("본인으로 실행, 누구나 접근")

```bash
# Claude Code 명령어
"Apps Script 백엔드 만들어줘.
doPost/doGet 라우팅, 인증 서비스, 예약 CRUD
MOIS 보안 가이드 적용 (해시화, LockService, 에러 처리)
스프레드시트 ID는 PropertiesService로 환경변수화"
```

**보안 체크리스트**:
- [ ] 비밀번호 해시화 (SHA-256 + salt)
- [ ] Rate Limiting (로그인 시도 제한)
- [ ] LockService로 동시성 제어
- [ ] 에러 정보 노출 방지
- [ ] 입력값 검증 및 이스케이프

#### 1-3. API 문서 작성
- [ ] 엔드포인트별 request/response 명세
- [ ] 에러 코드 정리
- [ ] 인증 헤더 설명
- [ ] Postman 테스트 예시

```bash
# Claude Code 명령어
"API 문서 만들어줘.
각 엔드포인트별 request/response 예시
에러 코드 정리, 인증 헤더 설명
Postman으로 테스트할 수 있게"
```

**산출물**: `docs/API_Documentation.md`

---

## 📋 Phase 2: 프론트엔드 기초 (5-6일)

### 🎯 목표
사용자 인증 + 예약 달력 + 예약 모달 완성

### ✅ 할일 목록

#### 2-1. React 프로젝트 초기화
- [ ] Vite + React + TypeScript 프로젝트 생성
- [ ] Tailwind CSS 설정
- [ ] React Router 설정
- [ ] 기본 프로젝트 구조 생성 (`src/components/`, `src/hooks/` 등)
- [ ] WOOHWA 브랜드 컬러 CSS 변수 설정
- [ ] Noto Sans KR 폰트 설정
- [ ] 기본 레이아웃 컴포넌트

```bash
# Claude Code 명령어
"React 프로젝트 세팅해줘.
Vite + TypeScript + Tailwind CSS + React Router
WOOHWA 브랜드 컬러 설정 (#9BC53D), 폰트 설정 (Noto Sans KR)
기본 레이아웃과 헤더 컴포넌트, 50대 사용성 고려"
```

**파일 생성 목록**:
- [ ] `package.json`
- [ ] `vite.config.ts`
- [ ] `tailwind.config.js`
- [ ] `src/components/common/Layout.tsx`
- [ ] `src/components/common/Header.tsx`
- [ ] `src/utils/constants.ts`

#### 2-2. 인증 플로우
- [ ] 비밀번호 입력 컴포넌트 (평문 표시)
- [ ] 코치 선택 컴포넌트 (드롭다운)
- [ ] 동명이인 처리 (연락처 뒷자리 4자리)
- [ ] useAuth 훅 (세션 관리)
- [ ] API 연결 (로그인, 코치 목록)

```bash
# Claude Code 명령어
"인증 플로우 만들어줘.
1) 비밀번호 입력 화면 (평문 표시, 큰 버튼)
2) 코치 선택 화면 (드롭다운, 동명이인 처리)
3) useAuth 훅으로 세션 관리
50대 사용성 고려 (44px+ 버튼, 16px+ 글자)"
```

**파일 생성 목록**:
- [ ] `src/components/auth/PasswordForm.tsx`
- [ ] `src/components/auth/CoachSelector.tsx`
- [ ] `src/hooks/useAuth.ts`
- [ ] `src/services/auth.ts`
- [ ] `src/types/auth.ts`

**UX 체크리스트**:
- [ ] 버튼 크기 44px 이상
- [ ] 글자 크기 16px 이상
- [ ] 터치 영역 충분
- [ ] 에러 메시지 이해하기 쉬움

#### 2-3. 주간 달력 컴포넌트
- [ ] 주간 달력 레이아웃 (월~금 × 9-20시 × 상담실 1/2/3)
- [ ] 슬롯 상태 표시 (빈 슬롯, 본인 예약, 타 예약자, 불가시간)
- [ ] 주차 선택기 (◀ 이번 주 ▶)
- [ ] 모바일 반응형 (세로 스크롤)
- [ ] 데이터 로딩 상태 처리

```bash
# Claude Code 명령어
"예약 달력 만들어줘.
월~금 × 9-20시 × 상담실 1/2/3 그리드
슬롯 상태별 색상 구분 (빈 슬롯/본인/타인/불가)
주차 선택기, 모바일 반응형
WOOHWA Green 컬러 사용"
```

**파일 생성 목록**:
- [ ] `src/components/reservation/WeeklyCalendar.tsx`
- [ ] `src/components/reservation/TimeSlot.tsx`
- [ ] `src/hooks/useReservations.ts`
- [ ] `src/utils/date.ts`
- [ ] `src/types/reservation.ts`

#### 2-4. 예약 모달
- [ ] 예약 생성 모달 (이름 자동 입력, 차량번호 자동 기억)
- [ ] 여러 슬롯 동시 선택 지원
- [ ] 예약 취소 모달
- [ ] 에러 처리 및 로딩 상태
- [ ] 확인/취소 버튼

```bash
# Claude Code 명령어
"예약 모달 만들어줘.
이름 자동 입력 (수정 불가), 차량번호 자동 기억 (수정 가능)
여러 슬롯 선택 지원, 확인/취소 버튼
50대 친화적 UI, 에러 처리"
```

**파일 생성 목록**:
- [ ] `src/components/reservation/ReservationModal.tsx`
- [ ] `src/components/reservation/CancelModal.tsx`
- [ ] `src/services/api.ts`

---

## 📋 Phase 3: 관리자 화면 (3-4일)

### 🎯 목표
관리자 대시보드, 불가시간 관리, 설정 관리 완성

### ✅ 할일 목록

#### 3-1. 관리자 인증
- [ ] Google OAuth 설정 (클라이언트 ID 발급)
- [ ] 관리자 로그인 컴포넌트
- [ ] Gmail 화이트리스트 검증
- [ ] useAdminAuth 훅
- [ ] /admin 라우트 보호

```bash
# Claude Code 명령어
"Google OAuth 관리자 인증 만들어줘.
/admin 라우트 보호, Gmail 화이트리스트 검증
useAdminAuth 훅으로 상태 관리"
```

**파일 생성 목록**:
- [ ] `src/components/admin/AdminAuth.tsx`
- [ ] `src/hooks/useAdminAuth.ts`
- [ ] `src/services/adminAuth.ts`

#### 3-2. 관리자 대시보드
- [ ] 예약 현황 카드 (오늘, 이번주, 이번달)
- [ ] 예약 리스트 테이블 (검색, 필터, 정렬)
- [ ] CSV 내보내기
- [ ] 기간별 필터 (이번 주/달, 사용자 지정)
- [ ] 코치별 필터

```bash
# Claude Code 명령어
"관리자 대시보드 만들어줘.
예약 현황 카드, 예약 리스트 테이블
CSV 내보내기, 기간/코치별 필터
깔끔한 테이블 UI"
```

**파일 생성 목록**:
- [ ] `src/components/admin/Dashboard.tsx`
- [ ] `src/components/admin/ReservationList.tsx`
- [ ] `src/components/admin/StatsCards.tsx`
- [ ] `src/utils/csv.ts`

#### 3-3. 불가시간 관리
- [ ] 불가시간 목록 표시
- [ ] 공통 상시 불가시간 추가/편집/삭제
- [ ] 특정 주차 불가시간 추가/편집/삭제
- [ ] 일괄 등록 UI (여러 슬롯 체크 후 저장)
- [ ] 불가 사유 입력

```bash
# Claude Code 명령어
"불가시간 관리 UI 만들어줘.
공통/주차별 불가시간 구분, 일괄 등록
달력 형태로 선택할 수 있게"
```

**파일 생성 목록**:
- [ ] `src/components/admin/BlockedSlotsManager.tsx`
- [ ] `src/components/admin/BlockedSlotForm.tsx`

#### 3-4. 설정 관리
- [ ] 코치 명단 관리 (추가/수정/비활성화)
- [ ] 공통 비밀번호 변경
- [ ] 관리자 Gmail 화이트리스트 관리
- [ ] 길안내 콘텐츠 편집 (마크다운)

```bash
# Claude Code 명령어
"관리자 설정 화면 만들어줘.
코치 CRUD, 비밀번호 변경, Gmail 화이트리스트 관리
길안내 콘텐츠 마크다운 편집기"
```

**파일 생성 목록**:
- [ ] `src/components/admin/CoachManager.tsx`
- [ ] `src/components/admin/SettingsManager.tsx`
- [ ] `src/components/admin/GuideEditor.tsx`

---

## 📋 Phase 4: 디자인 & UX (3-4일)

### 🎯 목표
WOOHWA 브랜딩 적용, 50대 사용성 최적화

### ✅ 할일 목록

#### 4-1. WOOHWA 브랜딩 적용
- [ ] 배너 이미지에서 정확한 색상 추출
- [ ] CSS 변수 업데이트 (#9BC53D 조정)
- [ ] 번데기→나비 모티프 아이콘 제작
- [ ] 로딩 스피너에 나비 모티프 적용
- [ ] WOOHWA 로고 헤더 배치
- [ ] 빈 상태(empty state) 디자인

```bash
# Claude Code 명령어
"WOOHWA 브랜딩 적용해줘.
배너 이미지에서 정확한 초록색 추출 후 CSS 변수 업데이트
번데기→나비 모티프로 로딩, 빈 상태 디자인
WOOHWA 로고 헤더 배치"
```

**작업 목록**:
- [ ] 컬러 팔레트 정확히 정의
- [ ] 나비/번데기 SVG 아이콘 제작
- [ ] 로딩 애니메이션 디자인
- [ ] 헤더 로고 배치
- [ ] 전체 UI 일관성 검토

#### 4-2. 50~60대 사용성 개선
- [ ] 모든 버튼 44px 이상 확인
- [ ] 모든 텍스트 16px 이상 확인
- [ ] 색상 대비 WCAG AA 기준 확인
- [ ] 터치 영역 충분한지 검증
- [ ] 에러 메시지 이해하기 쉽게 수정
- [ ] 폰트 웨이트 조정 (가독성 향상)

```bash
# Claude Code 명령어
"50대 사용성 테스트하고 개선해줘.
버튼 크기 44px+ 확인, 글자 크기 16px+ 확인
에러 메시지 이해하기 쉽게 수정
터치 영역 충분한지 검증, 색상 대비 개선"
```

**체크리스트**:
- [ ] 비밀번호 입력 화면 사용성
- [ ] 코치 선택 드롭다운 사용성
- [ ] 예약 달력 터치 영역
- [ ] 예약 모달 버튼 크기
- [ ] 에러 메시지 명확성

#### 4-3. 길안내 탭
- [ ] 길안내 탭 기본 레이아웃
- [ ] v1.0 플레이스홀더 화면 ("준비 중")
- [ ] 관리자 콘텐츠 편집 UI 연결
- [ ] 마크다운 렌더링

```bash
# Claude Code 명령어
"길안내 탭 만들어줘.
v1.0은 플레이스홀더 ('준비 중')
관리자가 마크다운으로 콘텐츠 편집할 수 있는 UI
나중에 지도 이미지 추가할 수 있게 구조화"
```

**파일 생성 목록**:
- [ ] `src/components/guide/GuideTab.tsx`
- [ ] `src/components/guide/GuidePlaceholder.tsx`

#### 4-4. 반응형 최적화
- [ ] 모바일 세로 모드 최적화
- [ ] 태블릿 가로 모드 최적화
- [ ] PC 화면 최적화
- [ ] 터치/마우스 인터랙션 개선

---

## 📋 Phase 5: 테스트 & 배포 (3-4일)

### 🎯 목표
품질 검증, 성능 최적화, 프로덕션 배포

### ✅ 할일 목록

#### 5-1. 통합 테스트
- [ ] 사용자 플로우 테스트 (로그인→예약→취소)
- [ ] 관리자 플로우 테스트 (로그인→설정→관리)
- [ ] 동시 예약 충돌 테스트
- [ ] Edge case 테스트 (과거 날짜, 시간 초과 등)
- [ ] 크로스 브라우저 테스트 (Chrome, Safari, Samsung Internet)

```bash
# Claude Code 명령어
"E2E 테스트 시나리오 작성하고 실행해줘.
1) 로그인 → 예약 → 취소 플로우
2) 관리자 로그인 → 설정 변경 플로우
3) 동시 예약 충돌 테스트
4) 에러 상황 테스트"
```

**테스트 체크리스트**:
- [ ] 로그인 플로우 (비밀번호 + 코치 선택)
- [ ] 예약 생성/취소
- [ ] 관리자 기능 (대시보드, 설정)
- [ ] 권한 제어
- [ ] 에러 처리

#### 5-2. 보안 테스트
- [ ] XSS 공격 차단 확인
- [ ] 권한 우회 시도 차단 확인
- [ ] Rate Limiting 동작 확인
- [ ] 민감 정보 노출 확인
- [ ] HTTPS 강제 리디렉션 확인

```bash
# Claude Code 명령어
"보안 테스트해줘.
XSS 공격 시도 (script 태그 입력)
권한 우회 시도 (/admin 직접 접근)
Rate Limiting 확인 (연속 로그인 실패)
MOIS 보안 가이드 체크리스트 검증"
```

**보안 체크리스트**:
- [ ] 비인증 사용자 /admin 접근 차단
- [ ] 타 코치 예약 취소 차단
- [ ] 과거 날짜 예약 차단
- [ ] Script 태그 입력 시 이스케이프
- [ ] 로그인 5회 실패 시 잠금

#### 5-3. 성능 최적화
- [ ] 번들 크기 분석 및 최적화
- [ ] 이미지 최적화
- [ ] 코드 스플리팅
- [ ] 로딩 성능 측정 (주간 달력 3초 이내)
- [ ] 모바일 성능 최적화

```bash
# Claude Code 명령어
"성능 최적화해줘.
번들 크기 분석, 이미지 최적화
주간 달력 로딩 3초 이내 목표
모바일 스크롤 성능 확인"
```

#### 5-4. 배포 준비
- [ ] 환경변수 분리 (개발/프로덕션)
- [ ] GitHub Pages 또는 Vercel 설정
- [ ] 도메인 설정 (선택사항)
- [ ] HTTPS 인증서 확인
- [ ] 배포 스크립트 작성

```bash
# Claude Code 명령어
"배포 설정해줘.
GitHub Pages 설정, 환경변수 분리
프로덕션/개발 API URL 설정
빌드 스크립트 최적화"
```

**배포 체크리스트**:
- [ ] API URL 환경별 분리
- [ ] 스프레드시트 ID 환경변수화
- [ ] 빌드 최적화
- [ ] 배포 자동화

#### 5-5. 문서화
- [ ] 사용자 매뉴얼 (1페이지)
- [ ] 관리자 가이드
- [ ] 배포 가이드
- [ ] 트러블슈팅 가이드
- [ ] API 문서 최종 검토

```bash
# Claude Code 명령어
"사용자 매뉴얼 작성해줘.
50대 코치가 이해하기 쉽게 스크린샷 포함
1페이지 분량, 핵심 기능만
관리자 가이드도 별도로"
```

**문서 생성 목록**:
- [ ] `docs/User_Manual.md`
- [ ] `docs/Admin_Guide.md`
- [ ] `docs/Deployment_Guide.md`
- [ ] `docs/Troubleshooting.md`
- [ ] `README.md` 업데이트

---

## 🚀 개발 시작 시퀀스

### Step 1: 백엔드 우선 🔥
```bash
# 1. 스프레드시트 템플릿 생성
"Google Spreadsheet 템플릿 생성해줘. 6개 시트에 헤더와 샘플 데이터"

# 2. 흥얼이 실제 데이터 입력
- 코치 명단 (이름, 연락처, 차량번호)
- 관리자 Gmail

# 3. Apps Script 백엔드
"Apps Script 백엔드 API 만들어줘. doPost/doGet 라우팅부터"
```

### Step 2: 프론트엔드 기본
```bash
# 4. React 프로젝트 생성
"React + Vite + Tailwind 프로젝트 만들어줘. WOOHWA 브랜딩 포함"

# 5. 인증 화면
"비밀번호 입력 화면 만들어줘. 평문 표시, 50대 친화적"
```

### Step 3: 핵심 기능
```bash
# 6. 예약 달력
"주간 예약 달력 만들어줘. 월~금 × 9-20시 × 상담실 1/2/3"

# 7. API 연결
"프론트엔드와 백엔드 연결해줘"
```

---

## ⚠️ 주의사항 & 팁

### Claude Code 요청할 때
- **구체적으로**: "50대 사용성", "WOOHWA Green", "44px 버튼" 명시
- **보안 필수**: "MOIS 보안 가이드 적용" 항상 포함
- **단계적**: 한 번에 큰 덩어리보다 컴포넌트 하나씩
- **테스트 포함**: "에러 처리", "로딩 상태" 항상 고려

### 예상 이슈 & 해결
| 이슈 | 해결책 |
|------|--------|
| Google OAuth 설정 복잡 | 단계별 가이드 문서화 |
| Apps Script CORS 에러 | 웹앱 배포 설정 재확인 |
| 모바일 터치 영역 부족 | 44px 미만 요소 전수 검토 |
| 동시 예약 충돌 | LockService 타이밍 조정 |

### 성공 기준 체크리스트
- [ ] 흥얼이가 모바일에서 3탭 이내 예약 완료
- [ ] 50대 코치가 사용법 1분 내 이해
- [ ] 관리자가 예약 현황 한눈에 확인
- [ ] 보안 테스트 통과 (XSS, 권한, Rate Limit)
- [ ] 주간 달력 로딩 3초 이내
- [ ] 모바일 가로스크롤 발생하지 않음

---

## 📞 연락처 & 참고자료

**프로젝트 오너**: 희여 코치 (흥얼, @heungall)
**브랜드**: WOOHWA (@hear_coach)
**우선순위**: 사용성 > 보안 > 성능 > 기능

**참고 문서**:
- `SRS_v1.2.md` - 요구사항 명세서
- `CLAUDE.md` - Claude Code 협업 가이드
- `API_Documentation.md` - API 명세 (Phase 1에서 생성)

---

**🎯 다음 액션**: Claude Code에서 "Google Spreadsheet 템플릿 생성해줘" 명령어 실행!

**마지막 업데이트**: 2026-04-17
