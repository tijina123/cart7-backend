const { User } = require("../models/userModel.js");

// ✅ Get Wishlist Items - Fetches the user's wishlist products
const getWishlist = async (req, res) => {
  try {
    // Extract user ID from request (assumed to be set via authentication middleware)
    const userId = req.userId;

    // Validate if user ID exists
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Find the user and populate the wishlist with product details
    const user = await User.findById(userId).populate("wishlist");

    // If user is not found, return an error response
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Respond with the user's wishlist
    res.status(200).json({
      success: true,
      wishlist: user.wishlist,
    });
  } catch (error) {
    // Handle any server errors
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Add to Wishlist - Adds a product to the user's wishlist
const addToWishlist = async (req, res) => {
  try {
    // Extract product ID from request body
    const { productId } = req.body;

    // Extract user ID from request (assumed to be set via authentication middleware)
    const userId = req.userId;

    // Validate required fields
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Find the user by ID
    const user = await User.findById(userId);

    // If user is not found, return an error response
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if the product is already in the wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: "Item already in wishlist",
      });
    }

    // Add product to the user's wishlist
    user.wishlist.push(productId);
    await user.save(); // Save changes to the database

    // Send success response
    res.status(200).json({
      success: true,
      message: "Item added to wishlist",
    });
  } catch (error) {
    // Handle any server errors
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Remove from Wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.userId;

    const { productId } = req.params;
    // Handle missing productId in params
    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "product ID is required" });
    }

    // Check if both userId and productId are provided
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required",
      });
    }
    // Use $pull to remove the product directly from the wishlist array
    const result = await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { wishlist: productId } }, // Removes the product from the wishlist array
      { new: true } // Returns the updated document
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User not found or product not in wishlist",
      });
    }

    const updatedUser = await User.findById(userId).populate("wishlist");
    if (!updatedUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.status(200).json({
      success: true,
      message: "Item removed from wishlist",
      wishlist: updatedUser.wishlist,
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
};
