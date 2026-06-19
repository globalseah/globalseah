/** 게시판 목록 페이지네이션 — 공지·채용 공통 */
(function () {
  const PAGE_SIZE = 10;

  function getInitialPage() {
    const page = Number(new URLSearchParams(window.location.search).get("page"));
    return page > 0 ? page : 1;
  }

  function setPageInUrl(page) {
    const url = new URL(window.location.href);
    if (page <= 1) {
      url.searchParams.delete("page");
    } else {
      url.searchParams.set("page", String(page));
    }
    window.history.replaceState(null, "", url);
  }

  function render(container, totalPages, currentPage, onChange) {
    if (!container) return;

    if (totalPages <= 1) {
      container.innerHTML = "";
      container.hidden = true;
      return;
    }

    container.hidden = false;
    let html = '<nav class="portfolio-pagination" aria-label="게시판 페이지">';

    for (let i = 1; i <= totalPages; i++) {
      const isActive = i === currentPage;
      html +=
        '<button type="button" class="portfolio-page' +
        (isActive ? " is-active" : "") +
        '" data-page="' +
        i +
        '"' +
        (isActive ? ' aria-current="page"' : "") +
        ">" +
        i +
        "</button>";
    }

    html += "</nav>";
    container.innerHTML = html;

    container.querySelectorAll(".portfolio-page").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const nextPage = Number(btn.dataset.page);
        if (nextPage === currentPage) return;
        onChange(nextPage);
      });
    });
  }

  window.SEAH_BOARD_PAGINATION = {
    PAGE_SIZE: PAGE_SIZE,
    getInitialPage: getInitialPage,
    setPageInUrl: setPageInUrl,
    render: render,
  };
})();
