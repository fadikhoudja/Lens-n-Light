const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  title: { type: String, default: "Untitled" },
  image: { type: String, required: true },
  category: { type: String, default: "Uncategorized", index: true },
}, { timestamps: true });

photoSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Photo", photoSchema);
