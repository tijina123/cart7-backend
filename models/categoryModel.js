const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  offer_price: { type: Number},
  isVariant:{ type: Boolean, default: false },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null }, // For subcategories
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = {
    Category: mongoose.model("Category", categorySchema),
};

