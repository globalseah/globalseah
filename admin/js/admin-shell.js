(function () {
  var NAV_ITEMS = [
    { href: "index.html", label: "대시보드", page: "dashboard" },
    { href: "notices.html", label: "공지사항", page: "notices" },
    { href: "portfolio.html", label: "실적현황", page: "portfolio" },
    { href: "recruit.html", label: "채용현황", page: "recruit" },
    { href: "stats.html", label: "방문 통계", page: "stats" },
  ];

  var page = document.body.dataset.adminPage || "";
  var titleEl = document.getElementById("admin-page-title");
  var navEl = document.getElementById("admin-nav");

  if (titleEl) {
    var current = NAV_ITEMS.find(function (item) {
      return item.page === page;
    });
    if (current) titleEl.textContent = current.label;
  }

  if (navEl) {
    navEl.innerHTML = NAV_ITEMS.map(function (item) {
      var active = item.page === page;
      return (
        '<a href="' +
        item.href +
        '"' +
        (active ? ' class="active"' : "") +
        ">" +
        item.label +
        "</a>"
      );
    }).join("");
  }
})();
