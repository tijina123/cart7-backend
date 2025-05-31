const express = require("express")
const { checkAuth } = require("../middlewares/checkAuth");
const router = express.Router()
const orderControllers = require("../controllers/orderControllers")


// Order Management
router.get("/",checkAuth, orderControllers.getAllOrder); //→ Get user's orders
router.get("/details",checkAuth, orderControllers.getAllOrdersByUser); //→ Get order details by user
router.get("/check-cart", checkAuth, orderControllers.isproductAvailabe); //→ check is product available
router.get("/weekly-orders",checkAuth, orderControllers.orderForGraph); //→ Get weekly orders 
router.get("/sales-by-category",checkAuth, orderControllers.salesByCategory); //→ Get sales by category
router.post("/", checkAuth, orderControllers.createOrder); //→ Create a new order (user)
router.post("/payment/verify-payment", orderControllers.verifyPayment); //→ verify payment
router.put("/delivery-status/:orderId", orderControllers.orderStatusUpdate); //→ delivery status




module.exports = router;