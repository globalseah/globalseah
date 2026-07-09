const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");
const {
  getSupabaseAdmin,
  isSupabaseConfigError,
  STORAGE_BUCKET,
} = require("../../lib/supabase-admin");

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024;
const MAX_UPLOAD_SIZE = MAX_DOCUMENT_SIZE;

const IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

const DOCUMENT_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
]);

const NOTICE_MIME = new Set([...IMAGE_MIME, ...DOCUMENT_MIME]);
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
      maxFileSize: MAX_UPLOAD_SIZE,
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
  if (mime === "application/pdf") return ".pdf";
  if (mime === "application/msword") return ".doc";
  if (mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return ".docx";
  }
  if (mime === "application/vnd.ms-excel") return ".xls";
  if (mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
    return ".xlsx";
  }
  if (mime === "application/vnd.ms-powerpoint") return ".ppt";
  if (mime === "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
    return ".pptx";
  }
  if (mime === "text/plain") return ".txt";
  if (mime === "application/zip" || mime === "application/x-zip-compressed") {
    return ".zip";
  }
  return "";
}

function fileKind(mime, category) {
  if (!mime) return null;
  if (IMAGE_MIME.has(mime)) return "image";
  if (category === "notice" && DOCUMENT_MIME.has(mime)) return "document";
  return null;
}

function allowedMimeForCategory(category) {
  if (category === "portfolio") return IMAGE_MIME;
  if (category === "notice") return NOTICE_MIME;
  return new Set();
}

function maxSizeForKind(kind) {
  return kind === "document" ? MAX_DOCUMENT_SIZE : MAX_IMAGE_SIZE;
}

function sanitizeFilename(name) {
  const base = path.basename(String(name || "첨부파일"));
  return base.replace(/[^\w.\-()\u3131-\uD79D\s가-힣]/g, "_") || "첨부파일";
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

    const mime = upload.mimetype || "";
    const allowed = allowedMimeForCategory(category);

    if (!mime || !allowed.has(mime)) {
      return res.status(400).json({
        ok: false,
        error:
          category === "notice"
            ? "지원하지 않는 파일 형식입니다. 이미지 또는 PDF·Office·ZIP·TXT 문서만 업로드할 수 있습니다."
            : "JPEG, PNG, GIF, WEBP 이미지만 업로드할 수 있습니다.",
      });
    }

    const kind = fileKind(mime, category);
    if (!kind) {
      return res.status(400).json({
        ok: false,
        error: "지원하지 않는 파일 형식입니다.",
      });
    }

    const sizeLimit = maxSizeForKind(kind);
    if (upload.size > sizeLimit) {
      return res.status(400).json({
        ok: false,
        error:
          kind === "document"
            ? "문서 파일은 20MB 이하만 업로드할 수 있습니다."
            : "이미지는 5MB 이하만 업로드할 수 있습니다.",
      });
    }

    tempPath = upload.filepath;
    const ext =
      path.extname(upload.originalFilename || "") ||
      extensionFromMime(mime) ||
      ".bin";
    const objectPath =
      category +
      "/" +
      Date.now() +
      "-" +
      crypto.randomBytes(8).toString("hex") +
      ext.toLowerCase();

    const fileBuffer = fs.readFileSync(upload.filepath);
    const contentType = mime || "application/octet-stream";
    const originalName = sanitizeFilename(upload.originalFilename);

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
        error: "파일 업로드에 실패했습니다.",
      });
    }

    const { data: publicData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(objectPath);

    return res.status(200).json({
      ok: true,
      url: publicData.publicUrl,
      path: objectPath,
      name: originalName,
      mime: contentType,
      kind: kind,
      size: upload.size,
    });
  } catch (err) {
    console.error("Admin upload API error:", err);

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        ok: false,
        error: "파일은 20MB 이하만 업로드할 수 있습니다.",
      });
    }

    return res.status(500).json({
      ok: false,
      error: "파일 업로드 중 오류가 발생했습니다.",
    });
  } finally {
    if (tempPath) {
      fs.unlink(tempPath, function () {});
    }
  }
};
