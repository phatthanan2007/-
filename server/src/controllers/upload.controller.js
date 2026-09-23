const crypto = require("crypto");
const path = require("path");
const blob = require("@vercel/blob");

const uploadProductImage = async (req, res, next) => {
  if (!req.file) return res.status(400).json({ message: "Please select an image file" });
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ message: "File uploads are not configured" });
  }
  try {
    const extension = path.extname(req.file.originalname).toLowerCase();
    const result = await blob.put(`products/${crypto.randomUUID()}${extension}`, req.file.buffer, {
      access: "public",
      contentType: req.file.mimetype,
      addRandomSuffix: false
    });
    res.status(201).json({ url: result.url });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadProductImage };
