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
}, { timestamps: true });

bookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Booking", bookingSchema);
