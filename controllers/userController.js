const { User } = require("../models/userModel.js");
const { Product } = require("../models/productModel.js");
const mongoose = require("mongoose");

// ✅ Get All Categories
const getAllusers = async (res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } });
    if (!users) {
      return res.status(400).json({
        success: false,
        message: "No users found. Please add users first.",
      });
    }
    return users;
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the users.",
      error: error.message,
    });
  }
};

const getUser = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } }); // Exclude admins

    if (!users) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully.",
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the user.",
      error: error.message,
    });
  }
};
// 📌 Add to Cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const userId = req.userId;

    if (!userId || !productId || !quantity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Check if product is already in cart
    const cartItem = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (cartItem) {
      return res
        .status(400)
        .json({ message: "Product already exists in cart" });
    }

    // Add product if it's not already in cart
    user.cart.push({ product: productId, quantity });
    await user.save();

    res
      .status(200)
      .json({ message: "Item added to cart", cart: user.cart, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Remove from Cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId
    );
    await user.save();

    res
      .status(200)
      .json({ message: "Item removed from cart", cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Update Cart Quantity
const updateCartQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const userId = req.userId;
    const { productId } = req.params;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const cartItem = user.cart.find(
      (item) => item.product.toString() === productId
    );
    if (!cartItem)
      return res.status(404).json({ message: "Item not found in cart" });

    cartItem.quantity = quantity;
    await user.save();

    res.status(200).json({ message: "Cart updated", cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Get Cart Items
const getCart = async (req, res) => {
  try {
    // const { userId } = req.params;
    const userId = req.userId;

    const user = await User.findById(userId).populate("cart.product");
    if (!user) return res.status(404).json({ message: "User not found" });
    console.log(user.cart);

    res.status(200).json({ cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Add to Wishlist
const addToWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: "Item already in wishlist" });
    }

    user.wishlist.push(productId);
    await user.save();

    res
      .status(200)
      .json({ message: "Item added to wishlist", wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Remove from Wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    console.log(userId, "userId");
    const { productId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.wishlist = user.wishlist.filter(
      (item) => item.toString() !== productId
    );
    await user.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Item removed from wishlist",
        wishlist: user.wishlist,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Get Wishlist Items
const getWishlist = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).populate("wishlist");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id, "id");
    // Validate categoryId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID.",
      });
    }

    // Find the category and toggle isActive
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found.",
      });
    }

    user.isActive = !user.isActive; // Toggle isActive
    await user.save(); // Save the updated category

    const users = await getAllusers(res);
    if (!Array.isArray(users)) return;

    res.status(200).json({
      success: true,
      message: `User updated Successfully.`,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the user status.",
      error: error.message,
    });
  }
};
const getUserById = async (req, res) => {
  try {
    const userId = req.userId; // Assuming extracted from auth middleware

    // Validate userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    // Find the user first
    const userData = await User.findById(userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    const user = {
      name: userData?.name,
      email: userData?.email,
      phone: userData?.phone,
      image: userData?.image,
    };
    res.status(200).json({
      success: true,
      message: "User retrieved successfully.",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the user.",
      error: error.message,
    });
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  getCart,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  getUser,
  toggleUserStatus,
  getUserById,
};
