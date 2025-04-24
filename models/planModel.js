const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String},
    percentage: { type: Number, required: true },
    number_of_days: { type: Number, required: true },
    // offer: { type: mongoose.Schema.Types.ObjectId, ref: "Offer" },
    // category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = {
  Plan: mongoose.model("Plan", planSchema),
};
