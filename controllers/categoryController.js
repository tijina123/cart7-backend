const mongoose = require("mongoose");
// const { Category } = require("../models/productModel");
const { Category } = require("../models/categoryModel");

// ✅ Get All Categories
const getAllCategories = async (res) => {
  try {
    const categories = await Category.find();
    if (!categories) {
      return res.status(400).json({
        success: false,
        message: "No categories found. Please add categories first.",
      });
    }
    return categories;
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the categories.",
      error: error.message,
    });
  }
};

// ✅ Get All Categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    // Validation: Check if categories exist
    if (!categories) {
      return res.status(400).json({
        success: false,
        message: "No categories found. Please add categories first.",
      });
    }

    res.status(200).json({
      success: true,
      message: "categories retrieved successfully.",
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the categories.",
      error: error.message,
    });
  }
};

// ✅ Get Single Category
const getSingleCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if ID is provided
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required.",
      });
    }
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "category not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "category retrieved successfully.",
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the category.",
      error: error.message,
    });
  }
};

// ✅ Add New Category
const addCategory = async (req, res) => {
  try {
    const { name, description, parentCategory, offer_price, isActive } =
      req.body;
    if (parentCategory)
      if (!name) {
        // Check if required fields are present
        return res.status(400).json({ message: "Category name is required." });
      }

    // Validate data types
    if (typeof name !== "string") {
      return res
        .status(400)
        .json({ message: "Invalid type: name must be a string." });
    }

    if (description !== undefined && typeof description !== "string") {
      return res
        .status(400)
        .json({ message: "Invalid type: description must be a string." });
    }

    if (offer_price !== undefined && typeof offer_price !== "number") {
      return res
        .status(400)
        .json({ message: "Invalid type: offer_price must be a number." });
    }

    if (parentCategory) {
      if (!mongoose.Types.ObjectId.isValid(parentCategory))
        res
          .status(400)
          .json({
            message: "Invalid type: parentCategory must be a valid ObjectId.",
          });
    }

    if (isActive !== undefined && typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ message: "Invalid type: isActive must be a boolean." });
    }

    // Check if category name already exists
    const existingCategory = await Category.findOne({ name });

    if (existingCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Category already exists." });
    }

    const category = await Category.create({
      name,
      description,
      parentCategory: parentCategory || null,
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "category creation failed. Please try again.",
      });
    }

    const categories = await Category.find();

    // Validation: Check if categories exist
    if (!categories) {
      return res.status(400).json({
        success: false,
        message: "No categories found. Please add categories first.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Category added successfully!",
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the category.",
      error: error.message,
    });
  }
};
// ✅ Update Category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required.",
      });
    }

    const { name, description, parentCategory, offer_price, isActive } =
      req.body;

    // Check if required fields are present
    if (!name) {
      return res.status(400).json({ message: "Category name is required." });
    }

    // Validate data types
    if (typeof name !== "string") {
      return res
        .status(400)
        .json({ message: "Invalid type: name must be a string." });
    }

    if (description !== undefined && typeof description !== "string") {
      return res
        .status(400)
        .json({ message: "Invalid type: description must be a string." });
    }

    if (offer_price !== undefined && typeof offer_price !== "number") {
      return res
        .status(400)
        .json({ message: "Invalid type: offer_price must be a number." });
    }

    if (parentCategory) {
      if (!mongoose.Types.ObjectId.isValid(parentCategory))
        res
          .status(400)
          .json({
            message: "Invalid type: parentCategory must be a valid ObjectId.",
          });
    }

    if (isActive !== undefined && typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ message: "Invalid type: isActive must be a boolean." });
    }

    const category = await Category.findById(id);

    if (!category)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });

    category.name = name || category.name;
    category.description = description || category.description;
    category.parentCategory = parentCategory || category.parentCategory;
    category.isActive = isActive !== undefined ? isActive : category.isActive;

    const updatedCategory = await category.save();

    if (!updatedCategory) {
      return res.status(400).json({
        success: false,
        message: "Category update failed. Please try again.",
      });
    }

    const categories = await Category.find();

    // Validation: Check if categories exist
    if (!categories) {
      return res.status(400).json({
        success: false,
        message: "No categories found. Please add categories first.",
      });
    }

    res.json({
      success: true,
      message: "Category updated successfully!",
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the category.",
      error: error.message,
    });
  }
};

// ✅ Delete Category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required.",
      });
    }

    const category = await Category.findById(id);

    if (!category)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });

    const deletedCategory = await category.deleteOne();

    if (!deletedCategory) {
      return res.status(400).json({
        success: false,
        message: "Failed to delete the product. Please try again.",
      });
    }
    res
      .status(200)
      .json({ success: true, message: "Category deleted successfully!" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the category.",
      error: error.message,
    });
  }
};

const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate categoryId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID.",
      });
    }

    // Find the category and toggle isActive
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    category.isActive = !category.isActive; // Toggle isActive
    await category.save(); // Save the updated category

    const categories = await getAllCategories(res);
    if (!Array.isArray(categories)) return;

    res.status(200).json({
      success: true,
      message: `Category ${
        category.isActive ? "unblocked" : "blocked"
      } successfully.`,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the category status.",
      error: error.message,
    });
  }
};

module.exports = {
  getCategories,
  getSingleCategory,
  addCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
};
