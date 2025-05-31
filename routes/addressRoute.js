const express = require("express")
const router = express.Router()

const { checkAuth } = require("../middlewares/checkAuth");
const addressController = require("../controllers/addressController")

// address Management
// router.get("/", addressController.getAddresses); //→ Get address
router.get("/",checkAuth, addressController.getAddressByUser); //→ Get address by user
router.get("/:id", addressController.getSingleAddress); //→ Get single address
router.post("/add",checkAuth, addressController.addAddress); //→ Add address
router.put("/update/:id", addressController.updateAddress); //→ Update address
router.put("/update/default-address/:addressId",checkAuth, addressController.setDefaultAddress); //→ Update address
router.delete("/remove/:id", addressController.deleteAddress); //→ Remove address



module.exports = router;