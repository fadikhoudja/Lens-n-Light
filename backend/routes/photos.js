const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Photo = require("../models/Photo");
const auth = require("../middleware/auth");
const { categorizeImage } = require("../services/ai");
const { resizeBuffer } = require("../services/resize");
const { uploadBuffer, destroyImage } = require("../config/cloudinary");

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/tiff"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed. Use JPEG, PNG, WEBP, AVIF, or TIFF.`));
    }
  },
});

function sanitize(str) {
  return str.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#x27;" }[c]));
}

router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) filter.title = { $regex: req.query.search, $options: "i" };
    const [photos, total] = await Promise.all([
      Photo.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Photo.countDocuments(filter),
    ]);
    res.json({ photos, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", auth, upload.array("images", 20), async (req, res) => {
  try {
    const results = [];
    const overrideCategory = req.body.category;

    for (const file of req.files) {
      const resized = await resizeBuffer(file.buffer);

      const cloudResult = await uploadBuffer(resized);

      const title = sanitize(
        file.originalname.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ")
      );
      let category = "Uncategorized";

      if (overrideCategory && overrideCategory !== "Auto") {
        category = overrideCategory;
      } else {
        category = await categorizeImage(resized);
      }

      const photo = await Photo.create({
        title,
        image: cloudResult.secure_url,
        public_id: cloudResult.public_id,
        category,
      });
      results.push(photo);
    }

    res.status(201).json(results);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch("/:id", auth, async (req, res) => {
  try {
    const { title, category } = req.body;
    const update = {};
    if (title !== undefined) update.title = sanitize(title);
    if (category !== undefined) update.category = category;
    const photo = await Photo.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!photo) return res.status(404).json({ error: "Photo not found" });
    res.json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ error: "Photo not found" });

    if (photo.public_id) {
      destroyImage(photo.public_id).catch((err) => console.error("Cloudinary delete failed:", err.message));
    } else {
      const filePath = path.join(__dirname, "..", "uploads", photo.image);
      fs.unlink(filePath, (err) => {
        if (err && err.code !== "ENOENT") console.error("Failed to delete file:", filePath, err.message);
      });
    }

    await Photo.findByIdAndDelete(req.params.id);
    res.json({ message: "Photo deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/bulk/category", auth, async (req, res) => {
  try {
    const { ids, category } = req.body;
    if (!Array.isArray(ids) || !category) {
      return res.status(400).json({ error: "ids array and category required" });
    }
    await Photo.updateMany({ _id: { $in: ids } }, { category });
    res.json({ message: `${ids.length} photos updated` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/bulk/delete", auth, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: "ids array required" });
    }
    const photos = await Photo.find({ _id: { $in: ids } });
    for (const photo of photos) {
      if (photo.public_id) {
        destroyImage(photo.public_id).catch((err) => console.error("Cloudinary delete failed:", err.message));
      } else {
        const filePath = path.join(__dirname, "..", "uploads", photo.image);
        fs.unlink(filePath, (err) => {
          if (err && err.code !== "ENOENT") console.error("Failed to delete file:", filePath, err.message);
        });
      }
    }
    await Photo.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${photos.length} photos deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
