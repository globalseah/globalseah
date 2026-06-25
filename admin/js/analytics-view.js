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
    var isDashboard = extra.dashboard === true;

    var periodHint =
      "집계 기간: " +
      (extra.confirmedLabel || rangeLabel || "");

    var mainCards =
      statCard({
        label: "방문자 수",
        value: formatNumber(summary.activeUsers),
        hint: periodHint,
        desc: "선택한 기간 동안 사이트에 들어온 사람 수입니다. 같은 사람은 한 번만 셉니다.",
      }) +
      statCard({
        label: "방문 횟수 (세션)",
        value: formatNumber(summary.sessions),
        hint: periodHint,
        desc: "사이트를 연 횟수입니다. 한 사람이 여러 번 방문하면 여러 번 집계됩니다.",
      }) +
      statCard({
        label: "페이지 조회수",
        value: formatNumber(summary.pageViews),
        hint: periodHint,
        desc: "페이지를 연 횟수 합계입니다. 메뉴를 이동할 때마다 늘어납니다.",
      });

    var mainCardsHtml = isDashboard
      ? ""
      : '<div class="admin-stat-cards admin-stat-cards--main">' + mainCards + "</div>";

    var baselineText = isDashboard
      ? "기준: 어제까지 집계 완료된 데이터입니다"
      : "기준: 어제까지 집계 완료된 데이터입니다 (오늘 데이터는 1~2일 내 반영됩니다)";

    var introHtml = isDashboard
      ? ""
      : '<p class="admin-stat-intro">' +
        "아래 통계는 <strong>공개 홈페이지</strong> 방문 기준입니다. " +
        "관리자 페이지(/admin) 방문은 포함되지 않습니다." +
        "</p>";

    var auxBlock = "";
    if (extra.realtime) {
      auxBlock =
        '<div class="admin-stat-aux-block">' +
        '<div class="admin-stat-cards admin-stat-cards--aux">' +
        statCard({
          label: "최근 30분 활성",
          value: formatNumber(extra.realtime.activeUsers),
          variant: "aux",
          footer:
            "최근 30분간 방문한 누적 방문자 수입니다. 지금 보고 있는 인원수가 아닙니다.",
        }) +
        "</div></div>";
    }

    var notice = "";
    if (extra.includesToday) {
      notice =
        '<div class="admin-stat-notice">' +
        "<p>오늘 데이터는 아직 집계 중입니다. Google 정책상 정확한 수치는 1~2일 후 반영됩니다.</p>" +
        "<p>지금 상황이 궁금하시면 위 '최근 30분 활성'을 참고해주세요.</p>" +
        "</div>";
    }

    container.innerHTML =
      introHtml +
      '<div class="admin-stat-summary-block">' +
      '<p class="admin-stat-baseline">' +
      baselineText +
      "</p>" +
      mainCardsHtml +
      "</div>" +
      auxBlock +
      notice;
  }

  function statCard(options) {
    return (
      '<article class="admin-stat-card' +
      (options.variant === "aux" ? " admin-stat-card--aux" : "") +
      '">' +
      '<p class="admin-stat-card-label">' +
      options.label +
      "</p>" +
      '<p class="admin-stat-card-value">' +
      options.value +
      "</p>" +
      (options.hint
        ? '<p class="admin-stat-card-hint">' + options.hint + "</p>"
        : "") +
      (options.desc
        ? '<p class="admin-stat-card-desc">' + options.desc + "</p>"
        : "") +
      (options.footer
        ? '<p class="admin-stat-card-footer">' + options.footer + "</p>"
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
