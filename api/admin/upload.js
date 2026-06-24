const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");
const {
  getSupabaseAdmin,
  isSupabaseConfigError,
  STORAGE_BUCKET,
} = require("../../lib/supabase-admin");

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);
const ALLOWED_CATEGORY = new Set(["notice", "portfolio"]);

function getField(fields, name) {
  const value = fields[name];
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

function getFile(files, name) {
  const value = files[name];
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}

function parseForm(req) {
  return new Promise(function (resolve, reject) {
    const form = new formidable.IncomingForm({
      maxFileSize: MAX_FILE_SIZE,
      keepExtensions: true,
      multiples: false,
    });

    form.parse(req, function (err, fields, files) {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

function extensionFromMime(mime) {
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/gif") return ".gif";
  if (mime === "image/webp") return ".webp";
  return ".jpg";
}

module.exports.config = {
  api: {
    bodyParser: false,
  },
};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  let supabase;

  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    if (isSupabaseConfigError(err)) {
      return res.status(503).json({
        ok: false,
        error: "Supabase 설정이 완료되지 않았습니다.",
      });
    }
    throw err;
  }

  let tempPath = null;

  try {
    const { fields, files } = await parseForm(req);
    const category = String(getField(fields, "category")).trim();

    if (!ALLOWED_CATEGORY.has(category)) {
      return res.status(400).json({
        ok: false,
        error: "category는 notice 또는 portfolio여야 합니다.",
      });
    }

    const upload = getFile(files, "file");
    if (!upload || !upload.size) {
      return res.status(400).json({ ok: false, error: "업로드할 파일이 없습니다." });
    }

    if (upload.mimetype && !ALLOWED_MIME.has(upload.mimetype)) {
      return res.status(400).json({
        ok: false,
        error: "JPEG, PNG, GIF, WEBP 이미지만 업로드할 수 있습니다.",
      });
    }

    tempPath = upload.filepath;
    const ext =
      path.extname(upload.originalFilename || "") ||
      extensionFromMime(upload.mimetype);
    const objectPath =
      category +
      "/" +
      Date.now() +
      "-" +
      crypto.randomBytes(8).toString("hex") +
      ext.toLowerCase();

    const fileBuffer = fs.readFileSync(upload.filepath);
    const contentType = upload.mimetype || "application/octet-stream";

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(objectPath, fileBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      return res.status(500).json({
        ok: false,
        error: "이미지 업로드에 실패했습니다.",
      });
    }

    const { data: publicData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(objectPath);

    return res.status(200).json({
      ok: true,
      url: publicData.publicUrl,
      path: objectPath,
    });
  } catch (err) {
    console.error("Admin upload API error:", err);

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        ok: false,
        error: "이미지는 5MB 이하만 업로드할 수 있습니다.",
      });
    }

    return res.status(500).json({
      ok: false,
      error: "이미지 업로드 중 오류가 발생했습니다.",
    });
  } finally {
    if (tempPath) {
      fs.unlink(tempPath, function () {});
    }
  }
};
