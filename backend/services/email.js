const nodemailer = require("nodemailer");

function esc(str) {
  return String(str).replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#x27;" }[c]));
}

function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("Email disabled: SMTP_HOST, SMTP_USER, or SMTP_PASS not set");
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function notifyNewBooking(booking) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log("Email skipped: SMTP_HOST not configured");
    return;
  }
  if (!process.env.ADMIN_EMAIL) {
    console.log("Email skipped: ADMIN_EMAIL not configured");
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Lens & Light" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "New Booking Request",
      html: `
        <h2>New Booking Request</h2>
        <p><strong>Name:</strong> ${esc(booking.name)}</p>
        <p><strong>Phone:</strong> ${esc(booking.phone)}</p>
        <p><strong>Date:</strong> ${esc(booking.date)}</p>
        <p><strong>Status:</strong> ${esc(booking.status || "pending")}</p>
        <p><strong>Message:</strong> ${esc(booking.message || "—")}</p>
      `,
    });
    console.log("Email sent successfully:", info.messageId);
  } catch (err) {
    console.error("Email send failed:", err.message);
  }
}

module.exports = { notifyNewBooking };
