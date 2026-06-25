(function () {
  var api = window.SEAH_ADMIN_API;
  var view = window.SEAH_ANALYTICS_VIEW;
  if (!api || !view) return;

  var summaryEl = document.getElementById("dashboard-stats-summary");
  var channelsEl = document.getElementById("dashboard-stats-channels");
  var statusEl = document.getElementById("dashboard-stats-status");

  var defaults = api.defaultDateRange(7);

  api
    .analytics(defaults.start, defaults.end)
    .then(function (payload) {
      var data = payload.data || {};
      var label = (data.range && data.range.label) || defaults.start + " ~ " + defaults.end;
      view.renderSummaryCards(summaryEl, data.summary, label);
      renderTopChannels(data.channels || []);
      if (statusEl) statusEl.textContent = "";
    })
    .catch(function (err) {
      if (statusEl) {
        statusEl.textContent = err.message;
        statusEl.className = "admin-status admin-status--error";
      }
      if (summaryEl) summaryEl.innerHTML = "";
      if (channelsEl) channelsEl.innerHTML = "";
    });

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
})();
