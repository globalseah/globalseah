(function () {
  const client = window.SEAH_POSTS_CLIENT;
  const pagination = window.SEAH_BOARD_PAGINATION;
  if (!client || !pagination) return;

  const tbody = document.querySelector(".board-table tbody");
  const paginationEl = document.getElementById("notice-pagination");
  if (!tbody) return;

  client
    .loadNotice()
    .then(function (notice) {
      const PAGE_SIZE = pagination.PAGE_SIZE;
      const items = notice.displayItems();
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
              '<td><a href="view.html?id=' +
              encodeURIComponent(item.id) +
              '">' +
              item.title +
              "</a></td>" +
              pagination.boardDateCell(item.date) +
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
    })
    .catch(function (err) {
      tbody.innerHTML =
        '<tr><td colspan="3">공지를 불러오지 못했습니다. (' +
        err.message +
        ")</td></tr>";
    });
})();
