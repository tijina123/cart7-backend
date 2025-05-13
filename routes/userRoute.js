const express = require("express")
const registerAndLogin = require("../controllers/registerAndLogin")
const userController = require("../controllers/userController")
const cartController = require("../controllers/cartController")
const wishlistController = require("../controllers/wishlistController")
const { checkAuth } = require("../middlewares/checkAuth");
const router = express.Router()



router.post("/signup", registerAndLogin.signup);
router.post("/login",registerAndLogin.login);

router.post('/google-login', registerAndLogin.googleLoginController); 

// Cart Management
router.get("/cart",checkAuth, cartController.getCart);
router.post("/cart", checkAuth, cartController.addToCart);
router.put("/cart/:productId",  checkAuth,  cartController.updateCartQuantity);
router.delete("/cart/:productId",  checkAuth, cartController.removeFromCart);

// Wishlist Management
router.get("/wishlist", checkAuth, wishlistController.getWishlist);
router.post("/wishlist", checkAuth, wishlistController.addToWishlist);
router.delete("/wishlist/:productId",checkAuth, wishlistController.removeFromWishlist);
router.get("/", userController.getUser);
router.put("/admin/toggle-status/:id", userController.toggleUserStatus ); //→ Update a category (admin)
router.get("/detail",checkAuth, userController.getUserById);
router.put("/detail",checkAuth, userController.getUserById);
// Product Management







module.exports = router;