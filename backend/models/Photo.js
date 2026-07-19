const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  title: { type: String, default: "Untitled" },
  image: { type: String, required: true },
  public_id: { type: String },
  category: { type: String, default: "Uncategorized", index: true },
}, { timestamps: true });

photoSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

photoSchema.index({ createdAt: -1 });
photoSchema.index({ title: "text" });

module.exports = mongoose.model("Photo", photoSchema);
