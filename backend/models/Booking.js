const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: (v) => /^\d{10}$/.test(v),
      message: "Phone must be exactly 10 digits",
    },
  },
  date: { type: String, required: true },
  message: { type: String },
  status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending" },
}, { timestamps: true });

bookingSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
