import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  discountType: {
    type: String,
    enum: ["percentage", "fixed"], // Percentage or Fixed Discount
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  },
  minPurchase: {
    type: Number,
    default: 0 // Minimum order amount required to apply the coupon
  },
  maxDiscount: {
    type: Number,
    default: 0 // Maximum discount limit (for percentage-based coupons)
  },
  expiryDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = {
    Coupon: mongoose.model("Coupon", couponSchema),
};

// const Coupon = mongoose.model("Coupon", couponSchema);
// export default Coupon;
