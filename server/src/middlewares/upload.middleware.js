const multer = require("multer");

const uploadProductImage = multer({
  storage: multer.memoryStorage(),
  // Keep the multipart request under Vercel Functions' 4.5 MB body limit.
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (req, file, done) => done(null, file.mimetype.startsWith("image/"))
}).single("image");

module.exports = { uploadProductImage };
