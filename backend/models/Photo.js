const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  title: { type: String, default: "Untitled" },
  image: { type: String, required: true },
  public_id: { type: String },
  category: { type: String, default: "Uncategorized", index: true },
}, { timestamps: true });

photoSchema.index({ createdAt: -1 });
photoSchema.index({ title: "text" });

module.exports = mongoose.model("Photo", photoSchema);
