const { Coupon } = require("../models/Coupon");

// ✅ Add a New Coupon
const addCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      expiryDate,
    } = req.body;

    // Validate required fields
    if (!code || !discountType || !discountValue || !expiryDate) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    // Check if coupon already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    // Create new coupon
    const newCoupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minPurchase: minPurchase || 0,
      maxDiscount: maxDiscount || 0,
      expiryDate,
    });

    res
      .status(201)
      .json({ message: "Coupon created successfully", coupon: newCoupon });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// ✅ Get All Coupons
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ expiryDate: 1 });
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// ✅ Get a Single Coupon by ID
const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.status(200).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// ✅ Update a Coupon
const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedCoupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res
      .status(200)
      .json({ message: "Coupon updated successfully", coupon: updatedCoupon });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// ✅ Delete a Coupon
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCoupon = await Coupon.findByIdAndDelete(id);

    if (!deletedCoupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// ✅ Validate and Apply Coupon (for checkout)
const applyCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code || !cartTotal) {
      return res
        .status(400)
        .json({ message: "Coupon code and cart total are required" });
    }

    // Find coupon
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      expiryDate: { $gte: new Date() },
    });

    if (!coupon) {
      return res.status(400).json({ message: "Invalid or expired coupon" });
    }

    // Check if minimum purchase condition is met
    if (cartTotal < coupon.minPurchase) {
      return res
        .status(400)
        .json({
          message: `Minimum purchase of ₹${coupon.minPurchase} required`,
        });
    }

    // Calculate discount
    let discountAmount =
      coupon.discountType === "percentage"
        ? (cartTotal * coupon.discountValue) / 100
        : coupon.discountValue;

    // Apply max discount limit
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }

    // Calculate final price
    const finalTotal = cartTotal - discountAmount;

    res.status(200).json({
      message: "Coupon applied successfully",
      discount: discountAmount,
      finalTotal,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

module.exports = {
  addCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
};
