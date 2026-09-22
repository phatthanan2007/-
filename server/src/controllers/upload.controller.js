const uploadProductImage = (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Please select an image file" });
  res.status(201).json({ url: `/uploads/products/${req.file.filename}` });
};

module.exports = { uploadProductImage };
