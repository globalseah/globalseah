(function () {
  function formatNumber(value) {
    return Number(value || 0).toLocaleString("ko-KR");
  }

  function maxMetric(rows, key) {
    var max = 0;
    rows.forEach(function (row) {
      var value = Number(row[key] || 0);
      if (value > max) max = value;
    });
    return max || 1;
  }

  function renderSummaryCards(container, summary, rangeLabel, extra) {
    if (!container || !summary) return;
    extra = extra || {};

    var cards =
      statCard("방문자", formatNumber(summary.activeUsers), rangeLabel) +
      statCard("세션", formatNumber(summary.sessions), rangeLabel) +
      statCard("페이지뷰", formatNumber(summary.pageViews), rangeLabel);

    if (extra.realtime) {
      cards += statCard(
        "실시간 활성",
        formatNumber(extra.realtime.activeUsers),
        "최근 30분"
      );
    }

    var notice = "";
    if (extra.includesToday) {
      notice =
        '<p class="admin-stat-notice">당일 집계 수치(방문자·세션 등)는 GA4 반영에 수 시간이 걸려 0으로 보일 수 있습니다. 방금 방문 확인은 <strong>실시간 활성</strong> 또는 GA4 콘솔 → 실시간을 보세요.</p>';
    }

    container.innerHTML =
      '<div class="admin-stat-cards">' + cards + "</div>" + notice;
  }

  function statCard(label, value, hint) {
    return (
      '<article class="admin-stat-card">' +
      '<p class="admin-stat-card-label">' +
      label +
      "</p>" +
      '<p class="admin-stat-card-value">' +
      value +
      "</p>" +
      '<p class="admin-stat-card-hint">' +
      hint +
      "</p>" +
      "</article>"
    );
  }

  function renderDailyChart(container, daily) {
    if (!container) return;
    if (!daily || !daily.length) {
      container.innerHTML = '<p class="admin-stat-empty">일별 방문 데이터가 없습니다.</p>';
      return;
    }

    var peak = maxMetric(daily, "activeUsers");
    var bars = daily
      .map(function (row) {
        var height = Math.max(6, Math.round((row.activeUsers / peak) * 100));
        return (
          '<div class="admin-stat-bar" title="' +
          row.label +
          " · " +
          formatNumber(row.activeUsers) +
          '명">' +
          '<span class="admin-stat-bar-fill" style="height:' +
          height +
          '%"></span>' +
          '<span class="admin-stat-bar-label">' +
          row.label +
          "</span>" +
          "</div>"
        );
      })
      .join("");

    container.innerHTML =
      '<div class="admin-stat-chart" role="img" aria-label="일별 방문자 수">' +
      bars +
      "</div>";
  }

  function renderTable(container, columns, rows, emptyText) {
    if (!container) return;
    if (!rows || !rows.length) {
      container.innerHTML = '<p class="admin-stat-empty">' + emptyText + "</p>";
      return;
    }

    var head = columns
      .map(function (col) {
        return "<th scope=\"col\">" + col.label + "</th>";
      })
      .join("");

    var body = rows
      .map(function (row) {
        return (
          "<tr>" +
          columns
            .map(function (col) {
              var value = typeof col.render === "function" ? col.render(row) : row[col.key];
              return "<td>" + value + "</td>";
            })
            .join("") +
          "</tr>"
        );
      })
      .join("");

    container.innerHTML =
      '<table class="admin-table admin-stat-table"><thead><tr>' +
      head +
      "</tr></thead><tbody>" +
      body +
      "</tbody></table>";
  }

  window.SEAH_ANALYTICS_VIEW = {
    formatNumber: formatNumber,
    renderSummaryCards: renderSummaryCards,
    renderDailyChart: renderDailyChart,
    renderTable: renderTable,
  };
})();
