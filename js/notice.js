(function () {
  const notice = window.SEAH_NOTICE;
  if (!notice) return;

  const tbody = document.querySelector(".board-table tbody");
  if (!tbody) return;

  const items = notice.displayItems();

  tbody.innerHTML = items
    .map(function (item, index) {
      const num = items.length - index;
      return (
        "<tr>" +
        '<td class="num">' +
        num +
        "</td>" +
        "<td><a href=\"view.html?id=" +
        item.id +
        '">' +
        item.title +
        "</a></td>" +
        "<td>" +
        item.date +
        "</td>" +
        "</tr>"
      );
    })
    .join("");
})();
