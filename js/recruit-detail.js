(function () {
  const recruit = window.SEAH_RECRUIT;
  if (!recruit) return;

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  const item = recruit.getById(id);

  const titleEl = document.getElementById("recruit-title");
  const dateEl = document.getElementById("recruit-date");
  const statusEl = document.getElementById("recruit-status");
  const bodyEl = document.getElementById("recruit-body");
  const contactEl = document.getElementById("recruit-contact");
  const navEl = document.getElementById("recruit-nav");
  const crumbEl = document.getElementById("recruit-breadcrumb-current");

  if (!item || !titleEl || !dateEl || !bodyEl) {
    if (titleEl) titleEl.textContent = "채용 공고를 찾을 수 없습니다";
    document.title = "채용현황 — 글로벌세아종합관리";
    return;
  }

  document.title = item.title + " — 채용현황 — 글로벌세아종합관리";
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

  bodyEl.textContent = item.body || "";

  if (contactEl && item.contact) {
    const tel = item.contact.phone.replace(/[^\d+]/g, "");
    contactEl.innerHTML =
      '<p class="recruit-view-contact-title">문의 연락처</p>' +
      '<p class="recruit-view-contact-line">' +
      item.contact.role +
      " : " +
      '<a href="tel:' +
      tel +
      '">' +
      item.contact.phone +
      "</a>" +
      "</p>";
  }

  if (navEl) {
    const adjacent = recruit.getAdjacent(id);
    navEl.innerHTML =
      navRow("다음글", adjacent.newer) + navRow("이전글", adjacent.older);
  }

  function navRow(label, post) {
    const content = post
      ? '<a href="view.html?id=' +
        post.id +
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
})();
