const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const MAX_WIDTH = 1920;
const JPEG_QUALITY = 85;

const FORMAT_MAP = {
  ".jpg": "jpeg",
  ".jpeg": "jpeg",
  ".png": "png",
  ".webp": "webp",
  ".avif": "avif",
  ".tiff": "jpeg",
  ".tif": "jpeg",
};

async function resizeImage(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === ".gif") return;

    const stat = fs.statSync(filePath);
    if (stat.size < 100 * 1024) return;

    const image = sharp(filePath);
    const metadata = await image.metadata();

    if (metadata.width > MAX_WIDTH) {
      const format = FORMAT_MAP[ext] || "jpeg";
      const pipeline = image.resize({ width: MAX_WIDTH, withoutEnlargement: true });
      if (format === "jpeg") {
        pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
      } else if (format === "png") {
        pipeline.png({ compressionLevel: 8 });
      } else if (format === "webp") {
        pipeline.webp({ quality: JPEG_QUALITY });
      } else if (format === "avif") {
        pipeline.avif({ quality: JPEG_QUALITY });
      }

      const tmpPath = filePath.replace(/(\.[^.]+)$/, "_resized$1");
      await pipeline.toFile(tmpPath);
      fs.renameSync(tmpPath, filePath);
    }
  } catch (err) {
    console.error("Image resize failed:", filePath, err.message);
  }
}

module.exports = { resizeImage };
