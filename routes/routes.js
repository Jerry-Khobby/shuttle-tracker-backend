const express = require("express");
const router = express.Router();
const googleAuthControllers = require("../controllers/google-auth");
const passport = require("passport");
// Route to initiate GitHub login
router.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

// Route for GitHub callback
router.get("/auth/github/callback", googleAuthControllers.googleCallback);

// Route for success page
router.get("/auth/github/success", googleAuthControllers.googleSuccess);

// Route for error page
router.get("/auth/github/error", googleAuthControllers.googleError);

// Route for signout
router.get("/auth/github/signout", googleAuthControllers.googleSignOut);

module.exports = router;
