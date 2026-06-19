(function () {
  const recruit = window.SEAH_RECRUIT;
  const pagination = window.SEAH_BOARD_PAGINATION;
  if (!recruit || !pagination) return;

  const tbody = document.querySelector(".board-table tbody");
  const paginationEl = document.getElementById("recruit-pagination");
  if (!tbody) return;

  const PAGE_SIZE = pagination.PAGE_SIZE;
  const items = recruit.displayItems();
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  let currentPage = Math.min(pagination.getInitialPage(), totalPages);

  function renderTable(page) {
    const start = (page - 1) * PAGE_SIZE;
    tbody.innerHTML = items
      .slice(start, start + PAGE_SIZE)
      .map(function (item, index) {
        const num = items.length - start - index;
        return (
          "<tr>" +
          '<td class="num">' +
          num +
          "</td>" +
          '<td><a href="recruit/view.html?id=' +
          item.id +
          '">' +
          recruit.listTitle(item) +
          "</a></td>" +
          "<td>" +
          item.date +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function goToPage(page) {
    currentPage = page;
    renderTable(page);
    pagination.render(paginationEl, totalPages, page, goToPage);
    pagination.setPageInUrl(page);
  }

  renderTable(currentPage);
  pagination.render(paginationEl, totalPages, currentPage, goToPage);
})();
