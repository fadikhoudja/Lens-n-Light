const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Photo = require("../models/Photo");
const auth = require("../middleware/auth");
const { categorizeImage } = require("../services/ai");
const { resizeImage } = require("../services/resize");

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/tiff"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")),
});

const upload = multer({
  storage,
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
    const [photos, total] = await Promise.all([
      Photo.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Photo.countDocuments(),
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
      const filePath = path.join(__dirname, "..", "uploads", file.filename);
      await resizeImage(filePath);

      const title = sanitize(
        file.originalname.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ")
      );
      let category = "Uncategorized";

      if (overrideCategory && overrideCategory !== "Auto") {
        category = overrideCategory;
      } else {
        category = await categorizeImage(filePath);
      }

      const photo = await Photo.create({ title, image: file.filename, category });
      results.push(photo);
    }

    res.status(201).json(results);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ error: "Photo not found" });

    const filePath = path.join(__dirname, "..", "uploads", photo.image);
    fs.unlink(filePath, (err) => {
      if (err) console.error("Failed to delete file:", filePath, err.message);
    });

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
      const filePath = path.join(__dirname, "..", "uploads", photo.image);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete file:", filePath, err.message);
      });
    }
    await Photo.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${photos.length} photos deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
