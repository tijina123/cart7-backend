const express = require("express")
const router = express.Router()

// Payment Integration
router.post("/razorpay", deleteCategory); //→  Create Razorpay order
router.post("/webhook", deleteCategory); //→  Handle Razorpay webhook
router.post("/status/:id", deleteCategory); //→  Get payment status


module.exports = router; 