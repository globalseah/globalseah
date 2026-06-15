(function () {
  const portfolio = window.SEAH_PORTFOLIO;
  if (!portfolio) return;

  const gridEl = document.getElementById("portfolio-grid");
  const paginationEl = document.getElementById("portfolio-pagination");
  if (!gridEl || !paginationEl) return;

  gridEl.innerHTML = portfolio.items
    .map((item) => portfolio.cardHtml(item, "../", "#"))
    .join("");

  paginationEl.innerHTML = "";
  paginationEl.hidden = true;
})();
