const express = require("express")
const router = express.Router()

// Authentication & User Management
router.post("/register", registerAndLogin.signup);  //→ Register a new user
router.post("/login",registerAndLogin.login); //→ Authenticate user & get token
router.get("/profile",registerAndLogin.login); //→ Get user profile (protected)
router.put("/profile",registerAndLogin.login); //→ Update user profile (protected)
router.get("/admin/users", deleteCategory); //→ Get all users (admin)
router.delete("/admin/users/:id", deleteCategory); //→ Delete user (admin)


module.exports = router; 