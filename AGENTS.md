# 글로벌세아(seah) — 에이전트 핸드오프

**목적:** 프로젝트 분리·신규 에이전트가 대화 없이도 바로 작업에 들어갈 수 있도록 맥락·코드·잔여 업무를 정리한다.  
**갱신:** 2026-06-24  
**워크스페이스:** `seah/` (독립 Git 저장소, `Desktop/seah`)  
**운영 URL:** https://globalseah.com (Vercel, `www` → non-www 리다이렉트)  
**브랜치:** `feature/admin-page` (main 미머지)

---

## 1. 프로젝트 한 줄 요약

**주식회사 글로벌세아(GLOBAL SEAH)** — 시설·미화·방역·보안·**호텔**·인재파견 **건물관리 기업** 홍보용 웹사이트.  
**공개 사이트:** PC·모바일 반응형 완료 (2026-06-23 컨펌).  
**관리자:** `/admin` — 공지·실적·채용 CRUD + GA4 통계.  
**다음 단계:** Phase 8 운영 반영 (prod 시드 → main 배포 → 인수인계).

---

## 2. 현재 단계 (2026-06-24)

```
[완료] 공개 MVP + 모바일 반응형
[완료] Phase 0~6 관리자 CRUD + Supabase 공개 연동
[완료] Phase 7 GA4 (수집·조회·통계 UI — 클라이언트 친화 문구)
[진행] Phase 8 — prod 시드 · main 머지 · Basic Auth 전달
```

---

## 3. 최근 구현 이력

### GA4·통계 (2026-06-23~24)
- gtag (`layout.js`) + Data API (`lib/ga4-analytics.js`)
- `admin/stats.html` 상세 · `admin/index.html` 대시보드 요약
- 기본 종료일 어제, 메인 카드 확정 데이터, 「최근 30분 활성」 보조 카드
- 지역 `region`(시/도), 진단 `?debug=1`, 대시보드 콘텐츠 **n건**

### 관리자 (Phase 0~6)
- Supabase `posts` + Storage, `api/admin/*`, Basic Auth
- 공지 혼합형 · 실적 4필드 · 채용 레거시+구조화
- 공개 페이지 fetch 전환, dev 시드 67건

### 공개 사이트 (이전)
- 실적 45 · 공지 6 · 채용 16, 문의 Resend, 네이버 지도, SEO

---

## 4. 기술 스택 · 아키텍처

| 구분 | 내용 |
|------|------|
| 공개 | 정적 HTML + CSS + 바닐라 JS, Supabase anon fetch |
| 관리자 | `/admin/*` 1280px 고정, `api/admin/*` service role |
| 통계 | GA4 gtag + Data API + Realtime API |
| 배포 | Vercel, Preview=dev DB / Production=prod DB |

### 페이지 맵

```
index.html, company/, business/, portfolio/, notice/, contact/
admin/           index, notices, portfolio, recruit, stats + edit
api/             contact.js, posts.js, ga4-id.js
api/admin/       posts.js, upload.js, analytics.js, analytics-health.js
```

### 핵심 설정 (`site-config.js`)

```javascript
responsive: true,              // 모바일 반응형 완료
ga4MeasurementId: "G-NB845MCYG7",
email: "seah0905@naver.com",
phone: "070-8671-2108",
```

### GA4 Vercel env

`GA4_PROPERTY_ID`, `GA4_CLIENT_EMAIL`, `GA4_PRIVATE_KEY`, `GA4_MEASUREMENT_ID`

---

## 5. 완료 / 잔여

### 완료
- [x] 공개 사이트 PC·모바일
- [x] 관리자 CRUD 3종 + Preview 검증
- [x] GA4 통계 (이번 수준으로 완료)
- [x] 문의 API 운영

### 잔여 (Phase 8)
- [ ] prod 스키마·시드 67건
- [ ] Production env·Basic Auth 최종 계정
- [ ] `feature/admin-page` → `main` 머지
- [ ] 운영 검증 + 대표자 인수인계
- [ ] 대시보드 디자인 다듬기 (선택)
- [ ] 인증현황 나머지 증빙
- [ ] 목업 파일 삭제

상세 → [`진행현황.md`](./진행현황.md) · [`admin_page_plan.md`](./admin_page_plan.md) · [`admin/인수인계-초안.md`](./admin/인수인계-초안.md)

---

## 6. 수정 시 자주 건드리는 파일

| 작업 | 파일 |
|------|------|
| 연락처·메뉴·GA4 ID | `js/site-config.js` |
| gtag 삽입 | `js/layout.js` |
| GA4 조회 | `lib/ga4-analytics.js`, `api/admin/analytics.js` |
| 통계 UI | `admin/js/analytics-view.js`, `stats.js`, `dashboard.js` |
| 게시판 CRUD | `api/admin/posts.js`, `admin/js/*-list.js`, `*-form.js` |
| 공개 렌더 | `js/notice.js`, `portfolio.js`, `recruit.js`, `home.js` |
| 전역 스타일 | `css/styles.css`, `admin/admin.css` |

---

## 7. 로컬 작업

```bash
npm install
npx playwright install chromium   # 최초 1회
npm run capture                   # exports/ PNG·PDF
npm run seed:posts -- --fresh     # dev/prod 시드 (env 확인 필수)
```

---

## 8. 문서 읽는 순서

1. **본 문서** (`AGENTS.md`)
2. [`진행현황.md`](./진행현황.md)
3. [`admin_page_plan.md`](./admin_page_plan.md) — Phase 8 체크리스트
4. [`고객요청-체크리스트.md`](./고객요청-체크리스트.md)

---

## 9. 커뮤니케이션 규칙

- **한국어** 설명 우선
- 코드 수정 전 **계획 → "진행해" 동의**
- 커밋·PR은 **명시 요청 시에만**
