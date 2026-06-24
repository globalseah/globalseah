const {
  getSupabaseAdmin,
  isSupabaseConfigError,
} = require("../../lib/supabase-admin");
const {
  validatePostPayload,
  buildInsertRow,
  buildUpdateRow,
} = require("../../lib/posts-validate");

function readJsonBody(req) {
  return new Promise(function (resolve, reject) {
    let raw = "";
    req.on("data", function (chunk) {
      raw += chunk;
    });
    req.on("end", function () {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(new Error("INVALID_JSON"));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, body) {
  res.status(status).json(body);
}

module.exports = async function handler(req, res) {
  let supabase;

  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    if (isSupabaseConfigError(err)) {
      return sendJson(res, 503, {
        ok: false,
        error: "Supabase 설정이 완료되지 않았습니다.",
      });
    }
    throw err;
  }

  try {
    if (req.method === "GET") {
      return await handleGet(req, res, supabase);
    }
    if (req.method === "POST") {
      return await handlePost(req, res, supabase);
    }
    if (req.method === "PATCH") {
      return await handlePatch(req, res, supabase);
    }
    if (req.method === "DELETE") {
      return await handleDelete(req, res, supabase);
    }

    res.setHeader("Allow", "GET, POST, PATCH, DELETE");
    return sendJson(res, 405, { ok: false, error: "Method not allowed" });
  } catch (err) {
    console.error("Admin posts API error:", err);

    if (err.message === "INVALID_JSON") {
      return sendJson(res, 400, { ok: false, error: "JSON 형식이 올바르지 않습니다." });
    }

    return sendJson(res, 500, {
      ok: false,
      error: "게시글 처리 중 오류가 발생했습니다.",
    });
  }
};

async function handleGet(req, res, supabase) {
  const id = (req.query.id || "").trim();
  const category = (req.query.category || "").trim();

  if (id) {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Supabase select error:", error);
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
    console.error("Supabase list error:", error);
    return sendJson(res, 500, { ok: false, error: "목록 조회에 실패했습니다." });
  }

  return sendJson(res, 200, { ok: true, items: data || [] });
}

async function handlePost(req, res, supabase) {
  const payload = await readJsonBody(req);
  const validationError = validatePostPayload(payload, true);

  if (validationError) {
    return sendJson(res, 400, { ok: false, error: validationError });
  }

  const built = buildInsertRow(payload);
  if (built.error) {
    return sendJson(res, 400, { ok: false, error: built.error });
  }

  const { data, error } = await supabase
    .from("posts")
    .insert(built.row)
    .select("*")
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return sendJson(res, 500, { ok: false, error: "게시글 등록에 실패했습니다." });
  }

  return sendJson(res, 201, { ok: true, item: data });
}

async function handlePatch(req, res, supabase) {
  const payload = await readJsonBody(req);
  const id = trim(payload.id || req.query.id);

  if (!id) {
    return sendJson(res, 400, { ok: false, error: "수정할 게시글 id가 필요합니다." });
  }

  const { data: existing, error: fetchError } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    console.error("Supabase fetch error:", fetchError);
    return sendJson(res, 500, { ok: false, error: "게시글 조회에 실패했습니다." });
  }

  if (!existing) {
    return sendJson(res, 404, { ok: false, error: "게시글을 찾을 수 없습니다." });
  }

  const merged = Object.assign({}, existing, payload, { category: existing.category });
  const validationError = validatePostPayload(merged, false);
  if (validationError) {
    return sendJson(res, 400, { ok: false, error: validationError });
  }

  const built = buildUpdateRow(payload, existing);
  if (built.error) {
    return sendJson(res, 400, { ok: false, error: built.error });
  }

  if (!Object.keys(built.updates).length) {
    return sendJson(res, 400, { ok: false, error: "수정할 내용이 없습니다." });
  }

  const { data, error } = await supabase
    .from("posts")
    .update(built.updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Supabase update error:", error);
    return sendJson(res, 500, { ok: false, error: "게시글 수정에 실패했습니다." });
  }

  return sendJson(res, 200, { ok: true, item: data });
}

async function handleDelete(req, res, supabase) {
  const id = trim(req.query.id || "");

  if (!id) {
    return sendJson(res, 400, { ok: false, error: "삭제할 게시글 id가 필요합니다." });
  }

  const { data: existing, error: fetchError } = await supabase
    .from("posts")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    console.error("Supabase fetch error:", fetchError);
    return sendJson(res, 500, { ok: false, error: "게시글 조회에 실패했습니다." });
  }

  if (!existing) {
    return sendJson(res, 404, { ok: false, error: "게시글을 찾을 수 없습니다." });
  }

  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    console.error("Supabase delete error:", error);
    return sendJson(res, 500, { ok: false, error: "게시글 삭제에 실패했습니다." });
  }

  return sendJson(res, 200, { ok: true });
}

function trim(value) {
  return String(value == null ? "" : value).trim();
}
