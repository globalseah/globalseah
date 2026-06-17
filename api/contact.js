const formidable = require("formidable");
const fs = require("fs");
const { Resend } = require("resend");

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/zip",
  "application/x-zip-compressed",
]);

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
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm({
      maxFileSize: MAX_FILE_SIZE,
      keepExtensions: true,
      multiples: false,
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL || "dawoon4209@gmail.com";
  const fromEmail =
    process.env.CONTACT_FROM_EMAIL || "글로벌세아 <onboarding@resend.dev>";

  if (!apiKey) {
    return res.status(503).json({
      ok: false,
      error: "이메일 발송 설정이 완료되지 않았습니다. (RESEND_API_KEY)",
    });
  }

  let attachmentPath = null;

  try {
    const { fields, files } = await parseForm(req);

    const subject = getField(fields, "subject").trim();
    const name = getField(fields, "name").trim();
    const phone = getField(fields, "phone").trim();
    const email = getField(fields, "email").trim();
    const message = getField(fields, "message").trim();

    if (!subject || !name || !email || !message) {
      return res.status(400).json({ ok: false, error: "필수 항목을 모두 입력해 주세요." });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ ok: false, error: "이메일 형식을 확인해 주세요." });
    }

    const resend = new Resend(apiKey);
    const attachments = [];
    const upload = getFile(files, "attachment");

    if (upload && upload.size > 0) {
      if (upload.mimetype && !ALLOWED_MIME.has(upload.mimetype)) {
        return res.status(400).json({
          ok: false,
          error: "지원하지 않는 첨부파일 형식입니다. (PDF, 이미지, Office, ZIP)",
        });
      }

      attachmentPath = upload.filepath;
      attachments.push({
        filename: upload.originalFilename || "attachment",
        content: fs.readFileSync(upload.filepath),
      });
    }

    const html = `
      <h2>홈페이지 문의</h2>
      <p><strong>제목</strong><br>${escapeHtml(subject)}</p>
      <p><strong>이름/회사명</strong><br>${escapeHtml(name)}</p>
      <p><strong>연락처</strong><br>${escapeHtml(phone || "-")}</p>
      <p><strong>이메일</strong><br>${escapeHtml(email)}</p>
      <p><strong>문의사항</strong><br>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
    `;

    const text = [
      "홈페이지 문의",
      "",
      `제목: ${subject}`,
      `이름/회사명: ${name}`,
      `연락처: ${phone || "-"}`,
      `이메일: ${email}`,
      "",
      message,
    ].join("\n");

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email,
      subject: `[홈페이지 문의] ${subject}`,
      html,
      text,
      attachments: attachments.length ? attachments : undefined,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(502).json({
        ok: false,
        error: "이메일 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Contact API error:", err);

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        ok: false,
        error: "첨부파일은 5MB 이하만 업로드할 수 있습니다.",
      });
    }

    return res.status(500).json({
      ok: false,
      error: "문의 전송 중 오류가 발생했습니다.",
    });
  } finally {
    if (attachmentPath) {
      fs.unlink(attachmentPath, () => {});
    }
  }
};
