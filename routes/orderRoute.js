const express = require("express")
const { checkAuth } = require("../middlewares/checkAuth");
const router = express.Router()
const orderControllers = require("../controllers/orderControllers")


// Order Management
router.get("/", orderControllers.getAllOrder); //→ Get user's orders
router.get("/details",checkAuth, orderControllers.getAllOrdersByUser); //→ Get single order details by user
router.get("/check-cart", checkAuth, orderControllers.isproductAvailabe); //→ check is product available
router.post("/", checkAuth, orderControllers.createOrder); //→ Create a new order (user)
router.post("/payment/verify-payment", orderControllers.verifyPayment); //→ Create a new order (user)
router.put("/delivery-status/:orderId", orderControllers.orderStatusUpdate); //→ Update order status (admin)
router.get("/weekly-orders",checkAuth, orderControllers.orderForGraph); //→ Get single order details by user
router.get("/sales-by-category",checkAuth, orderControllers.salesByCategory); //→ Get single order details by user



module.exports = router;