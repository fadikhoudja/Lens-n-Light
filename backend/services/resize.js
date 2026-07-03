const sharp = require("sharp");

const MAX_WIDTH = 1920;
const JPEG_QUALITY = 85;

async function resizeBuffer(buffer) {
  const metadata = await sharp(buffer).metadata();
  if (metadata.width > MAX_WIDTH) {
    return sharp(buffer)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer();
  }
  return buffer;
}

module.exports = { resizeBuffer };
