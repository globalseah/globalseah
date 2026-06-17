/**
 * 로컬 API 스모크 테스트 (node scripts/test-contact-api.mjs)
 * RESEND_API_KEY 없으면 503, 있으면 실제 발송 시도는 하지 않고 파싱만 검증 가능
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import http from "http";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const handler = require("../api/contact.js");

function createMockReq({ fields = {}, file = null } = {}) {
  const boundary = "----TestBoundary";
  const chunks = [];

  for (const [key, value] of Object.entries(fields)) {
    chunks.push(
      `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="${key}"\r\n\r\n` +
        `${value}\r\n`
    );
  }

  if (file) {
    const content = fs.readFileSync(file.path);
    chunks.push(
      `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="attachment"; filename="${file.name}"\r\n` +
        `Content-Type: ${file.type}\r\n\r\n`
    );
    chunks.push(content);
    chunks.push("\r\n");
  }

  chunks.push(`--${boundary}--\r\n`);
  const body = Buffer.concat(chunks.map((part) => (Buffer.isBuffer(part) ? part : Buffer.from(part))));

  const stream = new http.IncomingMessage();
  stream.method = "POST";
  stream.headers = {
    "content-type": `multipart/form-data; boundary=${boundary}`,
    "content-length": String(body.length),
  };
  stream.push(body);
  stream.push(null);
  return stream;
}

function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

async function run() {
  const sampleFile = path.join(__dirname, "../assets/images/headlogo.png");
  const req = createMockReq({
    fields: {
      subject: "API 테스트",
      name: "테스트",
      phone: "010-0000-0000",
      email: "test@example.com",
      message: "첨부파일 포함 테스트",
    },
    file: { path: sampleFile, name: "test-logo.png", type: "image/png" },
  });
  const res = createMockRes();

  await handler(req, res);

  console.log("status:", res.statusCode);
  console.log("body:", res.body);

  if (!process.env.RESEND_API_KEY && res.statusCode === 503) {
    console.log("\nOK: API 파싱 정상, RESEND_API_KEY 설정 후 실발송 테스트 가능");
    process.exit(0);
  }

  if (res.statusCode === 200) {
    console.log("\nOK: 이메일 발송 성공");
    process.exit(0);
  }

  process.exit(res.statusCode >= 400 ? 1 : 0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
