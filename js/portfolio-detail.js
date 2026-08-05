(function () {
  var CANONICAL_BASE = "https://globalseah.com/portfolio/view.html";
  var FALLBACK_DESC =
    "글로벌세아 실적현황 — 제조·주거·호텔 등 다양한 건물관리 수행 실적을 소개합니다.";

  var params = new URLSearchParams(window.location.search);
  var postId = params.get("id");
  var detailEl = document.getElementById("portfolio-detail");
  var breadcrumb = document.getElementById("portfolio-breadcrumb-current");

  if (!postId || !detailEl) {
    if (detailEl) detailEl.innerHTML = "<p>잘못된 접근입니다.</p>";
    return;
  }

  var client = window.SEAH_POSTS_CLIENT;
  if (!client) return;

  client
    .fetchPost(postId)
    .then(function (row) {
      if (!row) throw new Error("게시글을 찾을 수 없습니다.");

      var fields = row.fields || {};
      var title = fields.facility || row.title || "";
      var usage = fields.usage || "";
      var service = fields.service || "";
      var location = fields.location || "";
      var imageUrl = row.image_url || "";

      document.title = title + " — 실적현황 | 글로벌세아";
      if (breadcrumb) breadcrumb.textContent = title;

      var desc =
        "글로벌세아 " +
        service +
        " 실적 — " +
        title +
        (location ? " (" + location + ")" : "");
      var canonicalUrl = CANONICAL_BASE + "?id=" + encodeURIComponent(postId);

      updateSeoMeta(title + " — 실적현황 | 글로벌세아", desc, canonicalUrl);

      var imgHtml = "";
      if (imageUrl) {
        imgHtml =
          '<div class="portfolio-view-image">' +
          '<img src="' +
          escapeAttr(imageUrl) +
          '" alt="' +
          escapeAttr(title) +
          '" loading="lazy" />' +
          "</div>";
      }

      detailEl.innerHTML =
        '<h2 class="portfolio-view-title">' +
        escapeHtml(title) +
        "</h2>" +
        imgHtml +
        '<dl class="portfolio-view-meta">' +
        metaRow("용도", usage) +
        metaRow("위치", location) +
        metaRow("사업내용", service) +
        "</dl>";

      injectBreadcrumbLD(title, canonicalUrl);
    })
    .catch(function (err) {
      detailEl.innerHTML =
        '<p class="portfolio-load-error">실적을 불러오지 못했습니다. (' +
        err.message +
        ")</p>";
    });

  function metaRow(label, value) {
    if (!value) return "";
    return (
      '<div class="portfolio-view-meta-row">' +
      "<dt>" +
      escapeHtml(label) +
      "</dt>" +
      "<dd>" +
      escapeHtml(value) +
      "</dd>" +
      "</div>"
    );
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(s) {
    return escapeHtml(s);
  }

  function setMetaContent(selector, value) {
    var el = document.querySelector(selector);
    if (el) el.setAttribute("content", value);
  }

  function updateSeoMeta(title, desc, url) {
    setMetaContent('meta[name="description"]', desc);
    setMetaContent('meta[property="og:title"]', title);
    setMetaContent('meta[property="og:description"]', desc);
    setMetaContent('meta[property="og:url"]', url);
    setMetaContent('meta[name="twitter:title"]', title);
    setMetaContent('meta[name="twitter:description"]', desc);

    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", url);
  }

  function injectBreadcrumbLD(title, url) {
    var ld = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "홈",
          item: "https://globalseah.com/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "실적현황",
          item: "https://globalseah.com/portfolio/index.html",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: title,
          item: url,
        },
      ],
    };
    var script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(ld);
    document.head.appendChild(script);
  }
})();
