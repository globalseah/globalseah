const { createClient } = require("@supabase/supabase-js");

const SITE = "https://globalseah.com";

const STATIC_URLS = [
  { loc: "/", lastmod: "2026-07-09", changefreq: "weekly", priority: "1.0" },
  { loc: "/company/greeting.html", lastmod: "2026-06-17", changefreq: "monthly", priority: "0.8" },
  { loc: "/company/philosophy.html", lastmod: "2026-06-13", changefreq: "monthly", priority: "0.8" },
  { loc: "/company/organization.html", lastmod: "2026-06-13", changefreq: "monthly", priority: "0.8" },
  { loc: "/company/certification.html", lastmod: "2026-06-17", changefreq: "monthly", priority: "0.8" },
  { loc: "/company/location.html", lastmod: "2026-06-13", changefreq: "monthly", priority: "0.8" },
  { loc: "/business/facility.html", lastmod: "2026-06-18", changefreq: "monthly", priority: "0.8" },
  { loc: "/business/cleaning.html", lastmod: "2026-06-18", changefreq: "monthly", priority: "0.8" },
  { loc: "/business/security.html", lastmod: "2026-06-18", changefreq: "monthly", priority: "0.8" },
  { loc: "/business/hotel.html", lastmod: "2026-06-18", changefreq: "monthly", priority: "0.8" },
  { loc: "/business/staffing.html", lastmod: "2026-06-13", changefreq: "monthly", priority: "0.8" },
  { loc: "/portfolio/index.html", lastmod: "2026-06-13", changefreq: "weekly", priority: "0.7" },
  { loc: "/notice/index.html", lastmod: "2026-06-17", changefreq: "weekly", priority: "0.7" },
  { loc: "/notice/recruit.html", lastmod: "2026-06-17", changefreq: "weekly", priority: "0.7" },
  { loc: "/contact/index.html", lastmod: "2026-06-18", changefreq: "monthly", priority: "0.9" },
];

const PATH_MAP = {
  notice: "/notice/view.html",
  recruit: "/notice/recruit/view.html",
};

function toDateStr(ts) {
  if (!ts) return "";
  return new Date(ts).toISOString().slice(0, 10);
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(loc, lastmod, changefreq, priority) {
  let xml = "  <url>\n";
  xml += "    <loc>" + escapeXml(loc) + "</loc>\n";
  if (lastmod) xml += "    <lastmod>" + lastmod + "</lastmod>\n";
  if (changefreq) xml += "    <changefreq>" + changefreq + "</changefreq>\n";
  if (priority) xml += "    <priority>" + priority + "</priority>\n";
  xml += "  </url>\n";
  return xml;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).send("Method not allowed");
  }

  let dynamicEntries = "";

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (url && anonKey) {
    try {
      const supabase = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data, error } = await supabase
        .from("posts")
        .select("id, category, updated_at")
        .in("category", ["notice", "recruit"])
        .order("published_at", { ascending: false });

      if (!error && data) {
        data.forEach(function (row) {
          var basePath = PATH_MAP[row.category];
          if (!basePath) return;
          var loc = SITE + basePath + "?id=" + encodeURIComponent(row.id);
          var lastmod = toDateStr(row.updated_at);
          dynamicEntries += urlEntry(loc, lastmod, "monthly", "0.6");
        });
      }
    } catch (err) {
      console.error("Sitemap: Supabase query failed:", err.message);
    }
  }

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  STATIC_URLS.forEach(function (entry) {
    xml += urlEntry(SITE + entry.loc, entry.lastmod, entry.changefreq, entry.priority);
  });

  xml += dynamicEntries;
  xml += "</urlset>\n";

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400"
  );
  return res.status(200).send(xml);
};
