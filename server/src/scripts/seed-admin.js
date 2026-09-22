require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User.model");

const seedAdmin = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env first");
  }
  if (ADMIN_PASSWORD.length < 8) throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  await connectDB();
  const password = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await User.findOneAndUpdate(
    { email: ADMIN_EMAIL.toLowerCase().trim() },
    { name: ADMIN_NAME, email: ADMIN_EMAIL.toLowerCase().trim(), password, role: "admin" },
    { upsert: true, new: true, runValidators: true }
  );
  console.log("Admin account is ready");
  process.exit(0);
};

seedAdmin().catch((error) => { console.error(error.message); process.exit(1); });
