/**
 * SSR 렌더러 — 공지·채용·실적 상세 페이지의 초기 HTML에 콘텐츠를 주입.
 * Vercel rewrite 로 view.html 요청을 이 함수로 라우팅.
 * ?id= 없으면 원본 템플릿 그대로 반환, 있으면 DB 조회 후 주입.
 */
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

var SITE = "https://globalseah.com";

var TEMPLATES = {
  notice: "_templates/notice/view.html",
  recruit: "_templates/notice/recruit/view.html",
  portfolio: "_templates/portfolio/view.html",
};

var CANONICAL_MAP = {
  notice: SITE + "/notice/view.html",
  recruit: SITE + "/notice/recruit/view.html",
  portfolio: SITE + "/portfolio/view.html",
};

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function excerpt(text, len) {
  var plain = String(text || "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= len) return plain;
  return plain.slice(0, len) + "…";
}

function formatDate(iso) {
  if (!iso) return "";
  return String(iso).slice(0, 10);
}

function replaceMeta(html, attr, name, value) {
  var re = new RegExp(
    '(<meta\\s+' + attr + '="' + name + '"\\s+content=")([^"]*)("\\s*/>)',
    "i"
  );
  return html.replace(re, "$1" + esc(value) + "$3");
}

function replaceTitle(html, newTitle) {
  return html.replace(/<title>[^<]*<\/title>/, "<title>" + esc(newTitle) + "</title>");
}

function replaceCanonical(html, url) {
  return html.replace(
    /(<link\s+rel="canonical"\s+href=")([^"]*)("\s*\/>)/i,
    "$1" + esc(url) + "$3"
  );
}

function updateAllMeta(html, title, desc, url) {
  html = replaceTitle(html, title);
  html = replaceMeta(html, "name", "description", desc);
  html = replaceMeta(html, "property", "og:title", title);
  html = replaceMeta(html, "property", "og:description", desc);
  html = replaceMeta(html, "property", "og:url", url);
  html = replaceMeta(html, "name", "twitter:title", title);
  html = replaceMeta(html, "name", "twitter:description", desc);
  html = replaceCanonical(html, url);
  return html;
}

function renderNoticeBody(row) {
  var title = row.title || "";
  var date = formatDate(row.published_at);
  var body = row.body || "";

  return (
    '<header class="notice-view-head">' +
    '<h2 id="notice-title" class="notice-view-title">' + esc(title) + "</h2>" +
    '<p class="notice-view-date">' +
    '<span class="notice-view-date-label">등록일</span>' +
    '<time id="notice-date">' + esc(date) + "</time>" +
    "</p></header>" +
    '<div id="notice-body" class="notice-view-body">' + body + "</div>"
  );
}

function renderRecruitBody(row) {
  var title = row.title || "";
  var date = formatDate(row.published_at);
  var status = row.status === "closed" ? "마감" : "모집중";
  var statusClass = row.status === "closed" ? "recruit-badge--closed" : "recruit-badge--open";
  var fields = row.fields || {};
  var body = row.body || "";

  var FIELD_LABELS = [
    ["workplace", "근무지"], ["duties", "업무내용"], ["work_hours", "근무시간"],
    ["work_conditions", "근무조건"], ["salary", "급여조건"],
    ["other_conditions", "기타조건"], ["benefits", "복리후생"],
    ["special_notes", "특이사항"],
  ];

  var fieldsHtml = "";
  if (row.content_type === "structured") {
    fieldsHtml = '<table class="recruit-fields"><tbody>';
    FIELD_LABELS.forEach(function (pair) {
      var val = fields[pair[0]];
      if (val) {
        fieldsHtml +=
          "<tr><th>" + esc(pair[1]) + "</th><td>" + esc(val) + "</td></tr>";
      }
    });
    fieldsHtml += "</tbody></table>";
  } else {
    fieldsHtml = '<div class="recruit-view-body--plain">' + body + "</div>";
  }

  return (
    '<header class="notice-view-head">' +
    '<p id="recruit-status" class="recruit-view-status">' +
    '<span class="recruit-badge ' + statusClass + '">' + status + "</span></p>" +
    '<h2 id="recruit-title" class="notice-view-title">' + esc(title) + "</h2>" +
    '<p class="notice-view-date">' +
    '<span class="notice-view-date-label">등록일</span>' +
    '<time id="recruit-date">' + esc(date) + "</time>" +
    "</p></header>" +
    '<div class="notice-view-body">' +
    '<div id="recruit-body">' + fieldsHtml + "</div>" +
    "</div>"
  );
}

function renderPortfolioBody(row) {
  var fields = row.fields || {};
  var title = fields.facility || row.title || "";
  var usage = fields.usage || "";
  var service = fields.service || "";
  var location = fields.location || "";
  var imageUrl = row.image_url || "";

  var imgHtml = "";
  if (imageUrl) {
    imgHtml =
      '<div class="portfolio-view-image">' +
      '<img src="' + esc(imageUrl) + '" alt="' + esc(title) + '" loading="lazy" />' +
      "</div>";
  }

  return (
    '<h2 class="portfolio-view-title">' + esc(title) + "</h2>" +
    imgHtml +
    '<dl class="portfolio-view-meta">' +
    (usage ? '<div class="portfolio-view-meta-row"><dt>용도</dt><dd>' + esc(usage) + "</dd></div>" : "") +
    (location ? '<div class="portfolio-view-meta-row"><dt>위치</dt><dd>' + esc(location) + "</dd></div>" : "") +
    (service ? '<div class="portfolio-view-meta-row"><dt>사업내용</dt><dd>' + esc(service) + "</dd></div>" : "") +
    "</dl>"
  );
}

var CONTENT_MARKERS = {
  notice: {
    start: /<header class="notice-view-head">[\s\S]*?<div id="notice-body" class="notice-view-body"><\/div>/,
    breadcrumb: 'id="notice-breadcrumb-current"',
  },
  recruit: {
    start: /<header class="notice-view-head">[\s\S]*?<aside id="recruit-contact"[^>]*><\/aside>\s*<\/div>/,
    breadcrumb: 'id="recruit-breadcrumb-current"',
  },
  portfolio: {
    start: /<div id="portfolio-detail" class="portfolio-view-body">[\s\S]*?<\/div>/,
    breadcrumb: 'id="portfolio-breadcrumb-current"',
  },
};

function injectContent(html, type, row, id) {
  var canonicalUrl = CANONICAL_MAP[type] + "?id=" + encodeURIComponent(id);
  var title, desc, bodyHtml;

  if (type === "notice") {
    title = (row.title || "공지사항") + " — 공지사항 | 글로벌세아";
    desc = excerpt(row.body, 120) || "글로벌세아 공지사항";
    bodyHtml = renderNoticeBody(row);
  } else if (type === "recruit") {
    title = (row.title || "채용현황") + " — 채용현황 | 글로벌세아";
    var fields = row.fields || {};
    desc = "글로벌세아 채용 — " + (row.title || "") +
      (fields.workplace ? " (" + fields.workplace + ")" : "");
    bodyHtml = renderRecruitBody(row);
  } else if (type === "portfolio") {
    var pFields = row.fields || {};
    var pTitle = pFields.facility || row.title || "실적";
    title = pTitle + " — 실적현황 | 글로벌세아";
    desc = "글로벌세아 " + (pFields.service || "") + " 실적 — " + pTitle +
      (pFields.location ? " (" + pFields.location + ")" : "");
    bodyHtml = renderPortfolioBody(row);
  }

  html = updateAllMeta(html, title, desc, canonicalUrl);

  var marker = CONTENT_MARKERS[type];
  if (marker && marker.start) {
    if (type === "portfolio") {
      html = html.replace(
        marker.start,
        '<div id="portfolio-detail" class="portfolio-view-body">' + bodyHtml + "</div>"
      );
    } else {
      html = html.replace(marker.start, bodyHtml);
    }
  }

  if (marker && marker.breadcrumb) {
    var bcName = type === "notice" ? row.title :
                 type === "recruit" ? row.title :
                 (row.fields && row.fields.facility) || row.title || "상세";
    html = html.replace(
      new RegExp('(' + marker.breadcrumb + '>)[^<]*(</li>)'),
      "$1" + esc(bcName) + "$2"
    );
  }

  return html;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).send("Method not allowed");
  }

  var type = req.query.type;
  var id = req.query.id;

  var templateFile = TEMPLATES[type];
  if (!templateFile) {
    return res.status(404).send("Not found");
  }

  var templatePath = path.join(process.cwd(), templateFile);
  var html;
  try {
    html = fs.readFileSync(templatePath, "utf8");
  } catch (e) {
    return res.status(500).send("Template not found");
  }

  if (!id) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html);
  }

  var supabaseUrl = process.env.SUPABASE_URL;
  var anonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html);
  }

  try {
    var supabase = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    var result = await supabase.from("posts").select("*").eq("id", id).single();

    if (result.error || !result.data) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(html);
    }

    html = injectContent(html, type, result.data, id);
  } catch (err) {
    console.error("Render SSR error:", err.message);
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
  return res.status(200).send(html);
};
