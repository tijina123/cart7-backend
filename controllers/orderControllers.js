const mongoose = require("mongoose");

const { User } = require("../models/userModel.js");
const { Order } = require("../models/orderModel.js");
const { Product } = require("../models/productModel.js");
const { Address } = require("../models/addressModel");
const crypto = require("crypto");


const razorpay = require("../utils/razorpay.js"); // Import Razorpay instance

const getLast7Days = () => {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split("T")[0]); // YYYY-MM-DD format
  }
  return dates;
};

const salesByCategory = async (req, res) => {
  try {
    const salesByCategory = await Order.aggregate([
      { $unwind: "$orderItems" }, // Flatten order items
      {
        $lookup: {
          from: "products", // Match with Product collection
          localField: "orderItems.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $lookup: {
          from: "categories", // Match with Category collection
          localField: "productDetails.category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      {
        $group: {
          _id: "$categoryDetails.name", // Group by category name
          totalSales: { $sum: "$orderItems.quantity" }, // Sum quantity sold
        },
      },
      { $sort: { totalSales: -1 } }, // Sort by highest sales
    ]);

    // Format response
    const labels = salesByCategory.map((item) => item._id);
    const data = salesByCategory.map((item) => item.totalSales);
    console.log(labels, "===labels");
    console.log(data, "==data");

    res.json({ labels, data });
  } catch (error) {
    console.error("Error fetching sales by category:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const orderForGraph = async (req, res) => {
  try {
    const last7Days = getLast7Days();
    const orders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(last7Days[0] + "T00:00:00.000Z") },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert MongoDB response into an object { "2025-03-21": 5, ... }
    const orderMap = {};
    orders.forEach((order) => {
      orderMap[order._id] = order.count;
    });

    // Map to last 7 days format
    const data = last7Days.map((date) => orderMap[date] || 0);

    res.json({ labels: last7Days, data });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Check cart availability using aggregation
const isproductAvailabe = async (req, res) => {
  try {
    const userId = req.userId;

    // Handle missing userId in params
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    // 🔹 Aggregation pipeline
    const userCart = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$cart" }, // Unwind cart array
      {
        $lookup: {
          from: "products", // Match with Product collection
          localField: "cart.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" }, // Unwind product details
      {
        $project: {
          _id: 0,
          productId: "$productDetails._id",
          name: "$productDetails.name",
          availableStock: "$productDetails.stock",
          requestedQuantity: "$cart.quantity",
        },
      },
      {
        $match: {
          $expr: { $lt: ["$availableStock", "$requestedQuantity"] }, // Filter out-of-stock items
        },
      },
    ]);

    if (userCart.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some products are out of stock",
        unavailableProducts: userCart,
      });
    }

    res
      .status(200)
      .json({ success: true, message: "All products are available" });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Server error", error });
  }
};

// ✅
const getAllOrder = async (req, res) => {
  try {
    //  const agentId = req.params.agentId || req.userId; // use req.userId if agent is authenticated user

    const userId = req.userId;

    const user = await User.findById(userId);

    let orders = null

    if (user.role === "Super Admin") {
      
      orders = await Order.find()
        .populate("user", "name phone") // Populate user fields (adjust as needed)
        .populate("orderItems.product", "name sale_price images"); // Populate product fields

    } else if (user.role === "admin") {

      orders = await Order.find({ agent: userId })
        .populate("user", "name phone") // Populate user info
        .populate("orderItems.product", "name sale_price images"); // Populate product info

    }


    // Validation: Check if orders exist
    if (!orders || orders.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No orders found. Please place an order first.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully.",
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the orders.",
      error: error.message,
    });
  }
};


// ✅
const getAllOrdersByUser = async (req, res) => {
  try {

    const userId = req.userId; // Assuming userId is extracted from auth middleware


    // Handle missing orderId in params
    if (!userId) {
      return res.status(400).json({ message: "User id is required" });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const orders = await Order.find({ user: userId })
      .populate("user", "name phone") // Populate user fields (adjust as needed)
      .populate("orderItems.product", "name sale_price images"); // Populate product fields

    // Validation: Check if the user has any orders
    if (!orders) {
      return res.status(404).json({
        success: false,
        message: "No orders found for this user.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully.",
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the orders.",
      error: error.message,
    });
  }
};



// ✅
const orderStatusUpdate = async (req, res) => {
  try {
    console.log("orderStatusUpdate");
    console.log(req.params, req.body);

    const { orderId } = req.params;
    const { newStatus: deliveryStatus } = req.body;

    console.log(orderId, deliveryStatus);

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }
    if (!deliveryStatus) {
      return res.status(400).json({ message: "Delivery status is required" });
    }

    const validStatuses = [
      "Pending", "Processing", "Shipped", "Out for Delivery",
      "Delivered", "Cancelled", "Returned", "Failed Delivery"
    ];


    // Validate orderId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    // Validate delivery status
    if (!validStatuses.includes(deliveryStatus)) {
      return res.status(400).json({ message: "Invalid delivery status" });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the status is being updated to "Returned"
    if (deliveryStatus === "Returned") {
      if (!order.deliveredAt) {
        return res.status(400).json({ message: "Order has not been delivered yet" });
      }

      // Calculate the difference between today and deliveredAt
      const deliveredDate = new Date(order.deliveredAt);
      const currentDate = new Date();
      const diffInDays = Math.floor((currentDate - deliveredDate) / (1000 * 60 * 60 * 24));

      if (diffInDays > 7) {
        return res.status(400).json({ message: "Return period has expired (7 days limit)" });
      }
    }

    // Update delivery status
    order.deliveryStatus = deliveryStatus;

    // If status is "Delivered", set deliveredAt timestamp
    if (deliveryStatus === "Delivered") {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.json({ success: true, message: "Delivery status updated successfully", order });
  } catch (error) {
    console.error("Error updating delivery status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//✅ Create Order and Push to Shiprocket
const createOrder = async (req, res) => {

  try {
    const userId = req.userId;
console.log("createOrder");

    const { paymentMethod, currency = "INR" } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const shippingAddress = await Address.find({
      user: userId,
      isDefault: true,
    });

    // if (!address) {
    if (!shippingAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    const user = await User.findById(userId).populate("cart.product");
    if (!user || !user.cart || user.cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalAmount = 0;
    const createdOrders = [];

    for (let cartItem of user.cart) {
      const product = cartItem.product;
      const quantity = cartItem.quantity;

      if (!product) continue;

      if (product.stock < quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${product.name}` });
      }

      const orderPrice = (product.sale_price || product.product_price) * quantity;
      totalAmount += orderPrice;

      let balanceTotal = null

      const productAgent = await Product.findById(product?._id)
        .populate({
          path: "agent",
          select: "plan planValidUntil", // Only get necessary fields
        });

      console.log(productAgent.agent?.plan, "====productAgent.agent?.plan");


      if (productAgent.agent?.plan === "plan 7") {

        balanceTotal = (orderPrice * 10 / 100).toFixed(2)

      } else if (productAgent.agent?.plan === "plan 6") {

        balanceTotal = (orderPrice * 12 / 100).toFixed(2)

      }
      else if (productAgent.agent?.plan === "plan 5") {

        balanceTotal = (orderPrice * 14 / 100).toFixed(2)

      }
      else if (productAgent.agent?.plan === "plan 4") {

        balanceTotal = (orderPrice * 16 / 100).toFixed(2)

      } else if (productAgent.agent?.plan === "plan 3") {

        balanceTotal = (orderPrice * 18 / 100).toFixed(2)

      } else if (productAgent.agent?.plan === "plan 2") {

        balanceTotal = (orderPrice * 20 / 100).toFixed(2)

      } else if (productAgent.agent?.plan === "plan 1") {

        balanceTotal = (orderPrice * 22 / 100).toFixed(2)

      } else {

        balanceTotal = (orderPrice * 25 / 100).toFixed(2)
      }
      console.log(balanceTotal, "===balanceTotal");

      const newOrder = await Order.create({
        user: userId,
        agent:productAgent.agent?._id,
        orderItems: {
          product: product._id,
          quantity,
        },
        shippingAddress,
        paymentMethod,
        totalPrice: orderPrice,
        balanceTotal: orderPrice - balanceTotal
      });

      // Reduce stock
      product.stock -= quantity;
      await product.save();

      createdOrders.push(newOrder);
    }

    let razorpayOrder = null;

    // Create one Razorpay order if payment is not COD
    if (paymentMethod !== "COD") {
      const options = {
        amount: totalAmount * 100, // in paise
        currency,
        receipt: `receipt_${createdOrders[0]._id}`,
      };


      razorpayOrder = await razorpay.orders.create(options);


      if (!razorpayOrder) {
        return res
          .status(500)
          .json({ message: "Razorpay order creation failed" });
      }

      // Save razorpay ID to all orders
      await Promise.all(
        createdOrders.map(async (order) => {
          order.razorpay_order_id = razorpayOrder.id;
          await order.save();
        })
      );
    }

    // Clear the cart
    user.cart = [];
    user.cart_total = 0;
    await user.save();

    return res.status(201).json({
      success: true,
      paymentMethod,
      message: "Orders created successfully from cart",
      orders: createdOrders,
      totalAmount,
      razorpayOrder: razorpayOrder || null,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Create expected signature using your Razorpay secret
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // Compare signatures
    if (expectedSignature === razorpay_signature) {
      // ✅ Update paymentStatus to "Paid"
      await Order.updateMany(
        { razorpay_order_id },
        {
          $set: {
            paymentStatus: "Paid",
            razorpay_payment_id,
          },
        }
      );

      return res.status(200).json({ success: true, message: "Payment verified and order updated." });
    } else {
      return res.status(400).json({ success: false, message: "Invalid signature sent!" });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  createOrder,
  isproductAvailabe,
  getAllOrder,
  orderStatusUpdate,
  getAllOrdersByUser,
  orderForGraph,
  salesByCategory,
  verifyPayment
};
