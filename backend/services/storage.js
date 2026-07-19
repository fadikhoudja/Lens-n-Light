const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { uploadBuffer, destroyImage } = require("../config/cloudinary");

const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

function saveLocal(buffer, ext = "jpg") {
  const filename = `${crypto.randomBytes(16).toString("hex")}.${ext}`;
  const filepath = path.join(UPLOADS_DIR, filename);
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  fs.writeFileSync(filepath, buffer);
  return { secure_url: `/uploads/${filename}`, public_id: null };
}

function destroyLocal(photo) {
  if (!photo.image) return;
  const filepath = path.join(UPLOADS_DIR, path.basename(photo.image));
  try { fs.unlinkSync(filepath); } catch { /* ignore */ }
}

async function store(buffer, ext) {
  const hasCloudKeys = process.env.CLOUDINARY_CLOUD_NAME
    && process.env.CLOUDINARY_API_KEY
    && process.env.CLOUDINARY_API_SECRET;

  if (hasCloudKeys) {
    try {
      return await uploadBuffer(buffer);
    } catch (err) {
      console.warn("Cloudinary upload failed, falling back to local storage:", err.message);
    }
  }
  return saveLocal(buffer, ext);
}

function destroy(photo) {
  if (photo.public_id) {
    destroyImage(photo.public_id).catch((e) => console.error("Cloudinary delete failed:", e.message));
  } else {
    destroyLocal(photo);
  }
}

module.exports = { store, destroy, saveLocal, destroyLocal };
