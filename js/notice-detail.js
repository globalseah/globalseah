(function () {
  const notice = window.SEAH_NOTICE;
  if (!notice) return;

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  const item = notice.getById(id);

  const titleEl = document.getElementById("notice-title");
  const dateEl = document.getElementById("notice-date");
  const bodyEl = document.getElementById("notice-body");
  const navEl = document.getElementById("notice-nav");
  const crumbEl = document.getElementById("notice-breadcrumb-current");

  if (!item || !titleEl || !dateEl || !bodyEl) {
    if (titleEl) titleEl.textContent = "공지를 찾을 수 없습니다";
    document.title = "공지사항 — 글로벌세아";
    return;
  }

  document.title = item.title + " — 공지사항 — 글로벌세아";
  titleEl.textContent = item.title;
  dateEl.textContent = item.date;
  if (crumbEl) crumbEl.textContent = item.title;

  bodyEl.innerHTML = item.images
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
        alt +
        '" loading="lazy" />' +
        "</figure>"
      );
    })
    .join("");

  if (navEl) {
    const adjacent = notice.getAdjacent(id);
    navEl.innerHTML =
      navRow("다음글", adjacent.newer) + navRow("이전글", adjacent.older);
  }

  function navRow(label, post) {
    const content = post
      ? '<a href="view.html?id=' +
        post.id +
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
})();
