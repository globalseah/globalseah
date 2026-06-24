# 글로벌세아종합관리 홈페이지 — 관리자페이지 구축 기획서

**작성:** JD  
**버전:** v3 (최종 — 개발 착수용)  
**갱신:** 2026-06-24  
**상태:** 기획·의사결정 완료 → Phase 0 구현 대기

**선행 완료:** PC 공개 사이트 MVP · 모바일 반응형(2026-06-23 클라이언트 컨펌)

---

## 1. 프로젝트 개요

기존 [globalseah.com](https://globalseah.com) 사이트(문의 메일 API 운영 중)에 **관리자페이지**를 추가한다. 클라이언트가 공지사항·실적현황·채용현황을 직접 CRUD하고, GA4 기반 방문 통계를 같은 관리자 영역에서 조회한다.

### 1-1. 핵심 목적

- 공지사항 · 실적현황 · 채용현황 3개 게시판 — 외부 유지보수 없이 직접 작성·수정·삭제
- GA4 연동 — 방문자 수 · 유입경로 등 핵심 지표를 관리자 화면에서 조회

### 1-2. v3 변경 요약 (v2 대비)

| 항목 | v2 | v3 (최종) |
|------|-----|-----------|
| 공지사항 | 자유 텍스트 | **혼합형** — 텍스트 + 이미지(복수), 최소 1개 필수 |
| 초기 데이터 | (미정) | **1회 시드** 67건 → Supabase (`*-data.js` 대체) |
| 채용 마감 | (미언급) | 관리자 **토글 없음** — 시드된 기존 마감 1건만 표시 유지 |
| 채용 제목 | (미언급) | **자유 텍스트** 1칸 (드롭다운·지역 데이터셋 없음) |
| 목록 정렬 | (미언급) | 실적·공지·채용 **전부 등록일 최신순** |
| DB 환경 | Preview 테스트 | **Supabase dev + prod** 분리 (Vercel 1개) |
| 관리자 UI | (미언급) | **1280px 고정**, 반응형 없음 |
| Basic Auth | 1계정 | 개발 **완료 후** 대표자에게 최종 ID/PW 전달 |
| GA4 | 단계만 정의 | 클라이언트 구글 계정 **2026-06-25** 속성 생성 예정 |

---

## 2. 게시판 관리 기능

### 2-1. 게시판별 형식 — 최종 확정

| 게시판 | 형식 | 상세페이지 | 비고 |
|--------|------|------------|------|
| 공지사항 | **혼합형** (텍스트 + 이미지) | 있음 | 본문·이미지 각각 선택, **둘 다 비면 등록 불가** |
| 실적현황 | 구조화 (카드 그리드) | 없음 | 이미지 필수, 카드가 정보의 끝 |
| 채용현황 | **이중 형식** (레거시 + 구조화) | 있음 | 기존 16건 레거시 유지, 신규만 구조화 |

### 2-2. 공지사항 — 입력 항목 및 화면 구성

**확정: C 혼합형** — 한 공지에 텍스트와 이미지를 동시에 넣을 수 있다.

| 입력 항목 | 필수 여부 | 비고 |
|-----------|-----------|------|
| 제목 | 필수 | |
| 텍스트 본문 | 선택 | 없어도 됨 |
| 이미지 | 선택 (복수 업로드) | 없어도 됨 |
| 등록일 | 필수 | 목록·상세 표시, 정렬 기준 |

**검증:** 텍스트 본문과 이미지가 **모두 비어 있으면** 저장 불가.

**상세 화면 렌더 순서:** 텍스트(있으면) → 이미지(있으면, 복수 figure).

**기존 6건:** 이미지 전용 — `body` 없이 `images`만 있는 상태로 시드. 공개 화면 동작 유지.

### 2-3. 실적현황 — 입력 항목 및 화면 구성

목록: 5열 카드 그리드. 기본은 이미지만, 호버/터치 시 시설명·용도·위치·사업내용 오버레이. 페이지네이션. **상세페이지 없음.**

| 입력 항목 | 필수 | DB `fields` 키 | 비고 |
|-----------|------|----------------|------|
| 이미지 | 필수 | — (`image_url`) | 카드 썸네일·배경 |
| 시설명 | 필수 | `facility` | 기존 `title`에 대응 |
| 용도 | 필수 | `usage` | 예: 호텔, 아파트 |
| 위치 | 필수 | `location` | 자유 텍스트 |
| 사업내용 | 필수 | `service` | 예: 객실관리, 시설관리 |

**정렬:** `published_at` 내림차순 (최신이 맨 앞). 드래그 정렬·`sort_order` 없음.

### 2-4. 채용현황 — 이중 형식

#### A. 레거시 (기존 16건 + 시드)

- `content_type: legacy`
- `body` 자유 텍스트 (기존 `recruit-data.js`와 동일)
- `contact`: `{ role, phone }` — 문의연락처 필수
- 상세: 지금처럼 plain text 블록
- 관리자 수정 시: 제목 + body textarea + 문의연락처

#### B. 구조화 (신규 작성분)

- `content_type: structured`
- `fields` JSON — 8개 항목, **전부 자유 텍스트 입력** (드롭다운 없음)
- 상세: 항목명(좌) + 내용(우) 2컬럼, **미입력 항목 줄 자체 숨김**

| 순서 | 항목명 | 필수 |
|------|--------|------|
| 1 | 근무지 | 선택 |
| 2 | 업무내용 | 선택 |
| 3 | 근무시간 | 선택 |
| 4 | 근무조건 | 선택 |
| 5 | 급여조건 | 선택 |
| 6 | 기타조건 | 선택 |
| 7 | 복리후생 | 선택 |
| 8 | 특이사항 | 선택 |
| — | 문의연락처 | **필수** (`contact`) |

**제목:** 목록·메인·이전/다음용 **자유 텍스트 1칸** 필수. 예: `[인선서구] 청라병원 미화원 채용건`

**형식 자동 변환 없음** — 레거시 → 구조화 전환은 관리자가 8항목에 **수동 재입력**.

#### 마감 상태 (3번 확정)

- 관리자에 **모집중/마감 토글 없음**
- 신규·수정 글은 항상 `status: open`으로 저장
- 시드 시 기존 `closed` 1건(id 15)은 DB 값 그대로 이관
- 공개 화면: 기존 `listTitle()` `[마감]` 표기·상세 배지 로직은 **코드에 유지** (시드 데이터만 반영)

**정렬:** `published_at` 내림차순.

---

## 3. 데이터 구조 (Supabase)

### 3-1. 테이블 `posts` (통합)

| 컬럼 | 타입 | 용도 |
|------|------|------|
| `id` | uuid PK | |
| `category` | text | `notice` \| `portfolio` \| `recruit` |
| `title` | text | 공지·채용 제목 / 실적 시설명은 `fields.facility` 병행 |
| `body` | text | 공지 텍스트 · 채용 레거시 본문 |
| `fields` | jsonb | 실적 4필드 · 채용 구조화 8필드 |
| `images` | text[] | 공지 이미지 URL 배열 |
| `image_url` | text | 실적 단일 이미지 |
| `contact` | jsonb | 채용 `{ role, phone }` |
| `content_type` | text | 채용: `legacy` \| `structured` |
| `status` | text | 채용: `open` \| `closed` (관리자 UI 없음) |
| `published_at` | timestamptz | 등록일·**정렬 기준** |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### 3-2. Storage

- 버킷: `notice/`, `portfolio/` 경로 분리
- dev / prod **버킷 각각** (Preview 업로드가 운영 이미지와 섞이지 않도록)

### 3-3. RLS · API

- 공개: `SELECT`만 (anon key)
- 쓰기: **서버리스 API** + service role (`api/admin/*`) — Basic Auth와 별도로 서버에서 처리
- 관리자 브라우저에 service role 노출 금지

### 3-4. 초기 데이터 — 1회 시드

| 게시판 | 건수 | 시드 방식 |
|--------|------|-----------|
| 공지 | 6 | `notice-data.js` → `body`/`images`, 이미지 URL은 기존 `assets/images/notice/` |
| 채용 | 16 | `recruit-data.js` → `content_type: legacy`, `status` 포함 |
| 실적 | 45 | `portfolio-data.js` → `fields` + `image_url` |

- 동일 시드 스크립트, `--target dev` / `--target prod`
- **dev:** 개발·Preview용 (먼저 실행)
- **prod:** main 배포 직전 1회
- 이후 `*-data.js`는 제거 또는 빈 fallback

---

## 4. 관리자 화면 구성

### 4-1. 레이아웃

- 경로: `/admin/*`
- **1280px 고정** (`admin/admin.css`) — 반응형·모바일 최적화 **범위 외**
- 메뉴: 대시보드 · 공지 · 실적 · 채용 · 통계(GA4)

### 4-2. 화면별 기능

| 화면 | 기능 |
|------|------|
| 인증 | Basic Auth — 브라우저 기본 팝업 (별도 로그인 UI 없음) |
| 게시판 목록 | 카테고리별 글 목록 (최신순), 글쓰기·수정·삭제 |
| 공지 작성/수정 | 제목, 등록일, 텍스트 본문, 이미지 다중 업로드 |
| 실적 작성/수정 | 이미지 + 시설명·용도·위치·사업내용 (전부 필수) |
| 채용 작성 | 제목, 등록일, 8항목(자유 텍스트), 문의연락처 |
| 채용 수정 (레거시) | 제목, 등록일, body textarea, 문의연락처 |
| 채용 수정 (구조화) | 제목, 등록일, 8항목, 문의연락처 |
| 통계 | GA4 Data API 기반 (Phase 7) |

### 4-3. 접근 보안

- Vercel Middleware — `/admin` 및 `api/admin/*` Basic Auth
- 환경변수: `ADMIN_USER`, `ADMIN_PASS` (Vercel Production·Preview 각 설정 가능)
- **최종 계정 정보는 개발 완료·배포 후 대표자에게 전달**
- `robots.txt` — `Disallow: /admin`

---

## 5. 트래픽 통계 (GA4)

### 5-1. 방식

GA4 속성(클라이언트 구글 계정) + gtag.js 수집 + GA4 Data API 조회. 별도 DB에 통계 저장하지 않음.

### 5-2. 일정·주체

| 단계 | 내용 | 주체 | 시점 |
|------|------|------|------|
| 1 | GA4 속성 생성 | 클라이언트 + JD | **2026-06-25** 예정 |
| 2 | JD 이메일 GA4 관리자 권한 | 클라이언트 | 속성 생성 직후 |
| 3 | 전 페이지 gtag.js (`layout.js`) | 개발 | Phase 7 |
| 4 | Data API + 서비스 계정 키 | JD | Phase 7 |
| 5 | `api/admin/analytics.js` | 개발 | Phase 7 |
| 6 | `admin/stats.html` 통계 화면 | 개발 | Phase 7 |

### 5-3. 표시 지표

- 기간별 방문자 수
- 유입경로 (직접 / 검색 / 소셜 / 리퍼럴 등)
- 페이지별 방문 현황
- 기기 · 지역별 통계

---

## 6. 환경 분리 · 배포

### 6-1. 구조 (옵션 B — 확정)

```
Vercel 프로젝트 1개 (globalseah.com)
├── Production (main)  → Supabase prod + prod Storage
└── Preview (브랜치)   → Supabase dev  + dev Storage

클라이언트 노출: globalseah.com /admin 만 (Preview URL은 JD 내부 테스트용)
```

| 환경 | URL | Supabase |
|------|-----|----------|
| Production | globalseah.com | prod |
| Preview | `*.vercel.app` | dev |

Vercel Environment Variables — `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`를 Production / Preview에 분리 설정.

> Supabase 무료 플랜 **프로젝트 2개** 동시 운영 가능 여부는 구현 시 대시보드에서 최종 확인.

### 6-2. 작업 흐름

1. `feature/admin-page` 브랜치 생성 후 작업
2. push → Vercel Preview URL 자동 생성 (dev DB 연결)
3. Preview에서 CRUD·공개 화면·통계 전 기능 테스트
4. main 머지 전 prod에 스키마 + 시드 67건
5. main 머지 → globalseah.com 반영
6. Basic Auth 계정 대표자 전달
7. dev 테스트 데이터는 필요 시 정리 (운영에 영향 없음)

---

## 7. 구현 Phase

| Phase | 내용 | 산출물 | 비고 |
|-------|------|--------|------|
| **0** | Supabase dev/prod 생성, 스키마·Storage·RLS, Vercel env | DB·버킷·env | 6번 실무 시작 |
| **1** | 서버 API 골격 | `api/admin/posts.js`, `api/admin/upload.js`, Supabase 헬퍼 | service role 서버 전용 |
| **2** | 접근 통제 · 관리자 셸 | Middleware Basic Auth, `robots.txt`, `admin/` 레이아웃, `admin.css` 1280px | 계정 env는 배포 직전 |
| **3** | 관리자 CRUD — 공지 | 혼합형 폼 (텍스트+이미지) | |
| **4** | 관리자 CRUD — 실적 | 이미지+4필드 폼 | |
| **5** | 관리자 CRUD — 채용 | 신규 구조화 + 레거시 수정 폼 | 마감 토글 없음 |
| **6** | 공개 사이트 연동 | `notice`·`portfolio`·`recruit`·`home` fetch 전환, 시드 스크립트, `*-data.js` 정리 | 최신순 정렬 |
| **7** | GA4 | gtag 삽입, Data API, `admin/stats.html` | GA4 속성·서비스 계정 후 |
| **8** | 테스트 · 운영 반영 | Preview 검증 → prod 시드 → main 배포 → 계정 전달 | |

### Phase 의존 관계

```
Phase 0 → 1 → 2 → {3, 4, 5 병행 가능} → 6 → 8
Phase 0 → 7 (GA4 계정 준비 후, 2 완료 후 통계 UI) → 8
```

---

## 8. 예상 작업 시간 (참고)

| 작업 | 예상 |
|------|------|
| Phase 0–1 인프라·API | 1~2시간 |
| Phase 2 Auth·셸 | 30분~1시간 |
| Phase 3–5 관리자 CRUD 3종 | 4~6시간 |
| Phase 6 공개 연동·시드 | 2~3시간 |
| Phase 7 GA4 | 3~5시간 |
| Phase 8 테스트·배포 | 1~2시간 |

**전체 약 12~19시간 (2~3일).** GA4 인증·dev/prod env 설정·채용 이중 형식 분기에서 변동 가능.

---

## 9. 확정 사항 요약 (체크리스트)

- [x] 관리자: 대표자 1계정, Basic Auth, **완료 후** 계정 전달
- [x] 공지: **혼합형** (텍스트 + 이미지 복수)
- [x] 실적: 이미지 필수 + 4필드 구조화, 카드 그리드, 상세 없음, **최신순**
- [x] 채용: 신규 8항목 구조화 + 레거시 16건 유지, 제목 자유 텍스트, **마감 토글 없음**, **최신순**
- [x] 초기 데이터: **1회 시드** (dev → prod)
- [x] DB: **Supabase dev + prod**, Vercel 1개
- [x] 관리자 UI: **1280px 고정**, 모바일 미구현
- [x] 모바일 공개 사이트: **완료·컨펌** (관리자 작업과 병행 종료)
- [ ] GA4 속성 생성 — **2026-06-25** 예정
- [ ] Supabase 2프로젝트 한도 — 구현 시 확인

---

## 10. 관련 파일 (구현 시)

| 작업 | 파일 |
|------|------|
| 시드 원본 | `js/notice-data.js`, `js/recruit-data.js`, `js/portfolio-data.js` |
| 공개 렌더 | `js/notice.js`, `js/notice-detail.js`, `js/recruit.js`, `js/recruit-detail.js`, `js/portfolio*.js`, `js/home.js` |
| 문의 API 참고 | `api/contact.js` |
| 배포 | `vercel.json`, Vercel Middleware |
| 설정 | Vercel env, `robots.txt` |
