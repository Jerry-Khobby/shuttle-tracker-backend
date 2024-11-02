const User = require("../models/OrdinaryUser");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwtGenerate = require("../middlewares/jwt-generate").generateToken;
const dotenv = require("dotenv").config();

// Google Strategy setup
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.WEB_CLIENT_ID,
      clientSecret: process.env.WEB_CLIENT_SECRET,
      callbackURL: process.env.WEB_CLIENT_CALLBACK,
    },
    async (accessToken, refreshToken, profile, cb) => {
      console.log("Received profile from Google:", profile);
      try {
        // Check if user already exists
        let user = await User.findOne({
          accountId: profile.id,
          provider: "google",
        });

        if (!user) {
          // Add new Google user if not found
          console.log("Adding new Google user to DB...");
          user = new User({
            accountId: profile.id,
            name: profile.username || profile.displayName,
            provider: profile.provider,
          });
          await user.save();
          console.log("New user saved:", user);
        } else {
          console.log("User already exists:", user);
        }

        return cb(null, user);
      } catch (error) {
        console.error("Error during Google authentication:", error);
        return cb(error, null);
      }
    }
  )
);

// Controller for Google callback (login)
exports.googleCallback = (req, res, next) => {
  passport.authenticate(
    "google",
    { failureRedirect: "/auth/google/error" },
    (err, user) => {
      if (err) {
        console.error("Authentication error:", err);
        return res.status(401).json({
          status: "fail",
          message: "Google authentication failed",
          error: err.message || "Unknown error",
        });
      }

      if (!user) {
        console.error("User not found after authentication");
        return res.status(401).json({
          status: "fail",
          message: "Google authentication failed",
        });
      }

      // Generate JWT for the authenticated user
      const token = jwtGenerate(user);
      console.log("Successful login. Generated token:", token);

      return res.status(200).json({
        status: "success",
        message: "Google authentication successful",
        token: token,
        user: {
          id: user._id,
          name: user.name,
          provider: user.provider,
        },
      });
    }
  )(req, res, next);
};

// Controller for success response (returns user info)
exports.googleSuccess = (req, res) => {
  if (!req.session.passport || !req.session.passport.user) {
    console.warn("User not logged in or session is invalid.");
    return res.status(401).json({
      status: "fail",
      message: "User not logged in",
    });
  }

  const userInfo = {
    id: req.session.passport.user.id,
    displayName: req.session.passport.user.displayName,
    provider: req.session.passport.user.provider,
  };

  console.log("User info retrieved for success page:", userInfo);
  return res.status(200).json({
    status: "success",
    message: "Google login success",
    user: userInfo,
  });
};

// Controller for error handling during authentication
exports.googleError = (req, res) => {
  console.error("Error logging in via Google.");
  return res.status(400).json({
    status: "fail",
    message: "Error logging in via Google",
  });
};

// Controller for signing out
exports.googleSignOut = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("Failed to destroy session:", err);
        return res.status(500).json({
          status: "fail",
          message: "Failed to destroy session",
        });
      }

      console.log("User signed out successfully.");
      return res.status(200).json({
        status: "success",
        message: "Signed out successfully",
      });
    });
  } catch (err) {
    console.error("Failed to sign out Google user:", err);
    return res.status(400).json({
      status: "fail",
      message: "Failed to sign out Google user",
    });
  }
};
