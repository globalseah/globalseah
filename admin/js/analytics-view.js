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

    var periodHint = "집계 기간: " + (rangeLabel || "");
    var isTodayOnly =
      extra.includesToday &&
      rangeLabel &&
      rangeLabel.indexOf("~") === -1;
    var waitingToday =
      extra.includesToday &&
      !summary.activeUsers &&
      !summary.sessions &&
      !summary.pageViews;

    var cards = "";

    if (extra.realtime) {
      cards += statCard({
        label: "최근 30분 활성",
        badge: "빠른 확인",
        value: formatNumber(extra.realtime.activeUsers),
        hint: "GA4 실시간 보고서 기준",
        desc:
          "최근 약 30분 안에 공개 홈페이지를 연 사용자 수입니다. " +
          "동시접속자(CCU)가 아니며, 당일 집계가 나오기 전 참고용 지표입니다.",
        variant: "live",
      });
    }

    cards +=
      statCard({
        label: "방문자 수",
        value: formatNumber(summary.activeUsers),
        hint: periodHint,
        desc: "선택한 기간 동안 사이트에 들어온 사람 수입니다. 같은 사람은 한 번만 셉니다.",
        pending: waitingToday,
      }) +
      statCard({
        label: "방문 횟수 (세션)",
        value: formatNumber(summary.sessions),
        hint: periodHint,
        desc: "사이트를 연 횟수입니다. 한 사람이 여러 번 방문하면 여러 번 집계됩니다.",
        pending: waitingToday,
      }) +
      statCard({
        label: "페이지 조회수",
        value: formatNumber(summary.pageViews),
        hint: periodHint,
        desc: "페이지를 연 횟수 합계입니다. 메뉴를 이동할 때마다 늘어납니다.",
        pending: waitingToday,
      });

    var notice = "";
    if (extra.includesToday) {
      notice =
        '<div class="admin-stat-notice">' +
        "<strong>오늘 날짜를 조회하셨나요?</strong>" +
        "<p>방문자·세션·페이지 조회수는 Google Analytics가 <strong>하루가 지난 뒤</strong> 또는 <strong>몇 시간 후</strong>에 모아 주기 때문에, " +
        (isTodayOnly ? "오늘만" : "기간에 오늘이 포함되면") +
        " 당일 수치가 <strong>0</strong>으로 보일 수 있습니다.</p>" +
        "<p>오늘 방문이 집계되는지 빠르게 보려면 <strong>「최근 30분 활성」</strong>을 참고하세요. " +
        "정확한 일별 숫자는 어제 이전 날짜를 조회하거나, 다음 날 다시 확인하세요.</p>" +
        "</div>";
    }

    container.innerHTML =
      '<p class="admin-stat-intro">' +
      "아래 통계는 <strong>공개 홈페이지</strong> 방문 기준입니다. " +
      "관리자 페이지(/admin) 방문은 포함되지 않습니다." +
      "</p>" +
      '<div class="admin-stat-cards">' +
      cards +
      "</div>" +
      notice;
  }

  function statCard(options) {
    var badgeHtml = options.badge
      ? '<span class="admin-stat-badge">' + options.badge + "</span>"
      : "";
    var pendingHtml = options.pending
      ? '<span class="admin-stat-badge admin-stat-badge--pending">집계 대기</span>'
      : "";

    return (
      '<article class="admin-stat-card' +
      (options.variant === "live" ? " admin-stat-card--live" : "") +
      '">' +
      '<p class="admin-stat-card-label">' +
      options.label +
      badgeHtml +
      pendingHtml +
      "</p>" +
      '<p class="admin-stat-card-value">' +
      options.value +
      "</p>" +
      '<p class="admin-stat-card-hint">' +
      options.hint +
      "</p>" +
      (options.desc
        ? '<p class="admin-stat-card-desc">' + options.desc + "</p>"
        : "") +
      "</article>"
    );
  }

  function renderDailyChart(container, daily) {
    if (!container) return;
    if (!daily || !daily.length) {
      container.innerHTML =
        '<p class="admin-stat-empty">선택한 기간에 일별 방문 데이터가 없습니다. 오늘 날짜만 조회한 경우 내일 다시 확인해 보세요.</p>';
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
      '<p class="admin-stat-chart-caption">날짜별 방문자 수 — 막대가 높을수록 그날 방문이 많았습니다.</p>' +
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
