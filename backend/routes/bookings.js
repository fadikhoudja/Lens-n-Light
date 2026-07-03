const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const auth = require("../middleware/auth");
const { notifyNewBooking } = require("../services/email");

router.get("/", auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      Booking.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Booking.countDocuments(),
    ]);
    res.json({ bookings, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, phone, date, message } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: "Phone must be exactly 10 digits" });
    }
    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(date);
    if (bookingDate < today) {
      return res.status(400).json({ error: "Date must be today or in the future" });
    }

    const sanitizedName = name.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#x27;" }[c]));
    const sanitized = message ? message.replace(/<[^>]*>/g, "") : "";

    const booking = await Booking.create({ name: sanitizedName, phone, date, message: sanitized });

    notifyNewBooking(booking).catch((err) => console.error("notifyNewBooking error:", err));

    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json({ message: "Booking deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
