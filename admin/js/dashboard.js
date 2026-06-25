(function () {
  var api = window.SEAH_ADMIN_API;
  var view = window.SEAH_ANALYTICS_VIEW;
  if (!api || !view) return;

  var summaryEl = document.getElementById("dashboard-stats-summary");
  var channelsEl = document.getElementById("dashboard-stats-channels");
  var statusEl = document.getElementById("dashboard-stats-status");
  var startEl = document.getElementById("dashboard-stats-start");
  var endEl = document.getElementById("dashboard-stats-end");
  var applyBtn = document.getElementById("dashboard-stats-apply");

  var defaults = api.initialDateRange();
  if (startEl) startEl.value = defaults.start;
  if (endEl) {
    endEl.value = defaults.end;
    endEl.max = api.defaultDateRange(1).end;
  }
  if (startEl) startEl.max = api.defaultDateRange(1).end;

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
        var data = payload.data || {};
        var label = (data.range && data.range.label) || start + " ~ " + end;
        view.renderSummaryCards(summaryEl, data.summary, label, {
          realtime: data.realtime,
          includesToday: data.includesToday,
        });
        renderTopChannels(data.channels || []);
        api.storeDateRange(start, end);
        setStatus("");
      })
      .catch(function (err) {
        setStatus(err.message, true);
        if (summaryEl) summaryEl.innerHTML = "";
        if (channelsEl) channelsEl.innerHTML = "";
      });
  }

  function renderTopChannels(channels) {
    if (!channelsEl) return;
    var top = channels.slice(0, 5);
    if (!top.length) {
      channelsEl.innerHTML = '<p class="admin-stat-empty">유입경로 데이터가 없습니다.</p>';
      return;
    }

    channelsEl.innerHTML =
      '<ul class="admin-stat-list">' +
      top
        .map(function (row) {
          return (
            "<li><span>" +
            row.label +
            '</span><strong>' +
            view.formatNumber(row.sessions) +
            "</strong></li>"
          );
        })
        .join("") +
      "</ul>";
  }

  function setStatus(message, isError) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className =
      "admin-status" + (isError ? " admin-status--error" : "") + (message ? "" : " is-hidden");
  }
})();
