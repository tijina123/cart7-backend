// backend/routes/auth.js
const express = require("express");
const passport = require("passport");
const router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false, // If using JWT instead of sessions
  }),
  (req, res) => {
    // Generate JWT or redirect
    res.redirect(`http://localhost:3000?token=your_generated_token`);
  }
);

module.exports = router;
