const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const Photo = require("../models/Photo");
const auth = require("../middleware/auth");
const { categorizeImage } = require("../services/ai");
const { resizeBuffer } = require("../services/resize");
const { store, destroy } = require("../services/storage");

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/tiff"];

const uploadLimiter = require("express-rate-limit")({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: "Too many upload requests. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
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
    if (req.query.category && typeof req.query.category === "string") {
      filter.category = req.query.category;
    }
    if (req.query.search && typeof req.query.search === "string") {
      const escaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 100);
      filter.title = { $regex: escaped, $options: "i" };
    }
    const [photos, total] = await Promise.all([
      Photo.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Photo.countDocuments(filter),
    ]);
    res.json({ photos, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("GET /api/photos error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", auth, uploadLimiter, upload.array("images", 20), async (req, res) => {
  const uploaded = [];
  try {
    const results = [];
    const overrideCategory = req.body.category;

    for (const file of req.files) {
      const resized = await resizeBuffer(file.buffer);

      const ext = file.originalname.split(".").pop() || "jpg";
      const result = await store(resized, ext);
      if (result.public_id) uploaded.push(result.public_id);

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
        image: result.secure_url,
        public_id: result.public_id,
        category,
      });
      results.push(photo);
    }

    res.status(201).json(results);
  } catch (err) {
    for (const pid of uploaded) {
      destroy({ public_id: pid }).catch((e) => console.error("Cleanup failed for", pid, e.message));
    }
    console.error("POST /api/photos error:", err); res.status(400).json({ error: "Upload failed" });
  }
});

router.patch("/:id", auth, async (req, res) => {
  try {
    const { title, category } = req.body;
    const update = {};
    if (title !== undefined) update.title = sanitize(title);
    if (category !== undefined) update.category = sanitize(category);
    const photo = await Photo.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!photo) return res.status(404).json({ error: "Photo not found" });
    res.json(photo);
  } catch (err) {
    console.error(err); res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ error: "Photo not found" });

    if (photo.public_id) {
      destroy(photo);
    }

    await Photo.findByIdAndDelete(req.params.id);
    res.json({ message: "Photo deleted" });
  } catch (err) {
    console.error(err); res.status(500).json({ error: "Internal server error" });
  }
});

function validateObjectIds(ids) {
  return Array.isArray(ids) && ids.length > 0 && ids.length <= 100 && ids.every((id) => mongoose.Types.ObjectId.isValid(id));
}

router.patch("/bulk/category", auth, async (req, res) => {
  try {
    const { ids, category } = req.body;
    if (!validateObjectIds(ids) || !category) {
      return res.status(400).json({ error: "Valid ids array (1-100) and category required" });
    }
    await Photo.updateMany({ _id: { $in: ids } }, { category });
    res.json({ message: `${ids.length} photos updated` });
  } catch (err) {
    console.error(err); res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/bulk/delete", auth, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!validateObjectIds(ids)) {
      return res.status(400).json({ error: "Valid ids array (1-100) required" });
    }
    const photos = await Photo.find({ _id: { $in: ids } });
    const results = await Promise.allSettled(photos.map((photo) => {
      try { destroy(photo); } catch {}
    }));
    for (const r of results) {
      if (r.status === "rejected") console.error("Bulk delete cleanup error:", r.reason);
    }
    await Photo.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${photos.length} photos deleted` });
  } catch (err) {
    console.error(err); res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
