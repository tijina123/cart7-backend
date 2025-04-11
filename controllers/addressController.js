const mongoose = require("mongoose");
const { Address } = require("../models/addressModel");
const { User } = require("../models/userModel.js");

// ✅ Get All Addresses
const getAddresses = async (req, res) => {
  try {
    const address = await Address.find();

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "No addresses found. Please add an address first.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Addresses retrieved successfully.",
      address,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the addresses.",
      error: error.message,
    });
  }
};

// ✅ Get Single Address
const getSingleAddress = async (req, res) => {
  try {
    const userId = req.userId;

    const address = await Address.findById(userId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Address retrieved successfully.",
      address,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the address.",
      error: error.message,
    });
  }
};

// ✅
const getAddressByUser = async (req, res) => {
  try {
    const userId = req.userId; // Extract userId from request

    console.log(userId, "getAddressByUser");

    const address = await Address.find({ user: userId });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Address retrieved successfully.",
      address,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the address.",
      error: error.message,
    });
  }
};

// ✅ Add a New Address
const addAddress = async (req, res) => {
  try {
    const userId = req.userId;

    const { fullName, phone, street, city, state, zip, country, isDefault } =
      req.body;

    // 1. Check if required fields are present
    if (
      !userId ||
      !fullName ||
      !phone ||
      !street ||
      !city ||
      !state ||
      !zip ||
      !country
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    // 2. Validate user ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    // 3. Validate string fields
    const stringFields = { fullName, phone, street, city, state, zip, country };
    for (const [key, value] of Object.entries(stringFields)) {
      if (typeof value !== "string" || !value.trim()) {
        return res
          .status(400)
          .json({
            message: `Invalid type: ${key} must be a non-empty string.`,
          });
      }
    }

    // 4. Validate isDefault (optional)
    if (isDefault !== undefined && typeof isDefault !== "boolean") {
      return res
        .status(400)
        .json({ message: "Invalid type: isDefault must be a boolean." });
    }

    // ✅ 5. If isDefault is true, unset isDefault from other addresses
    if (isDefault === true) {
      await Address.updateMany(
        { user: userId },
        { $set: { isDefault: false } }
      );
    }

    // 6. Create the new address
    const address = await Address.create({
      user: userId,
      fullName,
      phone,
      street,
      city,
      state,
      zip,
      country,
      isDefault: true,
    });

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Address creation failed. Please try again.",
      });
    }

    // 7. Respond with success
    res.status(201).json({
      success: true,
      message: "Address added successfully!",
      address,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the address.",
      error: error.message,
    });
  }
};

const setDefaultAddress = async (req, res) => {
  const userId = req.userId;

  const { addressId } = req.params;

  try {
    // Unset isDefault for all other addresses
    await Address.updateMany(
      { user: userId, _id: { $ne: addressId } },
      { $set: { isDefault: false } }
    );

    // Set the selected address to default
    await Address.findByIdAndUpdate(addressId, { isDefault: true });

    res.status(200).json({ message: "Default address updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update default address" });
  }
};

// ✅ Update Address
const updateAddress = async (req, res) => {
  try {
    const userId = req.userId;

    const { fullName, phone, street, city, state, zip, country, isDefault } =
      req.body;

    const address = await Address.findById(userId);
    if (!address) return res.status(404).json({ message: "Address not found" });

    // Update fields if provided
    address.fullName = fullName || address.fullName;
    address.phone = phone || address.phone;
    address.street = street || address.street;
    address.city = city || address.city;
    address.state = state || address.state;
    address.zip = zip || address.zip;
    address.country = country || address.country;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    const updatedAddress = await address.save();

    if (!updatedAddress) {
      return res.status(400).json({
        success: false,
        message: "Address update failed. Please try again.",
      });
    }

    res.json({
      success: true,
      message: "Address updated successfully!",
      updatedAddress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the address.",
      error: error.message,
    });
  }
};

// ✅ Delete Address
const deleteAddress = async (req, res) => {
  try {
    const userId = req.userId;

    const address = await Address.findById(userId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    const deletedAddress = await address.deleteOne();

    if (!deletedAddress) {
      return res.status(400).json({
        success: false,
        message: "Failed to delete the address. Please try again.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the address.",
      error: error.message,
    });
  }
};

module.exports = {
  getAddresses,
  getSingleAddress,
  addAddress,
  updateAddress,
  deleteAddress,
  getAddressByUser,
  setDefaultAddress,
};
