const multer = require("multer");

const uploadProductImage = multer({
  storage: multer.memoryStorage(),
  // Vercel Functions accept request bodies below 4.5 MB.
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (req, file, done) => done(null, file.mimetype.startsWith("image/"))
}).single("image");

module.exports = { uploadProductImage };
