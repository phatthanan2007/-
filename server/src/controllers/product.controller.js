const Product = require("../models/Product.model");
const Category = require("../models/Category.model");
const mongoose = require("mongoose");

const fields = ["name", "sku", "description", "price", "stock", "images", "category", "brand", "size", "material", "color", "isFeatured", "isActive"];
const productData = async (body) => {
  const data = Object.fromEntries(Object.entries(body).filter(([key]) => fields.includes(key)));
  if (typeof data.category === "string" && !mongoose.isObjectIdOrHexString(data.category)) {
    const name = data.category.trim();
    if (name) {
      const category = await Category.findOneAndUpdate(
        { name },
        { $setOnInsert: { name } },
        { upsert: true, new: true, runValidators: true }
      );
      data.category = category._id;
    }
  }
  return data;
};

const getProducts = async (req, res, next) => {
  try { res.json(await Product.find().populate("category", "name").sort({ createdAt: -1 })); } catch (error) { next(error); }
};
const getStorefrontProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true }).populate("category", "name").sort({ isFeatured: -1, createdAt: -1 });
    res.json(products);
  } catch (error) { next(error); }
};
const getProduct = async (req, res, next) => {
  try { const product = await Product.findById(req.params.id).populate("category", "name"); if (!product) return res.status(404).json({ message: "Product not found" }); res.json(product); } catch (error) { next(error); }
};
const createProduct = async (req, res, next) => {
  try { res.status(201).json(await Product.create(await productData(req.body))); } catch (error) { next(error); }
};
const updateProduct = async (req, res, next) => {
  try { const product = await Product.findByIdAndUpdate(req.params.id, await productData(req.body), { new: true, runValidators: true }); if (!product) return res.status(404).json({ message: "Product not found" }); res.json(product); } catch (error) { next(error); }
};
const deleteProduct = async (req, res, next) => {
  try { const product = await Product.findByIdAndDelete(req.params.id); if (!product) return res.status(404).json({ message: "Product not found" }); res.status(204).send(); } catch (error) { next(error); }
};
module.exports = { getProducts, getStorefrontProducts, getProduct, createProduct, updateProduct, deleteProduct };
