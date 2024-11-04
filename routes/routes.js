const express = require("express");
const router = express.Router();
const googleAuthControllers = require("../controllers/google-auth");
const passport = require("passport");
const driversController = require("../controllers/driver-registration");

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

/**
 * @swagger
 * /auth/signup/drivers:
 *   post:
 *     summary: Register a new driver
 *
 *     tags: [Authentication of Drivers]
 *     description: Creates a new driver account and returns a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: The first name of the driver.
 *                 example: "John"
 *               surname:
 *                 type: string
 *                 description: The surname of the driver.
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the driver.
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 description: The password for the driver account (minimum 8 characters, at least one letter, one number, and one special character).
 *                 example: "Password123!"
 *               licenseNumber:
 *                 type: string
 *                 description: The driver's license number.
 *                 example: "D123456789"
 *               yearsOfExperience:
 *                 type: integer
 *                 description: The number of years of driving experience.
 *                 example: 5
 *               licenseImage:
 *                 type: string
 *                 description: A URL or base64-encoded image of the driver's license.
 *                 example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAB..."
 *             required:
 *               - firstName
 *               - surname
 *               - email
 *               - password
 *               - licenseNumber
 *               - yearsOfExperience
 *     responses:
 *       '200':
 *         description: Driver registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Signup successfully"
 *                 token:
 *                   type: string
 *                   description: JWT token for the registered driver.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR..."
 *       '400':
 *         description: Invalid request parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid email format"
 *       '409':
 *         description: Conflict error, user already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User with this email already exists"
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */

router.post("/auth/signup/drivers", driversController.createDriver);

module.exports = router;
