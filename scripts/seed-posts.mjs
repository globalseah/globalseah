/**
 * 초기 게시글 시드 — notice / recruit / portfolio (67건)
 *
 * 사용:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-posts.mjs
 *   node scripts/seed-posts.mjs --fresh   # 기존 posts 전체 삭제 후 재시드
 *
 * Preview(dev) DB에 1회 실행 권장. 로컬은 .env.local 값 사용 가능.
 */
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const fresh = process.argv.includes("--fresh");

function loadLegacyWindow(relativePath) {
  const filePath = path.join(root, relativePath);
  const code = fs.readFileSync(filePath, "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox);
  return sandbox.window;
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error("환경변수가 필요합니다:", name);
    process.exit(1);
  }
  return value;
}

function portfolioPublishedAt(index, total) {
  const base = new Date("2024-01-01T00:00:00.000Z");
  base.setDate(base.getDate() + index);
  return base.toISOString();
}

async function main() {
  const supabase = createClient(
    requireEnv("SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const noticeItems = loadLegacyWindow("js/notice-data.js").SEAH_NOTICE.items;
  const recruitItems = loadLegacyWindow("js/recruit-data.js").SEAH_RECRUIT.items;
  const portfolioItems = loadLegacyWindow("js/portfolio-data.js").SEAH_PORTFOLIO.items;

  if (fresh) {
    const { error } = await supabase
      .from("posts")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) {
      console.error("기존 데이터 삭제 실패:", error.message);
      process.exit(1);
    }
    console.log("기존 posts 삭제 완료 (--fresh)");
  } else {
    const { count, error } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true });
    if (error) {
      console.error("데이터 확인 실패:", error.message);
      process.exit(1);
    }
    if (count > 0) {
      console.log(
        "이미 posts가",
        count,
        "건 있습니다. 재시드하려면 --fresh 옵션을 사용하세요."
      );
      process.exit(0);
    }
  }

  const rows = [];

  noticeItems.forEach(function (item) {
    rows.push({
      category: "notice",
      title: item.title,
      body: null,
      images: (item.images || []).slice(),
      image_url: null,
      fields: null,
      contact: null,
      content_type: null,
      status: "open",
      published_at: new Date(item.date + "T00:00:00.000Z").toISOString(),
    });
  });

  recruitItems.forEach(function (item) {
    rows.push({
      category: "recruit",
      title: item.title,
      body: item.body || "",
      images: [],
      image_url: null,
      fields: null,
      contact: item.contact || null,
      content_type: "legacy",
      status: item.status || "open",
      published_at: new Date(item.date + "T00:00:00.000Z").toISOString(),
    });
  });

  portfolioItems.forEach(function (item, index) {
    rows.push({
      category: "portfolio",
      title: item.title,
      body: null,
      images: [],
      image_url: "/assets/images/portfolio/" + item.image,
      fields: {
        facility: item.title,
        usage: item.usage,
        location: item.location,
        service: item.service,
      },
      contact: null,
      content_type: null,
      status: "open",
      published_at: portfolioPublishedAt(index, portfolioItems.length),
    });
  });

  const chunkSize = 20;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from("posts").insert(chunk);
    if (error) {
      console.error("시드 insert 실패:", error.message);
      process.exit(1);
    }
    console.log("inserted", Math.min(i + chunkSize, rows.length), "/", rows.length);
  }

  console.log(
    "시드 완료 — 공지",
    noticeItems.length,
    "/ 채용",
    recruitItems.length,
    "/ 실적",
    portfolioItems.length
  );
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
