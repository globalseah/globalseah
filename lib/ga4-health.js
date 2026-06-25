const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const { isGa4ConfigError, getDefaultDateRange } = require("./ga4-analytics");

function maskEmail(email) {
  if (!email) return "";
  const parts = String(email).split("@");
  if (parts.length !== 2) return email;
  const name = parts[0];
  const masked =
    name.length <= 2 ? name + "***" : name.slice(0, 2) + "***" + name.slice(-1);
  return masked + "@" + parts[1];
}

function checkEnv() {
  const measurementId = process.env.GA4_MEASUREMENT_ID || "";
  const propertyId = String(process.env.GA4_PROPERTY_ID || "").trim();
  const clientEmail = process.env.GA4_CLIENT_EMAIL || "";
  const privateKey = process.env.GA4_PRIVATE_KEY || "";

  const checks = [
    {
      id: "env_measurement",
      label: "GA4_MEASUREMENT_ID (gtag 수집)",
      ok: /^G-[A-Z0-9]+$/.test(measurementId),
      detail: measurementId
        ? "설정됨: " + measurementId
        : "Vercel 환경변수가 비어 있습니다.",
    },
    {
      id: "env_property",
      label: "GA4_PROPERTY_ID (속성 ID 숫자)",
      ok: /^\d+$/.test(propertyId),
      detail: propertyId
        ? "설정됨: " + propertyId
        : "GA4 관리 → 속성 설정의 숫자 ID를 넣어 주세요.",
    },
    {
      id: "env_email",
      label: "GA4_CLIENT_EMAIL (서비스 계정)",
      ok: /@.+\.iam\.gserviceaccount\.com$/.test(clientEmail),
      detail: clientEmail
        ? "설정됨: " + maskEmail(clientEmail)
        : "Google Cloud JSON의 client_email을 넣어 주세요.",
    },
    {
      id: "env_key",
      label: "GA4_PRIVATE_KEY (서비스 계정 키)",
      ok: /BEGIN PRIVATE KEY/.test(privateKey),
      detail: privateKey
        ? "설정됨 (길이 " + privateKey.length + "자)"
        : "JSON의 private_key 전체를 넣어 주세요.",
    },
  ];

  return {
    checks: checks,
    ready: checks.every(function (item) {
      return item.ok;
    }),
  };
}

function getClient() {
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

function googleErrorMessage(err) {
  const message = String((err && err.message) || err || "");
  if (/PERMISSION_DENIED/i.test(message)) {
    return (
      "권한 거부 — GA4 속성 액세스 관리에 서비스 계정 이메일을 뷰어로 추가했는지 확인하세요."
    );
  }
  if (/INVALID_ARGUMENT/i.test(message)) {
    return "요청 오류 — GA4_PROPERTY_ID(숫자)가 올바른지 확인하세요.";
  }
  if (/UNAUTHENTICATED|invalid_grant|DECODER/i.test(message)) {
    return "인증 실패 — GA4_PRIVATE_KEY 형식(줄바꿈 \\n)을 확인하세요.";
  }
  if (/SERVICE_DISABLED|Analytics Data API has not been used/i.test(message)) {
    return "Google Cloud에서 Analytics Data API가 사용 설정되지 않았습니다.";
  }
  return message.slice(0, 200);
}

async function runGa4ApiChecks() {
  const env = checkEnv();
  if (!env.ready) {
    return {
      ok: false,
      checks: env.checks,
      apiChecks: [],
      message: "환경변수 4개를 먼저 모두 설정해 주세요.",
    };
  }

  let client;
  let property;
  try {
    const ctx = getClient();
    client = ctx.client;
    property = ctx.property;
  } catch (err) {
    if (isGa4ConfigError(err)) {
      return {
        ok: false,
        checks: env.checks,
        apiChecks: [],
        message: "GA4 서버 설정이 완료되지 않았습니다.",
      };
    }
    throw err;
  }

  const apiChecks = [];
  const range = getDefaultDateRange(7);

  try {
    const [summaryRes] = await client.runReport({
      property: property,
      dateRanges: [{ startDate: range.startDate, endDate: range.endDate }],
      metrics: [{ name: "activeUsers" }],
    });
    const row = summaryRes.rows && summaryRes.rows[0];
    const users = row ? Number(row.metricValues[0].value || 0) : 0;
    apiChecks.push({
      id: "data_api",
      label: "Analytics Data API (통계 조회)",
      ok: true,
      detail:
        "연결 성공 — 최근 7일(" +
        range.startDate +
        "~" +
        range.endDate +
        ") 방문자 " +
        users +
        "명 (당일은 지연될 수 있음)",
    });
  } catch (err) {
    apiChecks.push({
      id: "data_api",
      label: "Analytics Data API (통계 조회)",
      ok: false,
      detail: googleErrorMessage(err),
    });
  }

  try {
    const [realtimeRes] = await client.runRealtimeReport({
      property: property,
      metrics: [{ name: "activeUsers" }],
    });
    const row = realtimeRes.rows && realtimeRes.rows[0];
    const active = row ? Number(row.metricValues[0].value || 0) : 0;
    apiChecks.push({
      id: "realtime_api",
      label: "Realtime API (최근 30분 활성)",
      ok: true,
      detail:
        "연결 성공 — 최근 30분 활성 사용자 " +
        active +
        "명 (동시접속자 아님 · 당일 집계 전 참고용)",
    });
  } catch (err) {
    apiChecks.push({
      id: "realtime_api",
      label: "Realtime API (실시간)",
      ok: false,
      detail: googleErrorMessage(err),
    });
  }

  const allOk =
    env.checks.every(function (c) {
      return c.ok;
    }) &&
    apiChecks.every(function (c) {
      return c.ok;
    });

  return {
    ok: allOk,
    checks: env.checks,
    apiChecks: apiChecks,
    message: allOk
      ? "GA4 · Google Cloud 연결이 정상입니다."
      : "일부 항목에 문제가 있습니다. 아래 detail을 확인하세요.",
  };
}

module.exports = {
  checkEnv,
  runGa4ApiChecks,
  googleErrorMessage,
};
