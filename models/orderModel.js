const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        orderItems: 
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
                quantity: { type: Number, required: true },
            },
        
        // agent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        shippingAddress: {
            street: String,
            city: String,
            state: String,
            zip: String,
            country: String,
        },
        paymentMethod: { type: String, required: true },
        paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
        totalPrice: { type: Number, required: true },
        // Delivery Statuses
        deliveryStatus: {
            type: String,
            enum: [
                "Pending", "Processing", "Shipped", "Out for Delivery",
                "Delivered", "Cancelled", "Returned", "Failed Delivery",
            ],
            default: "Pending",
        },
        deliveredAt: { type: Date },

        // Razorpay & Shiprocket Fields
        razorpay_order_id: { type: String },
        shipment_id: { type: String }, // Shiprocket Shipment ID
        awb_code: { type: String }, // Tracking Number
        courier_name: { type: String }, // Courier Partner
        courier_status: { type: String }, // Status from Shiprocket

        // Return Section
        isReturned: { type: Boolean, default: false },
        returnReason: {
            type: String,
            enum: [
                "Damaged Product",
                "Wrong Item Received",
                "Defective Product",
                "Item Not as Described",
                "Size/Color Mismatch",
                "Other"
            ],
        },
        returnStatus: {
            type: String,
            enum: ["Requested", "Approved", "Rejected", "Completed"],
            default: "Requested",
        },
        returnedAt: { type: Date },
    },
    { timestamps: true }
);

module.exports = {
    Order: mongoose.model("Order", orderSchema),
};
