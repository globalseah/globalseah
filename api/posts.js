const { createClient } = require("@supabase/supabase-js");

function sendJson(res, status, body) {
  res.status(status).json(body);
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(res, 405, { ok: false, error: "Method not allowed" });
  }

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return sendJson(res, 503, {
      ok: false,
      error: "게시글 서비스 설정이 완료되지 않았습니다.",
    });
  }

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const id = (req.query.id || "").trim();
  const category = (req.query.category || "").trim();

  try {
    if (id) {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Public posts select error:", error);
        return sendJson(res, 500, { ok: false, error: "게시글 조회에 실패했습니다." });
      }

      if (!data) {
        return sendJson(res, 404, { ok: false, error: "게시글을 찾을 수 없습니다." });
      }

      return sendJson(res, 200, { ok: true, item: data });
    }

    if (!category) {
      return sendJson(res, 400, {
        ok: false,
        error: "category 또는 id 쿼리가 필요합니다.",
      });
    }

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("category", category)
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Public posts list error:", error);
      return sendJson(res, 500, { ok: false, error: "목록 조회에 실패했습니다." });
    }

    return sendJson(res, 200, { ok: true, items: data || [] });
  } catch (err) {
    console.error("Public posts API error:", err);
    return sendJson(res, 500, { ok: false, error: "게시글 처리 중 오류가 발생했습니다." });
  }
};
