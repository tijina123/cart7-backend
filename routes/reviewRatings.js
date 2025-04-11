const express = require("express")
const router = express.Router()

// Review & Ratings
router.post("/:productId",registerAndLogin.login);//→ Add review (user)
router.get("/:productId",registerAndLogin.login);//→ Get product reviews
router.delete("/:productId/:reviewId",registerAndLogin.login);//→ Delete review (admin)



module.exports = router; 