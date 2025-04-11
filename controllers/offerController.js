const { Offer } = require("../models/offerModel");
const mongoose = require("mongoose");

// ✅ get all offers
const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find(); // Fetch all offers

    if (!offers) {
      return res
        .status(404)
        .json({ success: false, message: "Offer not found" });
    }

    res.status(200).json({
      success: true,
      message: "Offers fetched successfully",
      offers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// ✅ Create a New Offer
const createOffer = async (req, res) => {
  try {
    const { title, description, discountType, discountValue, expiryDate } =
      req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !discountType ||
      !discountValue ||
      !expiryDate
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    // Create a new Offer
    const newOffer = await Offer.create({
      title: title.toUpperCase(),
      description,
      discountType,
      discountValue,
      // image,
      expiryDate,
    });

    res
      .status(201)
      .json({
        success: true,
        message: "Offer created successfully",
        offer: newOffer,
      });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// ✅ Get All Active Offers
const getOffers = async (req, res) => {
  try {
    const activeOffers = await Offer.find({
      isActive: true,
      expiryDate: { $gte: new Date() },
    }).sort({ expiryDate: 1 });

    res.status(200).json({ success: true, activeOffers });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// ✅ Get Single Offer by ID
const getOfferById = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findById(id);

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res.status(200).json({ success: true, offer });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// ✅ Update an Offer
const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedOffer = await Offer.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedOffer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Offer updated successfully",
        offer: updatedOffer,
      });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// ✅ Delete an Offer
const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOffer = await Offer.findByIdAndDelete(id);

    if (!deletedOffer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Offer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

const toggleOfferStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate categoryId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid offer ID.",
      });
    }

    // Find the category and toggle isActive
    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    offer.isActive = !offer.isActive; // Toggle isActive
    await offer.save(); // Save the updated category

    res.status(200).json({
      success: true,
      message: "Status changed successfully",
      // offers,
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
  getAllOffers,
  createOffer,
  getOffers,
  getOfferById,
  updateOffer,
  deleteOffer,
  toggleOfferStatus,
};
