/**
 * 초기 게시글 시드 — notice / recruit / portfolio (67건)
 *
 * 사용:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-posts.mjs
 *   node scripts/seed-posts.mjs --fresh
 *   node scripts/seed-posts.mjs --prod --fresh   # .env.prod (운영 DB)
 */
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const fresh = process.argv.includes("--fresh");
const isProd = process.argv.includes("--prod");

function loadEnvFile(filename) {
  const filePath = path.join(root, filename);
  if (!fs.existsSync(filePath)) {
    console.error("환경 파일이 없습니다:", filePath);
    console.error("Vercel Production의 SUPABASE_URL·SERVICE_ROLE_KEY를 복사해 .env.prod 를 만드세요.");
    console.error("예시: .env.prod.example 참고");
    process.exit(1);
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  lines.forEach(function (line) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eq = trimmed.indexOf("=");
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  });
}

if (isProd) {
  loadEnvFile(".env.prod");
}

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

function supabaseHost(url) {
  try {
    return new URL(url).host;
  } catch (e) {
    return url;
  }
}

function portfolioPublishedAt(index) {
  const base = new Date("2024-01-01T00:00:00.000Z");
  base.setDate(base.getDate() + index);
  return base.toISOString();
}

async function main() {
  const supabaseUrl = requireEnv("SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  console.log(
    isProd ? "[prod 시드] 대상 Supabase:" : "[시드] 대상 Supabase:",
    supabaseHost(supabaseUrl)
  );

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { count: probeCount, error: probeError } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true });

  if (probeError) {
    console.error("posts 테이블 접근 실패:", probeError.message);
    if (probeError.message.includes("does not exist")) {
      console.error("→ Supabase SQL Editor에서 supabase/schema.sql 을 먼저 실행하세요.");
    }
    process.exit(1);
  }

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
  } else if (probeCount > 0) {
    console.log(
      "이미 posts가",
      probeCount,
      "건 있습니다. 재시드하려면 --fresh 옵션을 사용하세요."
    );
    process.exit(0);
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
      published_at: portfolioPublishedAt(index),
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

  const { count: finalCount, error: countError } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("시드 후 확인 실패:", countError.message);
    process.exit(1);
  }

  console.log(
    "시드 완료 — 공지",
    noticeItems.length,
    "/ 채용",
    recruitItems.length,
    "/ 실적",
    portfolioItems.length,
    "| posts 총",
    finalCount,
    "건"
  );
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
