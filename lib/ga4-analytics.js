const { BetaAnalyticsDataClient } = require("@google-analytics/data");

function isGa4ConfigError(err) {
  return Boolean(err && err.code === "GA4_NOT_CONFIGURED");
}

function getGa4Context() {
  const email = process.env.GA4_CLIENT_EMAIL;
  const privateKey = process.env.GA4_PRIVATE_KEY;
  const propertyId = String(process.env.GA4_PROPERTY_ID || "").trim();

  if (!email || !privateKey || !propertyId) {
    const err = new Error("GA4_NOT_CONFIGURED");
    err.code = "GA4_NOT_CONFIGURED";
    throw err;
  }

  return {
    client: new BetaAnalyticsDataClient({
      credentials: {
        client_email: email,
        private_key: privateKey.replace(/\\n/g, "\n"),
      },
    }),
    property: "properties/" + propertyId,
  };
}

function parseDateInput(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || "").trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return {
    iso: match[1] + "-" + match[2] + "-" + match[3],
    date: date,
  };
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}

function getDefaultDateRange(days) {
  const count = Math.max(1, Number(days) || 7);
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - (count - 1));

  return resolveCustomDateRange(formatDate(start), formatDate(end));
}

function resolveCustomDateRange(startInput, endInput) {
  const start = parseDateInput(startInput);
  const end = parseDateInput(endInput);

  if (!start || !end) {
    return { error: "날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)" };
  }

  if (start.date > end.date) {
    return { error: "시작일은 종료일보다 이후일 수 없습니다." };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (end.date > today) {
    return { error: "종료일은 오늘 이후로 설정할 수 없습니다." };
  }

  const maxDays = 366;
  const diffDays =
    Math.floor((end.date.getTime() - start.date.getTime()) / 86400000) + 1;
  if (diffDays > maxDays) {
    return { error: "조회 기간은 최대 " + maxDays + "일까지 가능합니다." };
  }

  const label =
    start.iso === end.iso ? start.iso : start.iso + " ~ " + end.iso;

  return {
    startDate: start.iso,
    endDate: end.iso,
    label: label,
    days: diffDays,
  };
}

function dimValue(row, index) {
  return (row.dimensionValues[index] && row.dimensionValues[index].value) || "";
}

function metricValue(row, index) {
  return Number((row.metricValues[index] && row.metricValues[index].value) || 0);
}

function formatGaDate(value) {
  if (!value || value.length !== 8) return value;
  return value.slice(4, 6) + "-" + value.slice(6, 8);
}

function formatCountry(name) {
  const map = {
    "South Korea": "대한민국",
    Korea: "대한민국",
    "(not set)": "(미설정)",
  };
  return map[name] || name;
}

function formatDevice(name) {
  const map = {
    desktop: "데스크톱",
    mobile: "모바일",
    tablet: "태블릿",
  };
  return map[name] || name;
}

function formatChannel(name) {
  const map = {
    Direct: "직접",
    "Organic Search": "검색",
    "Organic Social": "소셜",
    Referral: "리퍼럴",
    "Paid Search": "유료 검색",
    Email: "이메일",
    Unassigned: "미분류",
  };
  return map[name] || name;
}

async function fetchRealtimeActiveUsers(client, property) {
  const [response] = await client.runRealtimeReport({
    property: property,
    metrics: [{ name: "activeUsers" }],
  });
  const row = response.rows && response.rows[0];
  return row ? metricValue(row, 0) : 0;
}

async function fetchAnalytics(options) {
  const range =
    options && options.startDate && options.endDate
      ? resolveCustomDateRange(options.startDate, options.endDate)
      : getDefaultDateRange(7);

  if (range.error) {
    const err = new Error(range.error);
    err.code = "INVALID_DATE_RANGE";
    throw err;
  }

  const { client, property } = getGa4Context();
  const dateRanges = [{ startDate: range.startDate, endDate: range.endDate }];

  const [summaryRes, dailyRes, channelRes, pageRes, deviceRes, regionRes] =
    await Promise.all([
      client.runReport({
        property: property,
        dateRanges: dateRanges,
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
        ],
      }),
      client.runReport({
        property: property,
        dateRanges: dateRanges,
        dimensions: [{ name: "date" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      }),
      client.runReport({
        property: property,
        dateRanges: dateRanges,
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10,
      }),
      client.runReport({
        property: property,
        dateRanges: dateRanges,
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 15,
      }),
      client.runReport({
        property: property,
        dateRanges: dateRanges,
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      }),
      client.runReport({
        property: property,
        dateRanges: dateRanges,
        dimensions: [{ name: "country" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 10,
      }),
    ]);

  const summaryRow =
    (summaryRes[0] && summaryRes[0].rows && summaryRes[0].rows[0]) || null;

  const todayIso = formatDate(new Date());
  const includesToday = range.endDate >= todayIso && range.startDate <= todayIso;

  let realtime = null;
  if (includesToday) {
    try {
      realtime = {
        activeUsers: await fetchRealtimeActiveUsers(client, property),
      };
    } catch (err) {
      console.error("GA4 realtime error:", err);
    }
  }

  return {
    range: range,
    includesToday: includesToday,
    realtime: realtime,
    summary: {
      activeUsers: summaryRow ? metricValue(summaryRow, 0) : 0,
      sessions: summaryRow ? metricValue(summaryRow, 1) : 0,
      pageViews: summaryRow ? metricValue(summaryRow, 2) : 0,
    },
    daily: ((dailyRes[0] && dailyRes[0].rows) || []).map(function (row) {
      const rawDate = dimValue(row, 0);
      return {
        date: rawDate,
        label: formatGaDate(rawDate),
        activeUsers: metricValue(row, 0),
      };
    }),
    channels: ((channelRes[0] && channelRes[0].rows) || []).map(function (row) {
      const name = dimValue(row, 0);
      return {
        name: name,
        label: formatChannel(name),
        sessions: metricValue(row, 0),
      };
    }),
    pages: ((pageRes[0] && pageRes[0].rows) || []).map(function (row) {
      return {
        path: dimValue(row, 0),
        views: metricValue(row, 0),
      };
    }),
    devices: ((deviceRes[0] && deviceRes[0].rows) || []).map(function (row) {
      const name = dimValue(row, 0);
      return {
        name: name,
        label: formatDevice(name),
        users: metricValue(row, 0),
      };
    }),
    regions: ((regionRes[0] && regionRes[0].rows) || []).map(function (row) {
      const name = dimValue(row, 0);
      return {
        name: name,
        label: formatCountry(name),
        users: metricValue(row, 0),
      };
    }),
  };
}

module.exports = {
  isGa4ConfigError,
  fetchAnalytics,
  resolveCustomDateRange,
  getDefaultDateRange,
  formatDate,
};
