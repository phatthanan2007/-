const test = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User.model");
const { register, login } = require("../src/controllers/auth.controller");

const response = () => ({ statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });

test("register creates a normal user and never exposes the password", async () => {
  const oldFind = User.findOne, oldCreate = User.create;
  User.findOne = async () => null;
  User.create = async (data) => ({ ...data, _id: "new-user" });
  const res = response();
  await register({ body: { name: "Mali", email: "MALI@EXAMPLE.COM", password: "password8" } }, res, assert.fail);
  assert.equal(res.statusCode, 201); assert.equal(res.body.user.role, "user"); assert.equal(res.body.user.password, undefined); assert.ok(res.body.token);
  User.findOne = oldFind; User.create = oldCreate;
});

test("login rejects an incorrect password", async () => {
  const oldFind = User.findOne;
  User.findOne = async () => ({ _id: "u1", password: await bcrypt.hash("correct-password", 4), role: "user" });
  const res = response();
  await login({ body: { email: "a@b.com", password: "wrong-password" } }, res, assert.fail);
  assert.equal(res.statusCode, 401);
  User.findOne = oldFind;
});
