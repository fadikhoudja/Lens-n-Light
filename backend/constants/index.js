const REQUIRED_ENV_VARS = [
  "MONGO_URI",
  "ADMIN_USERNAME",
  "ADMIN_PASSWORD",
  "JWT_SECRET",
];

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }
  if (process.env.JWT_SECRET === "super-secret-key-change-in-production-123") {
    console.warn("WARNING: JWT_SECRET is still the default value. Generate a strong random secret for production.");
  }
}

module.exports = { validateEnv, REQUIRED_ENV_VARS };
