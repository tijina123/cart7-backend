const express = require("express")
const router = express.Router()
const couponController = require("../controllers/couponController")


// Offer Management
router.get("/",couponController.getAllCoupons);//→ Get all category
router.get("/:id",couponController.getCouponById);//→ Get a single category by ID
router.post("/add", couponController.addCoupon); //→ Create a new category (admin)
router.put("/:id", couponController.updateCoupon ); //→ Update a category (admin)
router.put("/update/:id", couponController.toggleCategoryStatus ); //→ Update a category (admin)
router.delete("/:id", couponController.deleteCategory); //→ Delete a category (admin)

// Coupon Management

module.exports = router; 