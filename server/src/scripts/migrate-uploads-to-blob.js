require("dotenv").config();

const fs = require("fs/promises");
const path = require("path");
const { put } = require("@vercel/blob");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/Product.model");

const uploadsRoot = path.resolve(__dirname, "../../public/uploads");
const apply = process.argv.includes("--apply");

const contentTypes = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif"
};

const migrateImage = async (url) => {
  if (!url.startsWith("/uploads/")) return url;

  const relativePath = url.slice("/uploads/".length).replaceAll("\\", "/");
  const localPath = path.resolve(uploadsRoot, relativePath);
  if (!localPath.startsWith(`${uploadsRoot}${path.sep}`)) {
    throw new Error(`Unsafe upload path: ${url}`);
  }

  if (!apply) {
    console.log(`[dry run] ${url} -> Blob: ${relativePath}`);
    return url;
  }

  const body = await fs.readFile(localPath);
  const result = await put(relativePath, body, {
    access: "public",
    contentType: contentTypes[path.extname(localPath).toLowerCase()] || "application/octet-stream",
    addRandomSuffix: true
  });
  console.log(`${url} -> ${result.url}`);
  return result.url;
};

const main = async () => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  await connectDB();

  const products = await Product.find({ images: { $regex: "^/uploads/" } });
  console.log(`${apply ? "Migrating" : "Found"} ${products.length} product(s) with local upload URLs.`);

  for (const product of products) {
    const images = [];
    for (const url of product.images) images.push(await migrateImage(url));

    if (apply) {
      product.images = images;
      await product.save();
    }
  }
};

main()
  .catch((error) => {
    console.error("Upload migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
