(function () {
  var api = window.SEAH_ADMIN_API;
  var view = window.SEAH_ANALYTICS_VIEW;
  if (!api || !view) return;

  var statusEl = document.getElementById("stats-status");
  var summaryEl = document.getElementById("stats-summary");
  var dailyEl = document.getElementById("stats-daily");
  var channelsEl = document.getElementById("stats-channels");
  var pagesEl = document.getElementById("stats-pages");
  var devicesEl = document.getElementById("stats-devices");
  var regionsEl = document.getElementById("stats-regions");
  var startEl = document.getElementById("stats-start");
  var endEl = document.getElementById("stats-end");
  var applyBtn = document.getElementById("stats-apply");

  var defaults = api.initialDateRange();
  if (startEl) startEl.value = defaults.start;
  if (endEl) {
    endEl.value = defaults.end;
    endEl.max = api.todayDate();
  }
  if (startEl) startEl.max = api.todayDate();

  if (applyBtn) {
    applyBtn.addEventListener("click", load);
  }

  [startEl, endEl].forEach(function (el) {
    if (!el) return;
    el.addEventListener("keydown", function (event) {
      if (event.key === "Enter") load();
    });
  });

  load();

  function load() {
    var start = startEl ? startEl.value : "";
    var end = endEl ? endEl.value : "";

    if (!start || !end) {
      setStatus("시작일과 종료일을 선택해 주세요.", true);
      return;
    }

    setStatus("통계를 불러오는 중…");
    api
      .analytics(start, end)
      .then(function (payload) {
        render(payload.data || {});
        api.storeDateRange(start, end);
        setStatus("");
      })
      .catch(function (err) {
        setStatus(err.message, true);
        clearPanels();
      });
  }

  function render(data) {
    view.renderSummaryCards(summaryEl, data.summary, data.range && data.range.label, {
      realtime: data.realtime,
      includesToday: data.includesToday,
      confirmedLabel: data.confirmedRange && data.confirmedRange.label,
      compact: true,
    });
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
      "유입경로 데이터가 없습니다. 방문자가 쌓이면 표시됩니다."
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
      "페이지 데이터가 없습니다. 방문자가 쌓이면 표시됩니다."
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
      "기기 데이터가 없습니다. 방문자가 쌓이면 표시됩니다."
    );

    view.renderTable(
      regionsEl,
      [
        { label: "시/도", key: "label" },
        {
          label: "방문자",
          render: function (row) {
            return view.formatNumber(row.users);
          },
        },
      ],
      data.regions || [],
      "지역 데이터가 없습니다. 방문자가 쌓이면 표시됩니다."
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
