const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, required: true },
    product_price: { type: Number, required: true },
    sale_price: { type: Number, required: true },
    offer: { type: mongoose.Schema.Types.ObjectId, ref: "Offer" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    varient: [
      {
        colour_varient: { 
          type: String, 
          required: function () { return this.varient && this.varient.length > 0; } 
        },
        size_varient: [
          {
            size: { 
              type: Number, 
              required: function () { return this.size_varient && this.size_varient.length > 0; } 
            },
            qty: { 
              type: Number, 
              required: function () { return this.size_varient && this.size_varient.length > 0; } 
            }
          }
        ]
      }
    ],
    isActive: { type: Boolean, default: true },
    stock: { type: Number, required: true, default: 0 },
    images: [{ type: String }], // Array of image URLs
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },

  },
  { timestamps: true }
);

module.exports = {
  Product: mongoose.model("Product", productSchema),
};
