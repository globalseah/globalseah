(function () {
  const portfolio = window.SEAH_PORTFOLIO;
  if (!portfolio) return;

  const gridEl = document.getElementById("portfolio-grid");
  const paginationEl = document.getElementById("portfolio-pagination");
  if (!gridEl || !paginationEl) return;

  const PAGE_SIZE = 10;
  const items = portfolio.displayItems();
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  let currentPage = 1;

  function renderGrid(page) {
    const start = (page - 1) * PAGE_SIZE;
    gridEl.innerHTML = items
      .slice(start, start + PAGE_SIZE)
      .map((item) => portfolio.cardHtml(item, "../", "#"))
      .join("");
  }

  function renderPagination(page) {
    if (totalPages <= 1) {
      paginationEl.innerHTML = "";
      paginationEl.hidden = true;
      return;
    }

    paginationEl.hidden = false;
    let html = '<nav class="portfolio-pagination" aria-label="실적 페이지">';

    for (let i = 1; i <= totalPages; i++) {
      const isActive = i === page;
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
    paginationEl.innerHTML = html;

    paginationEl.querySelectorAll(".portfolio-page").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const nextPage = Number(btn.dataset.page);
        if (nextPage === currentPage) return;
        currentPage = nextPage;
        renderGrid(currentPage);
        renderPagination(currentPage);
        gridEl.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  renderGrid(currentPage);
  renderPagination(currentPage);
})();
