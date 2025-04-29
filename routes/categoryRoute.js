const express = require("express")
const router = express.Router()
const categoryController = require("../controllers/categoryController")


// Category Management
router.get("/",categoryController.getCategories);//→ Get all category
router.get("/all",categoryController.allCategories);//→ Get all category
router.get("/:id",categoryController.getSingleCategory);//→ Get a single category by ID
router.post("/admin", categoryController.addCategory); //→ Create a new category (admin)
router.put("/admin/:id", categoryController.updateCategory ); //→ Update a category (admin)
router.delete("/admin/:id", categoryController.deleteCategory); //→ Delete a category (admin)
router.put("/admin/toggle-status/:id", categoryController.toggleCategoryStatus ); //→ Update a category (admin)


module.exports = router; 

// import { User } from "../models/userModel.js"; 
// import { validateRequest } from "../middlewares/validateRequest.js";

// app.post("/users", validateRequest(User.schema.obj), (req, res) => {
//     // Create user logic here
// });

// All required fields must be provided