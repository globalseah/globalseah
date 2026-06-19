# 글로벌세아(seah) — 에이전트 핸드오프

**목적:** 프로젝트 분리·신규 에이전트가 대화 없이도 바로 작업에 들어갈 수 있도록 맥락·코드·잔여 업무를 정리한다.  
**갱신:** 2026-06-19  
**워크스페이스:** `seah/` (독립 Git 저장소, `Desktop/seah`)  
**운영 URL:** https://globalseah.com (Vercel, `www` → non-www 리다이렉트)

---

## 1. 프로젝트 한 줄 요약

**주식회사 글로벌세아(GLOBAL SEAH)** — 시설·미화·방역·보안·**호텔**·인재파견 **건물관리 기업** 홍보용 **정적 웹사이트**.  
**PC 1280px 고정 MVP 거의 최종 확정** (`responsive: false`).  
**다음 단계: 모바일 반응형.**  
문의 메일 API(Resend) 운영 중. 공지·채용·실적 데이터는 JS 하드코딩 → Phase 2 관리자(Supabase).

---

## 2. 현재 단계 (2026-06-19)

```
[완료] PC MVP 콘텐츠·게시판·SEO·지도·문의 API
[진행 예정] 모바일 반응형 (responsive: true)
[대기] Phase 2 관리자 CRUD
```

---

## 3. 주요 구현 이력 (누적)

### 초기 MVP (2026-06)
- 시안 B 메인, 회사소개·사업 5종, PC 고정 1280px
- 경영방침·조직도 PNG, 문의 폼 + Resend API
- 방역 → **호텔관리**, PC `desktop-only` 브레이크포인트 격리

### 콘텐츠·SEO·지도 (2026-06-18)
- 네이버 지도 API (동적 로드, Referer 이슈 해결)
- 서치어드바이저, sitemap, robots, 메타 태그
- 인증 신용평가, 찾아오시는길 교통·주차

### 게시판·실적·문의 (2026-06-19)
- **실적 45건** — 페이지네이션, 호버 사업내용, 메인 15건 마퀴
- **공지 6건** — 이미지 상세, 이전/다음, 10건 페이지네이션
- **채용 16건** — A안 텍스트 상세, 마감 `[마감]` 뒤 표기, 10건 페이지네이션
- 문의: 이메일/연락처 택1, 사업부문 필수
- **미화·방역 관리** 명칭, 히어로 `hero-main1.png`
- head 사이트명 **글로벌세아종합관리** (본문 `(주)글로벌세아` 유지)

---

## 4. 기술 스택 · 아키텍처

| 구분 | 내용 |
|------|------|
| MVP | 정적 HTML + CSS + 바닐라 JS |
| 설정 | `js/site-config.js` — 연락처, nav, map, responsive |
| 레이아웃 | `js/layout.js`, `js/viewport.js` |
| 스타일 | `css/styles.css` (~3100줄) |
| 동적 데이터 | `*-data.js` + `*.js` 렌더러 |
| 페이지네이션 | `js/board-pagination.js` (공지·채용 10건) |
| 문의 | Resend + `api/contact.js` |
| Phase 2 | Supabase + `/admin` |

### 페이지 맵

```
index.html
company/     greeting, philosophy, organization, certification, location
business/    facility, cleaning, security, hotel, staffing
portfolio/   index.html + js/portfolio-data.js
notice/      index.html, view.html          # 공지
             recruit.html, recruit/view.html  # 채용
contact/     index.html + js/contact.js
api/         contact.js
sitemap.xml, robots.txt
```

### 핵심 설정 (`site-config.js`)

```javascript
responsive: false,           // → 모바일 작업 시 true
desktopViewportWidth: 1280,
kakaoUrl: "",
email: "seah0905@naver.com",
phone: "070-8671-2108",
naverMapKeyId: "…",
```

---

## 5. 완료 / 잔여

### 완료 (PC)
- [x] 전 메뉴 + 실데이터 (실적·공지·채용)
- [x] 문의 API, 개인정보 동의, 사업부문 선택
- [x] 네이버 지도, SEO 메타 전 페이지
- [x] PC 고정 레이아웃 최종

### 잔여
- [ ] **모바일 반응형** (P0)
- [x] `CONTACT_TO_EMAIL` 운영 전환 (Vercel) — **수신 확인 완료**
- [ ] Phase 2 관리자 CRUD
- [ ] 인증현황 나머지 증빙
- [ ] 목업 파일 삭제 (`notice/recruit-mockup-*.html`)

상세 → [`진행현황.md`](./진행현황.md) · [`고객요청-체크리스트.md`](./고객요청-체크리스트.md)

---

## 6. 수정 시 자주 건드리는 파일

| 작업 | 파일 |
|------|------|
| 연락처·메뉴 | `js/site-config.js` |
| 실적 데이터 | `js/portfolio-data.js` |
| 공지 데이터 | `js/notice-data.js` |
| 채용 데이터 | `js/recruit-data.js` |
| 목록 페이지네이션 | `js/board-pagination.js`, `notice.js`, `recruit.js` |
| 문의 폼 | `contact/index.html`, `js/contact.js`, `api/contact.js` |
| 전역 스타일 | `css/styles.css` |
| 모바일 전환 | `site-config.js` `responsive: true` + `styles.css` — **상세 계획: `기획서.md` §7.1~7.8** |

---

## 7. 에셋 규칙

```
assets/images/
  headlogo.png, hero-main1.png, hero-sub.jpg, logo.png
  company/     vision, she, ops-6steps, organization-chart, cert/
  business/    facility, cleaning, security, hotel, staffing
  portfolio/   01~46.png (45건 사용)
  notice/      01.jpg ~ 09.png
```

---

## 8. 로컬 작업

```bash
npm install
npx playwright install chromium   # 최초 1회
npm run capture                   # exports/ PNG·PDF
```

`responsive: false` → **1280px** 기준 검수.  
로컬에서 네이버 지도는 도메인 미등록 시 미표시 정상.

---

## 9. 문서 읽는 순서

1. **본 문서** (`AGENTS.md`)
2. [`진행현황.md`](./진행현황.md) — 최신 완료 스냅샷
3. [`고객요청-체크리스트.md`](./고객요청-체크리스트.md)
4. [`기획서.md`](./기획서.md) — IA·기술 결정

---

## 10. 알려진 이슈

1. 조직도 PNG 내장 여백 — 화면상 작게 보일 수 있음
2. 인사말 「소독 분야」 — 사업 변경과 불일치 시 수정 검토
3. `recruit-mockup-a/b.html` — 클라이언트 검토용, 삭제 가능
4. 검색 노출 — 서치어드바이저 등록 완료, 색인까지 시간 소요

---

## 11. 커뮤니케이션 규칙

- **한국어** 설명 우선
- 코드 수정 전 **계획 → "진행해" 동의**
- 커밋·PR은 **명시 요청 시에만**

---

## 12. anti_blog와의 관계

`anti_blog/seah` 경로 **미사용**. `Desktop/seah` 단독 저장소 기준.
