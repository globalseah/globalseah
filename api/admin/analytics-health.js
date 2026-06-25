const { runGa4ApiChecks } = require("../../lib/ga4-health");

function sendJson(res, status, body) {
  res.status(status).json(body);
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(res, 405, { ok: false, error: "Method not allowed" });
  }

  try {
    const result = await runGa4ApiChecks();
    return sendJson(res, 200, { ok: result.ok, data: result });
  } catch (err) {
    console.error("GA4 health check error:", err);
    return sendJson(res, 500, {
      ok: false,
      error: "연결 진단 중 오류가 발생했습니다.",
    });
  }
};
