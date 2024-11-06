const Drivers = require("../models/DriverDb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const nodemailer = require("nodemailer");
const BlackList = require("../models/BlackList");

const generateToken = (payload) => {
  const secretKey = process.env.JWT_SECRET;
  const options = {
    expiresIn: "1h",
  };
  return jwt.sign(payload, secretKey, options);
};

exports.createDriver = async (req, res) => {
  const {
    firstName,
    surname,
    email,
    password,
    licenseNumber,
    yearsOfExperience,
    licenseImage,
  } = req.body;

  // Email regex
  const emailRegrex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegrex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // Password validation
  const passwordRegrex =
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegrex.test(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters long and contain at least one letter, one digit, and one special character",
    });
  }

  try {
    const existingUser = await Drivers.findOne({ email });
    if (existingUser) {
      // Provide a generic error message to avoid user enumeration
      return res
        .status(400)
        .json({ error: "User with this email already exists " });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDriver = new Drivers({
      firstName,
      surname,
      email,
      password: hashedPassword,
      licenseImage,
      licenseNumber,
      yearsOfExperience,
    });
    await newDriver.save();

    const token = generateToken({ _id: newDriver._id, email: newDriver.email });
    res.status(200).json({ message: "Signup successful", token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.driverLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!password || !email) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const emailRegrex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegrex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const passwordRegrex =
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegrex.test(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters long and contain at least one letter, one digit, and one special character",
    });
  }

  try {
    const user = await Drivers.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const otp = speakeasy.totp({
      secret: process.env.OTP_SECRET,
      encoding: "base32",
    });

    // Store OTP and user ID in session
    req.session.otp = otp;
    req.session.userId = user._id;

    /*   console.log(req.session.otp); */

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: user.email,
      subject: "Your One-Time Login Code for Shuttle Tracker",
      text: `
    Hello ${user.firstName},
    
    Welcome back to Shuttle Tracker!
    
    To complete your login, please enter the following one-time code within the app:
    
    🛂 Your Login Code: ${otp}
    
    This code is valid for 5 minutes. If you didn’t request this code, please ignore this email or reach out to us for help.
    
    Thank you for choosing Shuttle Tracker, where we make your commute easier, safer, and on time.
    
    Happy Travels!  
    The Shuttle Tracker Team
    
    *This is an automated email. Please do not reply.*
    `,
    };

    /*  console.log(otp); */

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: "OTP sent to your email. Please verify it.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.verifyOTP = async (req, res) => {
  const { otp } = req.body;

  // Retrieve OTP and user ID from session
  const sessionOtp = req.session.otp;
  const userId = req.session.userId;

  if (!sessionOtp || !userId) {
    return res
      .status(400)
      .json({ error: "OTP session expired. Please login again." });
  }

  try {
    // Verify OTP
    const isVerified = speakeasy.totp.verify({
      secret: process.env.OTP_SECRET,
      encoding: "base32",
      token: otp,
      window: 2,
    });

    if (!isVerified || otp !== sessionOtp) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Find the user based on the stored userId
    const user = await Drivers.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // OTP is valid, generate JWT
    const token = generateToken({
      _id: user._id,
      email: user.email,
    });

    req.session.cookie.maxAge = 5 * 60 * 1000; // 5 minutes
    // Clear OTP and userId from session after successful login
    req.session.otp = null;
    req.session.userId = null;

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: "OTP verification failed" });
  }
};

exports.driverSignout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split("")[1];
    if (token) {
      await TokenBlacklist.create({
        token,
        expiresAt: new Date(Date.now() + 3600 * 1000),
      });
    }

    req.session.destroy((err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Failed to sign out. Please try again later " });
      }
      res.clearCookie("connect.sid");

      res.status(200).json({ message: "Signout successful" });
    });
  } catch (error) {
    console.error("Signout error", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
