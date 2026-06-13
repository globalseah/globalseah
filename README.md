# 글로벌세아 (GLOBAL SEAH) — corporate website

주식회사 글로벌세아 홍보용 정적 웹사이트 MVP.

| 항목 | 내용 |
|------|------|
| **상태** | MVP 1차 완료 · Phase 2(관리자·API·모바일) 대기 |
| **스택** | HTML / CSS / JavaScript (정적) |
| **미리보기** | PC 1200px 고정 (`js/site-config.js`) |

## 문서 (신규 에이전트·인수인계)

| 파일 | 용도 |
|------|------|
| **[AGENTS.md](./AGENTS.md)** | **대화 맥락·잔여 업무·코드 가이드 (먼저 읽을 것)** |
| [진행현황.md](./진행현황.md) | 완료 작업 스냅샷 |
| [기획서.md](./기획서.md) | IA·요구사항·카피 |
| [고객요청-체크리스트.md](./고객요청-체크리스트.md) | 클라이언트 자료·체크리스트 |
| [클라이언트공유-캡처방법.md](./클라이언트공유-캡처방법.md) | Playwright 캡처 |

## 로컬 실행

```bash
npm install
npx playwright install chromium   # 캡처용, 최초 1회
# index.html 브라우저에서 열기
npm run capture                   # exports/ PNG·PDF
```

## Phase 2 (미구현)

- Supabase 실적 관리자
- 문의 이메일 API (Resend/SMTP)
- 카카오 채널 URL (`kakaoUrl`)
- 모바일 반응형 (`responsive: true`)

자세한 우선순위 → [AGENTS.md §5](./AGENTS.md#5-앞으로-해야-할-업무-우선순위)
