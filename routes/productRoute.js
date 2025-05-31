const express = require("express")
const router = express.Router()
const { checkAuth } = require("../middlewares/checkAuth");

const { upload } = require("../uploads/multer"); // Import your multer config
const productController = require("../controllers/productController")


// Product Management
router.get("/",productController.getProducts);//→ Get all products
router.get("/by-agent", checkAuth, productController.getProductsByAgent);//→ Get all products by agent
router.get("/filter/:categoryId",productController.getFilterProducts);//→ Filter products
router.get("/by-category",productController.getProductsByCategory);// GET all products grouped by category
router.get("/search",productController.getProductsBySearch);// GET all products grouped by search
router.get("/:id",productController.getSingleProduct);//→ Get a single product by ID
router.post("/admin",checkAuth, upload.array("images", 5), productController.addProduct); //→ Create a new product (admin)
router.put("/admin/:id", productController.updateProduct ); //→ Update a product (admin)
router.put("/admin/toggle-status/:id", productController.toggleProductStatus ); //→ Update product's status (admin)
router.put("/update-product-offer/:productId", productController.updateProductOffer); //→ Update product's offer (admin)
router.delete("/admin/:id", productController.deleteProduct); //→ Delete a product (admin)


module.exports = router; 