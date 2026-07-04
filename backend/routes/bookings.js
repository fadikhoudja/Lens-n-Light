const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const Booking = require("../models/Booking");
const auth = require("../middleware/auth");
const { notifyNewBooking } = require("../services/email");

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many booking requests. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/", auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.status && typeof req.query.status === "string") {
      filter.status = req.query.status;
    }
    const [bookings, total] = await Promise.all([
      Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Booking.countDocuments(filter),
    ]);
    res.json({ bookings, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err); res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(booking);
  } catch (err) {
    console.error(err); res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", bookingLimiter, async (req, res) => {
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
    if (message && message.length > 1000) {
      return res.status(400).json({ error: "Message must be under 1000 characters" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(date);
    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({ error: "Invalid date" });
    }
    if (bookingDate < today) {
      return res.status(400).json({ error: "Date must be today or in the future" });
    }

    const sanitizedName = name.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#x27;" }[c]));
    const sanitized = message ? message.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#x27;" }[c])) : "";

    const booking = await Booking.create({ name: sanitizedName, phone, date, message: sanitized });

    notifyNewBooking(booking).catch((err) => console.error("notifyNewBooking error:", err));

    res.status(201).json(booking);
  } catch (err) {
    console.error("POST /api/bookings error:", err); res.status(400).json({ error: "Booking failed" });
  }
});

const VALID_STATUSES = ["pending", "confirmed", "completed", "cancelled"];

router.patch("/:id", auth, async (req, res) => {
  try {
    const { status, name, phone, date, message } = req.body;
    const update = {};
    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
      }
      update.status = status;
    }
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ error: "Name cannot be empty" });
      }
      update.name = name.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#x27;" }[c]));
    }
    if (phone !== undefined) {
      if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({ error: "Phone must be exactly 10 digits" });
      }
      update.phone = phone;
    }
    if (date !== undefined) {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        return res.status(400).json({ error: "Invalid date" });
      }
      update.date = date;
    }
    if (message !== undefined) update.message = message.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#x27;" }[c]));
    const booking = await Booking.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(booking);
  } catch (err) {
    console.error(err); res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json({ message: "Booking deleted" });
  } catch (err) {
    console.error(err); res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
