const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      discountType: {
        type: String,
        enum: ["percentage", "fixed", "bogo"], // "bogo" = Buy One Get One
        // required: true,
      },
      discountValue: {
        type: Number,
        required: true,
        // required: function () {
        //   return this.discountType !== "bogo"; // Not required for BOGO
        // },
      },
      minPurchase: {
        type: Number,
        default: 0,
      },
      // image: {
      //   type: String, // URL of offer banner/image
      //   required: true,
      // },
      expiryDate: {
        type: Date,
        required: true,
      },
      isActive: {
        type: Boolean,
        default: true,
      },

  },
  { timestamps: true }
);

module.exports = {
    Offer: mongoose.model("Offer", offerSchema),
};
