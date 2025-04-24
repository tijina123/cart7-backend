const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    phone: {
      type: String,
      // required: [true, "Phone number is required"],
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
    },
    image: { type: String },
    plan: {
      type: String,
      enum: ["premium", "standard", "basic"],
      default: "basic",
    },
    planValidUntil: {
      type: Date,
    }, 
    status: {
      type: Boolean,
      required: [true, "Status is required"],
      default: true,
    },
    isDelers: {
      type: Boolean,
      required: [true, "Status is required"],
      default: false,
    },
    deler_name: {
      type: String
    },
    delers_priority: {
      type: Boolean
    },
    isActive: { type: Boolean, default: true },
    role: {
      type: String,
      enum: ["Super Admin", "admin", "Manager", "user"],
      default: "user",
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
    },
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    cart_total: {
      type: Number,
      default: 0
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);


module.exports = {
  User: mongoose.model("User", userSchema),
};

