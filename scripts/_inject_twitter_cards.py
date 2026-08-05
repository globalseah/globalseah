"""
서브페이지에 Twitter 카드 메타 태그를 삽입한다.
og:title, og:description 값을 읽어 twitter:title, twitter:description 으로 복제.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {"admin", "node_modules", "assets", "scripts"}
SKIP_FILES = {"recruit-mockup-a.html", "recruit-mockup-b.html", "logo-preview.html"}

TWITTER_IMAGE = "https://globalseah.com/assets/images/logo.png"

def extract_og(text, prop):
    m = re.search(rf'<meta\s+property="og:{prop}"\s+content="([^"]*)"', text)
    return m.group(1) if m else None

def process(path):
    text = path.read_text(encoding="utf-8")

    if "twitter:card" in text:
        print(f"  SKIP (already has twitter): {path.relative_to(ROOT)}")
        return False

    og_title = extract_og(text, "title")
    og_desc = extract_og(text, "description")

    if not og_title:
        print(f"  SKIP (no og:title): {path.relative_to(ROOT)}")
        return False

    twitter_block = (
        f'    <meta name="twitter:card" content="summary_large_image" />\n'
        f'    <meta name="twitter:title" content="{og_title}" />\n'
        f'    <meta name="twitter:description" content="{og_desc or ""}" />\n'
        f'    <meta name="twitter:image" content="{TWITTER_IMAGE}" />'
    )

    # Insert after og:image line
    og_image_pattern = re.compile(r'(<meta\s+property="og:image"[^>]*/>\s*\n)')
    m = og_image_pattern.search(text)
    if m:
        insert_pos = m.end()
        new_text = text[:insert_pos] + twitter_block + "\n" + text[insert_pos:]
        path.write_text(new_text, encoding="utf-8")
        print(f"  OK: {path.relative_to(ROOT)}")
        return True

    print(f"  SKIP (no og:image found): {path.relative_to(ROOT)}")
    return False

count = 0
for p in sorted(ROOT.rglob("*.html")):
    if any(part in SKIP_DIRS for part in p.relative_to(ROOT).parts):
        continue
    if p.name in SKIP_FILES:
        continue
    if process(p):
        count += 1

print(f"\nTotal: {count} files updated")
