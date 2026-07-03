const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

let hashedPassword = null;

async function getHashedPassword() {
  if (hashedPassword) return hashedPassword;
  const plain = process.env.ADMIN_PASSWORD;
  if (plain.startsWith("$2b$") || plain.startsWith("$2a$")) {
    hashedPassword = plain;
  } else {
    hashedPassword = await bcrypt.hash(plain, 12);
  }
  return hashedPassword;
}

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  if (username !== process.env.ADMIN_USERNAME) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const hash = await getHashedPassword();
  const valid = await bcrypt.compare(password, hash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ admin: username }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ token });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

module.exports = router;
