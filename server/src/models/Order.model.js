const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        image: { type: String, default: "" }
      }
    ],
    shippingAddress: {
      name: String,
      phone: String,
      address: String,
      subdistrict: String,
      district: String,
      province: String,
      postalCode: String
    },
    totalPrice: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ["cod", "bank_transfer", "promptpay"],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "packing",
        "shipping",
        "delivered",
        "cancelled"
      ],
      default: "pending"
    },
    trackingNumber: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
