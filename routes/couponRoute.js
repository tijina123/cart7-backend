const express = require("express")
const router = express.Router()
const couponController = require("../controllers/couponController")


// Coupon Management
router.get("/",couponController.getAllCoupons);//→ Get all Coupon
router.get("/:id",couponController.getCouponById);//→ Get a single Coupon by ID
router.post("/add", couponController.addCoupon); //→ Create a new Coupon (admin)
router.put("/:id", couponController.updateCoupon ); //→ Update a Coupon (admin)
router.put("/update/:id", couponController.toggleCategoryStatus ); //→ Update a toggle status (admin)
router.delete("/:id", couponController.deleteCategory); //→ Delete a Coupon (admin)



module.exports = router; 