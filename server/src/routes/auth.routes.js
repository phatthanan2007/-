const express = require("express");
const { register, login, me, adminOnly } = require("../controllers/auth.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.get("/admin", protect, authorize("admin"), adminOnly);
module.exports = router;
