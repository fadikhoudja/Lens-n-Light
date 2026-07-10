const sharp = require("sharp");

const MAX_WIDTH = 1920;
const JPEG_QUALITY = 85;
const FORMAT_MAP = { jpeg: "jpeg", jpg: "jpeg", png: "png", webp: "webp", avif: "avif", tiff: "tiff" };

async function resizeBuffer(buffer) {
  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || metadata.width <= MAX_WIDTH) return buffer;

  const fmt = FORMAT_MAP[metadata.format] || "jpeg";
  let pipeline = sharp(buffer).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true });

  if (fmt === "jpeg") {
    pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
  } else if (fmt === "png") {
    pipeline = pipeline.png({ compressionLevel: 8 });
  } else if (fmt === "webp") {
    pipeline = pipeline.webp({ quality: JPEG_QUALITY });
  } else if (fmt === "avif") {
    pipeline = pipeline.avif({ quality: JPEG_QUALITY });
  }

  return pipeline.toBuffer();
}

module.exports = { resizeBuffer };
