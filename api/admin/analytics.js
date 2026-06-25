const {
  fetchAnalytics,
  isGa4ConfigError,
} = require("../../lib/ga4-analytics");

function sendJson(res, status, body) {
  res.status(status).json(body);
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(res, 405, { ok: false, error: "Method not allowed" });
  }

  const range = String(req.query.range || "7d").trim();

  try {
    const data = await fetchAnalytics(range);
    return sendJson(res, 200, { ok: true, data: data });
  } catch (err) {
    if (isGa4ConfigError(err)) {
      return sendJson(res, 503, {
        ok: false,
        error:
          "GA4 통계 설정이 완료되지 않았습니다. Vercel 환경변수를 확인해 주세요.",
        code: "GA4_NOT_CONFIGURED",
      });
    }

    console.error("GA4 analytics error:", err);
    return sendJson(res, 500, {
      ok: false,
      error: "통계 데이터를 불러오지 못했습니다.",
    });
  }
};
