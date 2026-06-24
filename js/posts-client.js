/** 공개 게시판 — Supabase /api/posts 연동 */
(function () {
  var RECRUIT_FIELD_LABELS = [
    { key: "workplace", label: "근무지" },
    { key: "duties", label: "업무내용" },
    { key: "work_hours", label: "근무시간" },
    { key: "work_conditions", label: "근무조건" },
    { key: "salary", label: "급여조건" },
    { key: "other_conditions", label: "기타조건" },
    { key: "benefits", label: "복리후생" },
    { key: "special_notes", label: "특이사항" },
  ];

  function formatDate(iso) {
    if (!iso) return "";
    return String(iso).slice(0, 10);
  }

  function fetchPosts(category) {
    return fetch("/api/posts?category=" + encodeURIComponent(category))
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok || !data.ok) {
            throw new Error(data.error || "게시글을 불러오지 못했습니다.");
          }
          return data.items || [];
        });
      });
  }

  function fetchPost(id) {
    return fetch("/api/posts?id=" + encodeURIComponent(id))
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok || !data.ok) {
            throw new Error(data.error || "게시글을 불러오지 못했습니다.");
          }
          return data.item;
        });
      });
  }

  function isAbsoluteUrl(value) {
    return /^https?:\/\//.test(value) || (value && value.charAt(0) === "/");
  }

  function imageSrcNotice(filenameOrUrl, base) {
    if (!filenameOrUrl) return "";
    if (isAbsoluteUrl(filenameOrUrl)) return filenameOrUrl;
    return base + "assets/images/notice/" + filenameOrUrl;
  }

  function normalizeNotice(row) {
    return {
      id: row.id,
      title: row.title,
      date: formatDate(row.published_at),
      body: row.body || "",
      images: row.images || [],
    };
  }

  function normalizeRecruit(row) {
    return {
      id: row.id,
      title: row.title,
      date: formatDate(row.published_at),
      status: row.status || "open",
      contact: row.contact || null,
      body: row.body || "",
      content_type: row.content_type === "structured" ? "structured" : "legacy",
      fields: row.fields || {},
    };
  }

  function normalizePortfolio(row) {
    var fields = row.fields || {};
    return {
      id: row.id,
      title: fields.facility || row.title || "",
      usage: fields.usage || "",
      service: fields.service || "",
      location: fields.location || "",
      image: row.image_url || "",
    };
  }

  function buildNoticeApi(items) {
    return {
      items: items,
      displayItems: function () {
        return items.slice();
      },
      getById: function (id) {
        return items.find(function (item) {
          return String(item.id) === String(id);
        });
      },
      getAdjacent: function (id) {
        var sorted = items.slice();
        var index = sorted.findIndex(function (item) {
          return String(item.id) === String(id);
        });
        if (index === -1) return { newer: null, older: null };
        return {
          newer: index > 0 ? sorted[index - 1] : null,
          older: index < sorted.length - 1 ? sorted[index + 1] : null,
        };
      },
      imageSrc: imageSrcNotice,
    };
  }

  function buildRecruitApi(items) {
    return {
      items: items,
      displayItems: function () {
        return items.slice();
      },
      getById: function (id) {
        return items.find(function (item) {
          return String(item.id) === String(id);
        });
      },
      getAdjacent: function (id) {
        var sorted = items.slice();
        var index = sorted.findIndex(function (item) {
          return String(item.id) === String(id);
        });
        if (index === -1) return { newer: null, older: null };
        return {
          newer: index > 0 ? sorted[index - 1] : null,
          older: index < sorted.length - 1 ? sorted[index + 1] : null,
        };
      },
      listTitle: function (item) {
        if (item.status === "closed") return item.title + " [마감]";
        return item.title;
      },
      fieldLabels: RECRUIT_FIELD_LABELS,
    };
  }

  function portfolioImageSrc(item, base) {
    if (!item.image) return "";
    if (isAbsoluteUrl(item.image)) return item.image;
    return base + "assets/images/portfolio/" + item.image;
  }

  function buildPortfolioApi(items) {
    function cardHtml(item, base, href) {
      var src = portfolioImageSrc(item, base);
      var serviceRow = item.service
        ? (
            '<div class="portfolio-meta-row portfolio-meta-row--service">' +
            "<dt>사업내용</dt>" +
            "<dd>" +
            escapeHtml(item.service) +
            "</dd>" +
            "</div>"
          )
        : "";
      return (
        '<article class="portfolio-item">' +
        '<a href="' +
        href +
        '" class="portfolio-card" tabindex="0">' +
        '<img src="' +
        escapeAttr(src) +
        '" alt="' +
        escapeAttr(item.title) +
        '" loading="lazy" width="800" height="600" />' +
        '<div class="portfolio-overlay">' +
        '<h2 class="portfolio-card-title">' +
        escapeHtml(item.title) +
        "</h2>" +
        '<dl class="portfolio-meta">' +
        '<div class="portfolio-meta-row"><dt>용도</dt><dd>' +
        escapeHtml(item.usage) +
        "</dd></div>" +
        '<div class="portfolio-meta-row"><dt>위치</dt><dd>' +
        escapeHtml(item.location) +
        "</dd></div>" +
        serviceRow +
        "</dl></div></a></article>"
      );
    }

    return {
      items: items,
      displayItems: function () {
        return items.slice();
      },
      cardHtml: cardHtml,
    };
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

  window.SEAH_POSTS_CLIENT = {
    loadNotice: function () {
      return fetchPosts("notice").then(function (rows) {
        var items = rows.map(normalizeNotice);
        var api = buildNoticeApi(items);
        window.SEAH_NOTICE = api;
        return api;
      });
    },
    loadRecruit: function () {
      return fetchPosts("recruit").then(function (rows) {
        var items = rows.map(normalizeRecruit);
        var api = buildRecruitApi(items);
        window.SEAH_RECRUIT = api;
        return api;
      });
    },
    loadPortfolio: function () {
      return fetchPosts("portfolio").then(function (rows) {
        var items = rows.map(normalizePortfolio);
        var api = buildPortfolioApi(items);
        window.SEAH_PORTFOLIO = api;
        return api;
      });
    },
    fetchPost: fetchPost,
    normalizeNotice: normalizeNotice,
    normalizeRecruit: normalizeRecruit,
    buildNoticeApi: buildNoticeApi,
    buildRecruitApi: buildRecruitApi,
    imageSrcNotice: imageSrcNotice,
    fieldLabels: RECRUIT_FIELD_LABELS,
  };
})();
