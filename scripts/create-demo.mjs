import { chromium } from "@playwright/test";
import fs from "node:fs";
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage();
  const photo = fs
    .readFileSync("public/images/rri/studio.jpg")
    .toString("base64");
  const result = await page.evaluate(async (photo) => {
    const image = new Image();
    image.src = "data:image/jpeg;base64," + photo;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext("2d");
    const stream = canvas.captureStream(24);
    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
      videoBitsPerSecond: 900000,
    });
    const chunks = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    const complete = new Promise((resolve) => {
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.readAsDataURL(blob);
      };
    });
    const start = performance.now();
    function paint() {
      const scale = Math.max(1280 / image.width, 720 / image.height);
      ctx.drawImage(
        image,
        (1280 - image.width * scale) / 2,
        (720 - image.height * scale) / 2,
        image.width * scale,
        image.height * scale,
      );
      ctx.fillStyle = "rgba(3,17,31,.8)";
      ctx.fillRect(1075, 560, 170, 80);
      ctx.fillStyle = "#22d99a";
      for (let i = 0; i < 20; i++) {
        const h =
          12 + Math.abs(Math.sin((performance.now() - start) / 250 + i)) * 36;
        ctx.fillRect(1090 + i * 7, 623 - h, 4, h);
      }
    }
    paint();
    recorder.start();
    const timer = setInterval(paint, 1000 / 24);
    await new Promise((r) => setTimeout(r, 4000));
    clearInterval(timer);
    recorder.stop();
    const data = await complete;
    stream.getTracks().forEach((t) => t.stop());
    return data;
  }, photo);
  fs.mkdirSync("public/media", { recursive: true });
  fs.writeFileSync(
    "public/media/studio-demo.webm",
    Buffer.from(result, "base64"),
  );
  await browser.close();
  console.log("Created local studio demo video.");
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
