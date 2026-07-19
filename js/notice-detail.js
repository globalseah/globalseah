(function () {
  const client = window.SEAH_POSTS_CLIENT;
  if (!client) return;

  const FALLBACK_DESCRIPTION =
    "글로벌세아 공지사항 — 안전·인사 관련 주요 공지를 안내합니다.";
  const CANONICAL_BASE = "https://globalseah.com/notice/view.html";

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const titleEl = document.getElementById("notice-title");
  const dateEl = document.getElementById("notice-date");
  const bodyEl = document.getElementById("notice-body");
  const navEl = document.getElementById("notice-nav");
  const crumbEl = document.getElementById("notice-breadcrumb-current");

  client
    .loadNotice()
    .then(function (notice) {
      const item = notice.getById(id);

      if (!item || !titleEl || !dateEl || !bodyEl) {
        if (titleEl) titleEl.textContent = "공지를 찾을 수 없습니다";
        document.title = "공지사항 | 글로벌세아";
        return;
      }

      var pageTitle = item.title + " — 공지사항 | 글로벌세아";
      var description = excerptText(item.body, FALLBACK_DESCRIPTION);
      var canonical =
        CANONICAL_BASE + "?id=" + encodeURIComponent(item.id);

      document.title = pageTitle;
      updateSeoMeta({
        title: pageTitle,
        description: description,
        canonical: canonical,
      });
      titleEl.textContent = item.title;
      dateEl.textContent = item.date;
      if (crumbEl) crumbEl.textContent = item.title;

      var html = "";
      var attachments = item.attachments || [];
      var documents = attachments.filter(function (att) {
        return att.kind === "document";
      });
      var images = attachments.filter(function (att) {
        return att.kind === "image";
      });

      if (item.body && String(item.body).trim()) {
        html +=
          '<div class="notice-view-text">' +
          escapeHtml(item.body).replace(/\n/g, "<br>") +
          "</div>";
      }

      if (documents.length) {
        html += '<section class="notice-attachments">';
        html +=
          '<h2 class="notice-attachments-title">첨부파일 <span class="notice-attachments-count">(' +
          documents.length +
          ")</span></h2>";
        html += '<ul class="notice-attachments-list">';
        documents.forEach(function (att) {
          var href = notice.attachmentSrc(att.url, "../");
          var sizeLabel = formatFileSize(att.size);
          html += '<li class="notice-attachments-item">';
          html +=
            '<a class="notice-attachments-link" href="' +
            escapeAttr(href) +
            '" download="' +
            escapeAttr(att.name) +
            '" target="_blank" rel="noopener noreferrer">';
          html += '<span class="notice-attachments-icon" aria-hidden="true">📎</span>';
          html += '<span class="notice-attachments-name">' + escapeHtml(att.name) + "</span>";
          if (sizeLabel) {
            html +=
              '<span class="notice-attachments-size">' + escapeHtml(sizeLabel) + "</span>";
          }
          html += "</a></li>";
        });
        html += "</ul></section>";
      }

      if (images.length) {
        html += images
          .map(function (att, index) {
            const src = notice.imageSrc(att.url, "../");
            const alt =
              images.length > 1
                ? item.title + " (" + (index + 1) + "/" + images.length + ")"
                : item.title;
            return (
              '<figure class="notice-figure">' +
              '<img src="' +
              src +
              '" alt="' +
              escapeAttr(alt) +
              '" loading="lazy" />' +
              "</figure>"
            );
          })
          .join("");
      }

      bodyEl.innerHTML = html;

      if (navEl) {
        const adjacent = notice.getAdjacent(id);
        navEl.innerHTML =
          navRow("다음글", adjacent.newer, notice) +
          navRow("이전글", adjacent.older, notice);
      }
    })
    .catch(function () {
      if (titleEl) titleEl.textContent = "공지를 불러오지 못했습니다";
    });

  function navRow(label, post, notice) {
    const content = post
      ? '<a href="view.html?id=' +
        encodeURIComponent(post.id) +
        '">' +
        post.title +
        "</a>"
      : '<span class="notice-nav-empty">없음</span>';
    return (
      '<div class="notice-nav-row">' +
      '<span class="notice-nav-label">' +
      label +
      "</span>" +
      '<span class="notice-nav-content">' +
      content +
      "</span>" +
      "</div>"
    );
  }

  function formatFileSize(bytes) {
    if (bytes == null || !Number.isFinite(bytes)) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function updateSeoMeta(opts) {
    setMetaContent('meta[name="description"]', opts.description);
    setMetaContent('meta[property="og:title"]', opts.title);
    setMetaContent('meta[property="og:description"]', opts.description);
    setMetaContent('meta[property="og:url"]', opts.canonical);
    var link = document.querySelector('link[rel="canonical"]');
    if (link) link.setAttribute("href", opts.canonical);
  }

  function setMetaContent(selector, value) {
    var el = document.querySelector(selector);
    if (el) el.setAttribute("content", value);
  }

  function excerptText(value, fallback) {
    var text = String(value || "")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) return fallback;
    if (text.length <= 120) return text;
    return text.slice(0, 120).trim() + "…";
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }
})();
