/**
 * 브라우저 화면과 동일하게 메인 페이지를 PNG·PDF로 저장합니다.
 * 사용: npm install && npx playwright install chromium && npm run capture
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seahRoot = path.resolve(__dirname, "..");
const exportsDir = path.join(seahRoot, "exports");
const indexUrl = pathToFileURL(path.join(seahRoot, "index.html")).href;

const VIEWPORT_WIDTH = 1280;

if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}

const stamp = new Date().toISOString().slice(0, 10);
const pngPath = path.join(exportsDir, `글로벌세아-메인-${stamp}.png`);
const pdfPath = path.join(exportsDir, `글로벌세아-메인-${stamp}.pdf`);

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: VIEWPORT_WIDTH, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto(indexUrl, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(800);

await page.screenshot({
  path: pngPath,
  fullPage: true,
  type: "png",
});

await page.emulateMedia({ media: "screen" });
const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);

await page.pdf({
  path: pdfPath,
  printBackground: true,
  width: `${VIEWPORT_WIDTH}px`,
  height: `${pageHeight}px`,
  margin: { top: "0", right: "0", bottom: "0", left: "0" },
});

await browser.close();

console.log("저장 완료 (화면 기준 캡처):");
console.log("  PNG:", pngPath);
console.log("  PDF:", pdfPath);
