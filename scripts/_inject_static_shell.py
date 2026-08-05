"""
모든 공개 HTML에 정적 헤더·푸터를 삽입하고,
layout.js가 중복 없이 동적 버전으로 교체하도록 한다.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SKIP_DIRS = {"admin", "node_modules", "assets", "scripts"}
SKIP_FILES = {"recruit-mockup-a.html", "recruit-mockup-b.html", "logo-preview.html"}

MARKER = "<!-- static-shell -->"

def base_prefix(depth):
    return "" if depth == 0 else "../" * depth

def header_html(base):
    return f"""{MARKER}
    <header class="site-header" data-static>
      <div class="header-main">
        <div class="header-main-inner">
          <a href="{base}index.html" class="brand" aria-label="글로벌세아 홈">
            <img src="{base}assets/images/headlogo.png" alt="(주)글로벌세아" class="brand-logo brand-logo--default" />
          </a>
          <nav class="main-nav" aria-label="주 메뉴">
            <ul>
              <li class="nav-item"><a href="{base}company/greeting.html" class="nav-link">회사소개</a></li>
              <li class="nav-item"><a href="{base}business/facility.html" class="nav-link">사업부문</a></li>
              <li class="nav-item"><a href="{base}portfolio/index.html" class="nav-link">실적현황</a></li>
              <li class="nav-item"><a href="{base}notice/index.html" class="nav-link">공지 및 채용현황</a></li>
              <li class="nav-item"><a href="{base}contact/index.html" class="nav-link">견적 및 상담문의</a></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>"""

def footer_html(base):
    return f"""    <footer class="site-footer" data-static>
      <div class="footer-nav-bar">
        <div class="footer-nav-inner">
          <a href="{base}company/greeting.html">회사소개</a>
          <span aria-hidden="true">|</span>
          <a href="{base}portfolio/index.html">실적현황</a>
          <span aria-hidden="true">|</span>
          <a href="{base}notice/index.html">공지사항</a>
          <span aria-hidden="true">|</span>
          <a href="{base}contact/index.html">견적 및 상담문의</a>
          <span aria-hidden="true">|</span>
          <a href="{base}company/location.html">찾아오시는길</a>
        </div>
      </div>
      <div class="footer-body">
        <div class="footer-body-inner">
          <p class="footer-company-line">
            <strong>글로벌세아</strong> (GLOBAL SEAH)<br />
            경기도 부천시 상동 547-1, (코오롱파크뷰 306호)
          </p>
          <p class="footer-company-line">대표이사 임수현 · 사업자등록번호 866-88-03083</p>
          <p class="footer-company-line">TEL 070-8671-2108 · FAX 070-8224-2108 · E-mail seah0905@naver.com</p>
        </div>
      </div>
    </footer>
    {MARKER}"""

def get_depth(text):
    m = re.search(r'data-depth="(\d+)"', text)
    return int(m.group(1)) if m else 0

def process(path):
    text = path.read_text(encoding="utf-8")

    if MARKER in text:
        print(f"  SKIP (already has static shell): {path.relative_to(ROOT)}")
        return False

    depth = get_depth(text)
    base = base_prefix(depth)

    # Insert header after <body ...>
    body_pat = re.compile(r'(<body[^>]*>)\s*\n', re.IGNORECASE)
    m = body_pat.search(text)
    if not m:
        print(f"  SKIP (no <body> found): {path.relative_to(ROOT)}")
        return False

    insert_pos = m.end()
    header = header_html(base)

    # Insert footer before first <script in body (after </main>)
    main_close = text.find("</main>", insert_pos)
    if main_close == -1:
        print(f"  SKIP (no </main> found): {path.relative_to(ROOT)}")
        return False

    footer_pos = main_close + len("</main>")
    footer = "\n" + footer_html(base) + "\n"

    new_text = text[:insert_pos] + header + "\n" + text[insert_pos:footer_pos] + footer + text[footer_pos:]
    path.write_text(new_text, encoding="utf-8")
    print(f"  OK depth={depth}: {path.relative_to(ROOT)}")
    return True

count = 0
for p in sorted(ROOT.rglob("*.html")):
    if any(part in SKIP_DIRS for part in p.relative_to(ROOT).parts):
        continue
    if p.name in SKIP_FILES:
        continue
    if process(p):
        count += 1

print(f"\nTotal: {count} files updated")
