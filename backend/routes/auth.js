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

  if (!username || !password || typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const hash = await getHashedPassword();
  const userMatches = username.trim() === process.env.ADMIN_USERNAME;
  const valid = userMatches ? await bcrypt.compare(password, hash) : await bcrypt.compare(password, await bcrypt.hash("dummy", 12));

  if (!valid || !userMatches) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ admin: username }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  res.json({ token });
});

router.post("/logout", (req, res) => {
  res.json({ message: "Logged out" });
});

module.exports = router;
