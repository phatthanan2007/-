const test = require("node:test");
const assert = require("node:assert/strict");
const { uploadProductImage } = require("../src/controllers/upload.controller");

const response = () => ({ statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });

test("uploadProductImage returns a browser-safe URL for an uploaded image", () => {
  const res = response();
  uploadProductImage({ file: { filename: "plush.png" } }, res);
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.url, "/uploads/products/plush.png");
});

test("uploadProductImage rejects a missing file", () => {
  const res = response();
  uploadProductImage({}, res);
  assert.equal(res.statusCode, 400);
});
