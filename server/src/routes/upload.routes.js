const express = require("express");
const { protect, authorize } = require("../middlewares/auth.middleware");
const { uploadProductImage } = require("../middlewares/upload.middleware");
const { uploadProductImage: respondWithUpload } = require("../controllers/upload.controller");

const router = express.Router();
router.post("/products", protect, authorize("admin"), uploadProductImage, respondWithUpload);
module.exports = router;
