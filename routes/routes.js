const express = require("express");
const router = express.Router();
const googleAuthControllers = require("../controllers/google-auth");
const passport = require("passport");

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Google OAuth authentication for Shuttle Tracker
 */

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google login
 *     tags: [Authentication]
 *     description: Redirects the user to Google for authentication.
 *     responses:
 *       302:
 *         description: Redirect to Google for authentication.
 */
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Handle Google OAuth callback
 *     tags: [Authentication]
 *     description: Handles the callback from Google after authentication.
 *     responses:
 *       200:
 *         description: Authentication successful, returns JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Google authentication successful
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "64b1234567890abcde123456"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     provider:
 *                       type: string
 *                       example: google
 *       401:
 *         description: Authentication failed.
 */
router.get("/auth/google/callback", googleAuthControllers.googleCallback);

/**
 * @swagger
 * /auth/google/success:
 *   get:
 *     summary: Retrieve success page after login
 *     tags: [Authentication]
 *     description: Retrieves user information after successful login.
 *     responses:
 *       200:
 *         description: Successfully retrieved user information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Google login success
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "64b1234567890abcde123456"
 *                     displayName:
 *                       type: string
 *                       example: "John Doe"
 *                     provider:
 *                       type: string
 *                       example: google
 *       401:
 *         description: User not logged in.
 */
router.get("/auth/google/success", googleAuthControllers.googleSuccess);

/**
 * @swagger
 * /auth/google/error:
 *   get:
 *     summary: Retrieve error page after failed login
 *     tags: [Authentication]
 *     description: Displays an error message when login fails.
 *     responses:
 *       400:
 *         description: Error logging in via Google.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Error logging in via Google
 */
router.get("/auth/google/error", googleAuthControllers.googleError);

/**
 * @swagger
 * /auth/google/signout:
 *   get:
 *     summary: Sign out the user
 *     tags: [Authentication]
 *     description: Destroys the session and logs out the user.
 *     responses:
 *       200:
 *         description: Signed out successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Signed out successfully
 *       500:
 *         description: Failed to destroy session.
 */
router.get("/auth/google/signout", googleAuthControllers.googleSignOut);

module.exports = router;
