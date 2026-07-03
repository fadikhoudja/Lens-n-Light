const nodemailer = require("nodemailer");

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
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
        <p><strong>Name:</strong> ${booking.name}</p>
        <p><strong>Phone:</strong> ${booking.phone}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Message:</strong> ${booking.message || "—"}</p>
      `,
    });
    console.log("Email sent successfully:", info.messageId);
  } catch (err) {
    console.error("Email send failed:", err.message);
  }
}

module.exports = { notifyNewBooking };
