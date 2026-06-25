(function () {
  var api = window.SEAH_ADMIN_API;
  var view = window.SEAH_ANALYTICS_VIEW;
  if (!api || !view) return;

  var range = "7d";
  var statusEl = document.getElementById("stats-status");
  var summaryEl = document.getElementById("stats-summary");
  var dailyEl = document.getElementById("stats-daily");
  var channelsEl = document.getElementById("stats-channels");
  var pagesEl = document.getElementById("stats-pages");
  var devicesEl = document.getElementById("stats-devices");
  var regionsEl = document.getElementById("stats-regions");
  var rangeButtons = document.querySelectorAll("[data-stats-range]");

  rangeButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var nextRange = btn.getAttribute("data-stats-range");
      if (!nextRange || nextRange === range) return;
      range = nextRange;
      rangeButtons.forEach(function (item) {
        item.classList.toggle("is-active", item === btn);
      });
      load();
    });
  });

  load();

  function load() {
    setStatus("통계를 불러오는 중…");
    api
      .analytics(range)
      .then(function (payload) {
        render(payload.data || {});
        setStatus("");
      })
      .catch(function (err) {
        setStatus(err.message, true);
        clearPanels();
      });
  }

  function render(data) {
    view.renderSummaryCards(summaryEl, data.summary, data.range && data.range.label);
    view.renderDailyChart(dailyEl, data.daily || []);

    view.renderTable(
      channelsEl,
      [
        { label: "유입경로", key: "label" },
        {
          label: "세션",
          render: function (row) {
            return view.formatNumber(row.sessions);
          },
        },
      ],
      data.channels || [],
      "유입경로 데이터가 없습니다."
    );

    view.renderTable(
      pagesEl,
      [
        { label: "페이지", key: "path" },
        {
          label: "조회수",
          render: function (row) {
            return view.formatNumber(row.views);
          },
        },
      ],
      data.pages || [],
      "페이지 데이터가 없습니다."
    );

    view.renderTable(
      devicesEl,
      [
        { label: "기기", key: "label" },
        {
          label: "방문자",
          render: function (row) {
            return view.formatNumber(row.users);
          },
        },
      ],
      data.devices || [],
      "기기 데이터가 없습니다."
    );

    view.renderTable(
      regionsEl,
      [
        { label: "국가/지역", key: "label" },
        {
          label: "방문자",
          render: function (row) {
            return view.formatNumber(row.users);
          },
        },
      ],
      data.regions || [],
      "지역 데이터가 없습니다."
    );
  }

  function clearPanels() {
    [summaryEl, dailyEl, channelsEl, pagesEl, devicesEl, regionsEl].forEach(function (el) {
      if (el) el.innerHTML = "";
    });
  }

  function setStatus(message, isError) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className =
      "admin-status" + (isError ? " admin-status--error" : "") + (message ? "" : " is-hidden");
  }
})();
