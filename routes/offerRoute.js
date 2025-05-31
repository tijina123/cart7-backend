const express = require("express")
const router = express.Router()
const offerController = require("../controllers/offerController")


const abc =()=>{
    console.log("abc")
}



// Offer Management
router.get("/",offerController.getAllOffers);//→ Get all offer
router.get("/:id",offerController.getOfferById);//→ Get a single offer by ID
router.post("/add",offerController.createOffer); //→ Create a new offer (admin)
router.put("/:id", offerController.updateOffer ); //→ Update a offer (admin)
// router.put("/update/:id", offerController.toggleCategoryStatus ); //→ Update a offer
router.delete("/:id", offerController.deleteOffer); //→ Delete a offer
router.put("/admin/toggle-status/:id", offerController.toggleOfferStatus ); //→ Update toggle status



module.exports = router; 