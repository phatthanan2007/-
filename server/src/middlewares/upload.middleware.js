const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const destination = path.join(__dirname, "../../public/uploads/products");
fs.mkdirSync(destination, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, done) => done(null, destination),
  filename: (req, file, done) => done(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`)
});

const uploadProductImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, done) => done(null, file.mimetype.startsWith("image/"))
}).single("image");

module.exports = { uploadProductImage };
