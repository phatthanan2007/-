const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const tokenFor = (user) => jwt.sign(
  { id: user._id.toString(), role: user.role },
  process.env.JWT_SECRET || "development-secret",
  { expiresIn: "7d" }
);

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  profileImage: user.profileImage
});

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required" });
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });
    const normalizedEmail = email.toLowerCase().trim();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: "Email already registered" });

    const user = await User.create({ name, email: normalizedEmail, password: await bcrypt.hash(password, 12), phone, role: "user" });
    res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
  } catch (error) { next(error); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Invalid email or password" });
    res.json({ token: tokenFor(user), user: publicUser(user) });
  } catch (error) { next(error); }
};

const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: publicUser(user) });
  } catch (error) { next(error); }
};

const adminOnly = (req, res) => res.json({ message: "Welcome, admin", user: req.user });
module.exports = { register, login, me, adminOnly };
