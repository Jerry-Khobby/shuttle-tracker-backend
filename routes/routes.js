const express = require("express");
const router = express.Router();
const googleAuthControllers = require("../controllers/google-auth");
const passport = require("passport");
// Route to initiate GitHub login
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Route for GitHub callback
router.get("/auth/google/callback", googleAuthControllers.googleCallback);

// Route for success page
router.get("/auth/google/success", googleAuthControllers.googleSuccess);

// Route for error page
router.get("/auth/google/error", googleAuthControllers.googleError);

// Route for signout
router.get("/auth/google/signout", googleAuthControllers.googleSignOut);

module.exports = router;
