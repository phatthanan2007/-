const test = require("node:test");
const assert = require("node:assert/strict");
const blob = require("@vercel/blob");
const { uploadProductImage } = require("../src/controllers/upload.controller");

const response = () => ({ statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });

test("uploadProductImage returns the public Vercel Blob URL", async () => {
  const originalPut = blob.put;
  blob.put = async () => ({ url: "https://store.public.blob.vercel-storage.com/products/plush.png" });
  const res = response();
  await uploadProductImage({ file: { originalname: "plush.png", mimetype: "image/png", buffer: Buffer.from("image") } }, res, assert.fail);
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.url, "https://store.public.blob.vercel-storage.com/products/plush.png");
  blob.put = originalPut;
});

test("uploadProductImage rejects a missing file", async () => {
  const res = response();
  await uploadProductImage({}, res, assert.fail);
  assert.equal(res.statusCode, 400);
});
