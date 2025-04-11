const mongoose = require("mongoose");

const { Product } = require("../models/productModel");
const { Category } = require("../models/categoryModel");
const { User } = require("../models/userModel");
const { Offer } = require("../models/offerModel");

// ✅ Get All Products (It is util function)
const getAllProducts = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      return { success: false, message: "Unauthorized access" };
    }

    let products = null;

    if (user.role === "Super Admin") {
      // Fetch all products
      products = await Product.find().populate("agent", "name email");
    } else if (user.role === "admin") {
      // Fetch only the products added by the admin (agent)
      products = await Product.find({ agent: user._id }).populate(
        "agent",
        "name email"
      );
    }

    if (!products) {
      return res.status(400).json({
        success: false,
        message: "No products found. Please add products first.",
      });
    }
    return products;
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the products.",
      error: error.message,
    });
  }
};

// ✅ Get All Products
const getProducts = async (req, res) => {
  try {
    // Fetch all products
    const products = await Product.find().populate("category");

    // Validation: Check if products exist
    if (!products) {
      return res.status(400).json({
        success: false,
        message: "No products found. Please add products first.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully.",
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the products.",
      error: error.message,
    });
  }
};

// ✅ Get products by  users
const getProductsByAgent = async (req, res) => {
  try {
    const userId = req.userId;

    const products = await Product.find({ agent: userId });

    if (!products) {
      return res
        .status(404)
        .json({ message: "No products found for this user" });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
};

// ✅ Get filter products
const getFilterProducts = async (req, res) => {
  try {
    console.log("====getFilterProducts");
    
    const { categoryId } = req.params; // Extract category ID from query params

    if (!categoryId) {
      return res.status(400).json({ message: "Category ID is required" });
    }

    const products = await Product.find({ category: categoryId }).populate(
      "category"
    ); // Fetch products with category details

    console.log("Filtered Products:", products); // Log the filtered products
    // Validation: Check if products exist
    if (!products) {
      return res.status(400).json({
        success: false,
        message: "No products found. Please add products first.",
      });
    }
    res.status(200).json({
      success: true,
      message: "Products retrieved successfully.",
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//✅ GET all products grouped by category
const getProductsByCategory = async (req, res) => {
  try {
    const productsByCategory = await Category.aggregate([
      {
        $lookup: {
          from: "products", // Collection name should match in MongoDB
          localField: "_id",
          foreignField: "category",
          as: "products",
        },
      },
      {
        $project: {
          name: 1, // Category name
          description: 1,
          offer_price: 1,
          isActive: 1,
          products: 1, // Include all products in that category
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully.",
      productsByCategory,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Single product
const getSingleProduct = async (req, res) => {
  try {
    const userId = req.userId;

    const { id } = req.params;
    // Handle missing id in params
    if (!id) {
      return res.status(400).json({ message: "id is required" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully.",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the product.",
      error: error.message,
    });
  }
};

// ✅
const addProduct = async (req, res) => {
  try {
    let {
      name,
      description,
      product_price,
      sale_price,
      offer, // Offer ID
      category,
      stock,
      varient, // Array of variants (if any)
    } = req.body;

    const userId = req.userId;

    // Convert numeric fields from string to number
    product_price = Number(product_price);
    sale_price = sale_price ? Number(sale_price) : 0;
    stock = Number(stock);

    // Validate required fields
    if (
      !name ||
      !description ||
      !product_price ||
      !category ||
      stock === undefined
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: "Invalid category ID." });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    // Handle image uploads
    const imageUrls = req.files ? req.files.map((file) => file.path) : [];

    // Check if Product name already exists
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res
        .status(400)
        .json({ success: false, message: "Product already exists." });
    }

    let finalSalePrice = product_price;

    // Handle offer price calculations
    if (offer && mongoose.Types.ObjectId.isValid(offer)) {
      const offerData = await Offer.findById(offer);
      if (offerData) {
        if (offerData.discountType === "percentage") {
          finalSalePrice =
            product_price - (product_price * offerData.discountValue) / 100;
        } else if (offerData.discountType === "fixed") {
          finalSalePrice = Math.max(0, product_price - offerData.discountValue);
        }
      }
    }

    // If product has variants, validate them
    let productVariants = [];
    if (Array.isArray(varient) && varient.length > 0) {
      productVariants = varient.map((v) => ({
        colour_varient: v.colour_varient,
        size_varient: v.size_varient.map((s) => ({
          size: s.size,
          qty: s.qty,
        })),
      }));
    }

    // Create a new product
    const product = await Product.create({
      name,
      agent: userId,
      description,
      product_price,
      sale_price: finalSalePrice,
      offer: offer || null,
      category,
      stock,
      images: imageUrls,
      varient: productVariants, // Only add variants if provided
    });

    res.status(201).json({
      success: true,
      message: "Product added successfully!",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the product.",
      error: error.message,
    });
  }
};

// ✅ Add product old
const addProductOld = async (req, res) => {
  try {
    let {
      // Use let instead of const
      name,
      description,
      product_price,
      sale_price,
      offer,
      category,
      stock,
    } = req.body;

    const userId = req.userId;

    // Convert numeric fields from string to number
    product_price = Number(product_price);
    sale_price = sale_price ? Number(sale_price) : 0;
    offer = offer ? Number(offer) : 0;
    stock = Number(stock);

    // Check if required fields are present
    if (
      !name ||
      !description ||
      !product_price ||
      !category ||
      stock === undefined
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    // Validate data types
    if (typeof name !== "string") {
      return res
        .status(400)
        .json({ message: "Invalid type: name must be a string." });
    }

    if (typeof description !== "string") {
      return res
        .status(400)
        .json({ message: "Invalid type: description must be a string." });
    }

    if (isNaN(product_price)) {
      return res
        .status(400)
        .json({ message: "Invalid type: product_price must be a number." });
    }

    if (sale_price !== undefined && isNaN(sale_price)) {
      return res
        .status(400)
        .json({ message: "Invalid type: sale_price must be a number." });
    }

    if (offer !== undefined && isNaN(offer)) {
      return res
        .status(400)
        .json({ message: "Invalid type: offer must be a number." });
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: "Invalid category ID." });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    if (isNaN(stock)) {
      return res
        .status(400)
        .json({ message: "Invalid type: stock must be a number." });
    }

    // Get Image URLs from Cloudinary
    const imageUrls = req.files.map((file) => file.path);

    // Check if Product name already exists
    const existingProduct = await Product.findOne({ name });

    if (existingProduct) {
      return res
        .status(400)
        .json({ success: false, message: "Product already exists." });
    }

    // Handle image uploads
    const images = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

    // Create a new product
    const product = await Product.create({
      name,
      agent: userId,
      description,
      product_price,
      sale_price,
      offer,
      category,
      stock: stock || 0,
      images: imageUrls, // Store Cloudinary URLs
    });

    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Product creation failed. Please try again.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Product added successfully!",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the product.",
      error: error.message,
    });
  }
};

// ✅ Update Product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      sale_price,
      product_price,
      category,
      stock,
      images,
    } = req.body;

    console.log("Update Product Body:", req.body);
    console.log("Update Product Params:", req.params);

    // Handle missing id in params
    if (!id) {
      return res.status(400).json({ message: "id is required" });
    }

    const product = await Product.findById(id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    // Update fields if provided
    product.name = name || product.name;
    product.description = description || product.description;
    product.product_price = product_price || product.product_price;
    product.sale_price = sale_price || product.sale_price;
    product.category = category || product.category;
    product.stock = stock !== undefined ? stock : product.stock;
    product.images = images || product.images;

    const updatedProduct = await product.save();

    if (!updatedProduct) {
      return res.status(400).json({
        success: false,
        message: "Product update failed. Please try again.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully!",
      // products,
    });
  } catch (error) {
    console.log("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the product.",
      error: error.message,
    });
  }
};

// ✅ Delete Product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.userId;

    // Handle missing id in params
    if (!id) {
      return res.status(400).json({ message: "id is required" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const deletedProduct = await product.deleteOne();

    if (!deletedProduct) {
      return res.status(400).json({
        success: false,
        message: "Failed to delete the product. Please try again.",
      });
    }

    const products = await getAllProducts(req, res);
    if (!Array.isArray(products)) return; // Prevent further execution if an error response is already sent

    res.status(200).json({
      success: true,
      message: "Product deleted successfully!",
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the product.",
      error: error.message,
    });
  }
};

// ✅
const toggleProductStatus = async (req, res) => {
  try {
    const { id: productId } = req.params;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    // Find the product and toggle isActive
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    product.isActive = !product.isActive; // Toggle isActive
    await product.save(); // Save the updated product

    res.status(200).json({
      success: true,
      message: `Product ${
        product.isActive ? "unblocked" : "blocked"
      } successfully.`,
      // product: products,
    });
  } catch (error) {
    console.error("Error toggling product status:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the product status.",
      error: error.message,
    });
  }
};

// ✅ ➤
const updateProductOffer = async (req, res) => {
  try {
    const { productId } = req.params;
    const { offerId } = req.body; // The offer being added/changed/removed
    zz;
    if (!productId) {
      return res.status(400).json({ message: "Product id is required" });
    }

    if (!offerId) {
      return res.status(400).json({ message: "Offer id is required" });
    }

    // Fetch the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if offer is provided
    if (offerId) {
      const offer = await Offer.findById(offerId);
      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }

      // Calculate sale price based on discount type
      let salePrice = product.product_price;
      if (offer.discountType === "percentage") {
        salePrice = salePrice - (salePrice * offer.discountValue) / 100;
      } else if (offer.discountType === "fixed") {
        salePrice = Math.max(0, salePrice - offer.discountValue);
      } else if (offer.discountType === "bogo") {
        salePrice = product.product_price; // No price change, just an offer
      }

      // Update product with new sale price and offer
      product.sale_price = salePrice;
      product.offer = offerId;
    } else {
      // If offer is removed, reset sale_price to product_price
      product.sale_price = product.product_price;
      product.offer = null;
    }

    await product.save();
    return res
      .status(200)
      .json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getProducts,
  getSingleProduct,
  addProduct,
  addProductOld,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getFilterProducts,
  toggleProductStatus,
  getProductsByAgent,
  updateProductOffer,
};
