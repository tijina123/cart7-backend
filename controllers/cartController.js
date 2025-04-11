const { User } = require("../models/userModel.js");
const { Product } = require("../models/productModel.js");
const { Address } = require("../models/addressModel.js");

// ✅
// Helper function to calculate the total price of the cart and update it in the database
const calculateCartTotal = async (userId) => {
  // Find the user and populate the cart with product details
  const user = await User.findById(userId).populate("cart.product");
  if (!user) return null;

  // Calculate the total price of all items in the cart
  const total = user.cart.reduce((sum, item) => {
    return sum + item.product.sale_price * item.quantity;
  }, 0);

  // Update the user's cart total and save it
  user.cart_total = total;
  await user.save();

  return user;
};

// ✅ Get Cart Items
const getCart = async (req, res) => {
  try {
    const userId = req.userId;

    // Check if userId is provided
    if (!userId)
      return res.status(400).json({ message: "User ID is required" });

    // Fetch the user with updated cart total
    const user = await calculateCartTotal(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Respond with cart details
    res.status(200).json({
      success: true,
      cart: user.cart,
      cartTotal: user.cart_total,
      // address,
      message: "Cart retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Add to Cart
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

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Cart Quantity
const updateCartQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;
    const userId = req.userId;

    // Validate productId
    if (!productId)
      return res.status(400).json({ message: "Product ID is required" });

    // Ensure the quantity is valid (at least 1)
    if (!quantity || quantity < 1)
      return res.status(400).json({ message: "Quantity must be at least 1" });

    // Find the user in the database
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find the cart item by product ID
    const cartItem = user.cart.find(
      (item) => item.product.toString() === productId
    );
    if (!cartItem)
      return res.status(404).json({ message: "Item not found in cart" });

    // Update the quantity of the item
    cartItem.quantity = quantity;
    await user.save();

    // Fetch the updated user with recalculated cart total
    const updatedUser = await calculateCartTotal(userId);
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    // Respond with updated cart details
    res.status(200).json({
      success: true,
      message: "Product quantity updated successfully",
      cart: updatedUser.cart,
      cartTotal: updatedUser.cart_total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Remove from Cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.userId;

    // Validate inputs
    if (!userId || !productId) {
      return res
        .status(400)
        .json({ message: "User ID and Product ID are required" });
    }

    // Remove the item from the user's cart using $pull
    const result = await User.findOneAndUpdate(
      { _id: userId, "cart.product": productId },
      { $pull: { cart: { product: productId } } },
      { new: true }
    );

    // If the user or product is not found in the cart, return an error
    if (!result)
      return res
        .status(404)
        .json({ message: "User not found or product not in cart" });

    // Fetch the updated user with recalculated cart total
    const updatedUser = await calculateCartTotal(userId);
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    // Respond with updated cart details
    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart: updatedUser.cart,
      cartTotal: updatedUser.cart_total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addToCart, removeFromCart, updateCartQuantity, getCart };
