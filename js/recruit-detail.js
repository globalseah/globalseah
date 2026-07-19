(function () {
  const client = window.SEAH_POSTS_CLIENT;
  if (!client) return;

  const FALLBACK_DESCRIPTION =
    "글로벌세아 채용현황 — 시설·미화·보안 등 인력 채용 정보를 안내합니다.";
  const CANONICAL_BASE = "https://globalseah.com/notice/recruit/view.html";

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const titleEl = document.getElementById("recruit-title");
  const dateEl = document.getElementById("recruit-date");
  const statusEl = document.getElementById("recruit-status");
  const bodyEl = document.getElementById("recruit-body");
  const contactEl = document.getElementById("recruit-contact");
  const navEl = document.getElementById("recruit-nav");
  const crumbEl = document.getElementById("recruit-breadcrumb-current");

  client
    .loadRecruit()
    .then(function (recruit) {
      const item = recruit.getById(id);

      if (!item || !titleEl || !dateEl || !bodyEl) {
        if (titleEl) titleEl.textContent = "채용 공고를 찾을 수 없습니다";
        document.title = "채용현황 | 글로벌세아";
        return;
      }

      var pageTitle = item.title + " — 채용현황 | 글로벌세아";
      var description = excerptText(
        recruitDescriptionSource(item, recruit.fieldLabels),
        FALLBACK_DESCRIPTION
      );
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

      if (statusEl) {
        const isClosed = item.status === "closed";
        statusEl.innerHTML =
          '<span class="badge ' +
          (isClosed ? "badge--recruit-closed" : "badge--recruit-open") +
          '">' +
          (isClosed ? "마감" : "모집중") +
          "</span>";
      }

      if (item.content_type === "structured" && item.fields) {
        bodyEl.className = "recruit-view-body--structured";
        bodyEl.innerHTML = renderStructuredBody(item.fields, recruit.fieldLabels);
      } else {
        bodyEl.className = "recruit-view-body--plain";
        bodyEl.textContent = item.body || "";
      }

      if (contactEl && item.contact) {
        const tel = String(item.contact.phone || "").replace(/[^\d+]/g, "");
        contactEl.innerHTML =
          '<p class="recruit-view-contact-title">문의 연락처</p>' +
          '<p class="recruit-view-contact-line">' +
          escapeHtml(item.contact.role) +
          " : " +
          '<a href="tel:' +
          tel +
          '">' +
          escapeHtml(item.contact.phone) +
          "</a>" +
          "</p>";
      }

      if (navEl) {
        const adjacent = recruit.getAdjacent(id);
        navEl.innerHTML =
          navRow("다음글", adjacent.newer, recruit) +
          navRow("이전글", adjacent.older, recruit);
      }
    })
    .catch(function () {
      if (titleEl) titleEl.textContent = "채용 공고를 불러오지 못했습니다";
    });

  function renderStructuredBody(fields, labels) {
    return labels
      .map(function (field) {
        const value = fields[field.key];
        if (!value || !String(value).trim()) return "";
        return (
          '<div class="recruit-field-row">' +
          '<div class="recruit-field-label">' +
          escapeHtml(field.label) +
          "</div>" +
          '<div class="recruit-field-value">' +
          escapeHtml(value).replace(/\n/g, "<br>") +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  function navRow(label, post, recruit) {
    const content = post
      ? '<a href="view.html?id=' +
        encodeURIComponent(post.id) +
        '">' +
        recruit.listTitle(post) +
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

  function recruitDescriptionSource(item, fieldLabels) {
    if (item.body && String(item.body).trim()) return item.body;
    if (item.content_type === "structured" && item.fields && fieldLabels) {
      return fieldLabels
        .map(function (field) {
          var value = item.fields[field.key];
          return value && String(value).trim() ? String(value).trim() : "";
        })
        .filter(Boolean)
        .join(" ");
    }
    return "";
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
})();
