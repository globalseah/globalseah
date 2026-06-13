# 글로벌세아(seah) — 에이전트 핸드오프

**목적:** 프로젝트 분리·신규 에이전트가 대화 없이도 바로 작업에 들어갈 수 있도록 맥락·코드·잔여 업무를 정리한다.  
**갱신:** 2026-06-13  
**워크스페이스:** `seah/` (독립 Git 저장소, `Desktop/seah`)

---

## 1. 프로젝트 한 줄 요약

**주식회사 글로벌세아(GLOBAL SEAH)** — 시설·미화·보안·방역·인재파견 **건물관리 기업** 홍보용 **정적 웹사이트(MVP)**.  
클라이언트 미리보기용 **PC 1200px 고정** 모드로 구현됨. DB·관리자·메일 API는 **Phase 2**.

---

## 2. 대화·작업 맥락 요약 (히스토리)

### 2.1 출발점

- 레퍼런스: taejinbm, sjasset — **톤만 참고**, 레이아웃·메뉴명은 차별화
- 브랜드: **초록 CI** (`--green-900` #145a2e)
- MVP: 전 메뉴 정적 HTML, 실적만 추후 **클라이언트 직접 업로드**(Supabase)
- 회원 DB·콘텐츠 유지보수 대행 **제외**

### 2.2 확정된 디자인·구조

| 영역 | 결정 |
|------|------|
| 메인 레이아웃 | **시안 B** — 히어로 → 사업 5종 아이콘 카드 → 3열(공지·실적·문의 3배너) |
| 헤더 | `headlogo.png`, 흰 배경 + 초록 GNB(800), 5메뉴 균등 |
| 서브 배너 | 전 페이지 `.page-hero` — `hero-sub.jpg` + 연한 초록 그라데이션 |
| 회사소개 | **좌측 세로 서브메뉴** + 우측 콘텐츠 |
| PC 미리보기 | `site-config.js` → `responsive: false`, `desktopViewportWidth: 1200` |

### 2.3 주요 구현 이력 (시행착오 포함)

1. **메인 히어로·사업·문의 카피** — 클라이언트 확정 문구 반영 (문의 배너 2줄, 제목 없음)
2. **메인 사업 아이콘** — PNG(Icons8) 시도 → **클라이언트 불만 → SVG 롤백**. 미화만 빗자루 SVG 개선(털결 7줄)
3. **문의 배너** — 2개→3개(카카오·이메일·전화). 전화는 `tel:` 링크 **없음**, 번호만 표시
4. **문의 상세** — 우측 연락처 박스 제거, **폼만** 중앙
5. **실적** — 6건 예시, `portfolio/01~06.jpg`, 페이지네이션 없음
6. **경영방침** — HTML SVG 다이어그램 → **Gemini PNG 3장** (`company/vision, she, ops-6steps`)
7. **조직도** — `organization-chart.png` 적용. `max-width:680px` 제거. PNG **내장 여백** 이슈(재크롭 또는 scale 검토)

### 2.4 사용자(개발자) 커�unication 규칙

- **한국어**로 설명 우선
- 코드 수정 전 **계획 설명 → "진행해" 동의** 후 구현 (급하게 코드부터 X)
- 커밋·PR은 **명시 요청 시에만**

---

## 3. 기술 스택 · 아키텍처

| 구분 | 내용 |
|------|------|
| MVP | 정적 HTML + CSS + 바닐라 JS |
| 설정 허브 | `js/site-config.js` — 연락처, nav, kakaoUrl, responsive |
| 레이아웃 | `js/layout.js` — 헤더·푸터 주입 |
| 뷰포트 | `js/viewport.js` — PC 고정 폭 |
| 스타일 | `css/styles.css` (~2200줄, 단일 파일) |
| 캡처 | Playwright — `npm run capture` → `exports/` |
| Phase 2 | Supabase(실적), Resend/SMTP(문의), `/admin` |

### 페이지 맵

```
index.html
company/   greeting, philosophy, organization, certification, location
business/  facility, cleaning, security, disinfection, staffing
portfolio/ index.html + js/portfolio.js
notice/    index.html (정적)
contact/   index.html + js/contact.js
```

### 핵심 설정 (`site-config.js`)

```javascript
responsive: false,           // true → 모바일 반응형 전환
desktopViewportWidth: 1200,
kakaoUrl: "",                // 채널 URL 확정 후 입력
email: "seah0905@naver.com",
phone: "070-8671-2108",
```

---

## 4. 현재 완료 상태 (MVP 1차)

- [x] 전 메뉴 HTML 골격
- [x] 메인·회사소개(인사말·경영방침·조직도)·사업 5종·실적·문의·공지
- [x] 연락처·주소 `site-config.js` 반영
- [x] 경영방침·조직도 PNG
- [x] 문의 폼 (유형 5종, mailto MVP)
- [ ] 인증현황·찾아오시는길 **상세 콘텐츠**
- [ ] Phase 2 전부

상세 체크리스트 → [`고객요청-체크리스트.md`](./고객요청-체크리스트.md)  
완료 내역 스냅샷 → [`진행현황.md`](./진행현황.md)

---

## 5. 앞으로 해야 할 업무 (우선순위)

### P0 — 클라이언트 오픈 전

| # | 업무 | 파일·비고 |
|---|------|-----------|
| 1 | **카카오 채널 URL** 연동 | `site-config.js` → `kakaoUrl`, `js/home.js` 자동 링크 |
| 2 | **문의 이메일 API** | `js/contact.js` + 서버(Resend/SMTP). 현재 mailto/안내 문구만 |
| 3 | **인증현황** 콘텐츠 | `company/certification.html` |
| 4 | **찾아오시는길** 지도·교통 | `company/location.html` |
| 5 | **조직도 표시 크기** | `organization-chart.png` 여백 크롭 또는 `.org-chart-img` scale |
| 6 | 메인 하단 썸네일 **외부 URL 제거** | `css/styles.css` `.home-info-thumb` Unsplash → 로컬 |

### P1 — Phase 2 기능

| # | 업무 | 비고 |
|---|------|------|
| 7 | **실적 관리자** | Supabase + `/admin` CRUD, `portfolio.js` API 연동 |
| 8 | **공지 관리** | 정적 유지 vs 관리자 — 클라이언트 합의 필요 |
| 9 | **모바일 반응형** | `responsive: true` + CSS `@media` 점검 |
| 10 | **배포** | 도메인·SSL·호스팅, 스테이징 URL |

### P2 — 정리·운영

| # | 업무 |
|---|------|
| 11 | `assets/images/icons/` 미사용 PNG 삭제 |
| 12 | `organization_chart.svg`, `.png.bak` 정리(백업 정책 확인 후) |
| 13 | 클라이언트 캡처 전달 — `npm run capture` |
| 14 | 실적·공지 **실데이터**로 교체 |

---

## 6. 수정 시 자주 건드리는 파일

| 작업 | 파일 |
|------|------|
| 연락처·메뉴·카카오 URL | `js/site-config.js` |
| 헤더·푸터 | `js/layout.js` |
| 전역 스타일 | `css/styles.css` |
| 메인 카피·배너 | `index.html` |
| 경영방침 이미지 | `company/philosophy.html`, `assets/images/company/*.png` |
| 조직도 | `company/organization.html`, `assets/images/company/organization-chart.png` |
| 실적 데이터(MVP) | `js/portfolio.js` |
| 문의 폼 | `contact/index.html`, `js/contact.js` |

---

## 7. 에셋 규칙

```
assets/images/
  headlogo.png, hero-main.jpg, hero-sub.jpg, Kakao_logo.jpg
  company/          # vision, she, ops-6steps, organization-chart
  business/         # facility~staffing.jpg
  portfolio/        # 01~06.jpg
```

- 경영방침 PNG 비율 참고: vision **5:1**, she **4:1**, ops **8:3**, 조직도 **3:2**
- Gemini 이미지 교체 시 **파일명 유지**하면 HTML 수정 최소화

---

## 8. 로컬 작업

```bash
cd seah
npm install
npx playwright install chromium   # 최초 1회
npm run capture                   # exports/ PNG·PDF
```

브라우저: `index.html` 직접 열기 또는 Live Server.  
`responsive: false`이므로 **1200px 폭** 기준으로 검수.

---

## 9. 관련 문서 읽는 순서

1. **본 문서** (`AGENTS.md`) — 맥락·잔여 업무
2. [`진행현황.md`](./진행현황.md) — 완료 스냅샷
3. [`기획서.md`](./기획서.md) — IA·카피·기술 결정
4. [`고객요청-체크리스트.md`](./고객요청-체크리스트.md) — 클라이언트 자료·체크
5. [`클라이언트공유-캡처방법.md`](./클라이언트공유-캡처방법.md)

---

## 10. 알려진 이슈

1. **조직도 PNG** — 이미지 파일 내부 여백이 커서 화면상 작게 보일 수 있음
2. **경영방침 PNG** — Gemini 생성 텍스트 깨짐 가능 → 재생성 또는 HTML 텍스트 병행 검토
3. **contact.js** — 서버 없이 mailto; Phase 2에서 교체 필요
4. **portfolio.js** — 하드코oded 6건; Supabase 연동 시 전면 교체

---

## 11. anti_blog와의 관계

이 프로젝트는 **`anti_blog` 모노레포에서 분리**되어 `Desktop/seah` 단독 Git 저장소로 운영한다.  
`anti_blog/seah` 경로는 **더 이상 사용하지 않음**. 작업·문서·에셋은 **본 저장소 기준**.
