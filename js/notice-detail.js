(function () {
  const client = window.SEAH_POSTS_CLIENT;
  if (!client) return;

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
        document.title = "공지사항 — 글로벌세아종합관리";
        return;
      }

      document.title = item.title + " — 공지사항 — 글로벌세아종합관리";
      titleEl.textContent = item.title;
      dateEl.textContent = item.date;
      if (crumbEl) crumbEl.textContent = item.title;

      var html = "";

      if (item.body && String(item.body).trim()) {
        html +=
          '<div class="notice-view-text">' +
          escapeHtml(item.body).replace(/\n/g, "<br>") +
          "</div>";
      }

      if (item.images && item.images.length) {
        html += item.images
          .map(function (filename, index) {
            const src = notice.imageSrc(filename, "../");
            const alt =
              item.images.length > 1
                ? item.title + " (" + (index + 1) + "/" + item.images.length + ")"
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
