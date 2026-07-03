const sharp = require("sharp");
const path = require("path");

const MAX_WIDTH = 1920;
const QUALITY = 85;

async function resizeImage(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === ".gif") return;

    const image = sharp(filePath);
    const metadata = await image.metadata();

    if (metadata.width > MAX_WIDTH) {
      await image
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .jpeg({ quality: QUALITY, mozjpeg: true })
        .toFile(filePath.replace(/(\.[^.]+)$/, "_resized$1"));

      const fs = require("fs");
      fs.renameSync(filePath.replace(/(\.[^.]+)$/, "_resized$1"), filePath);
    }
  } catch (err) {
    console.error("Image resize failed:", filePath, err.message);
  }
}

module.exports = { resizeImage };
