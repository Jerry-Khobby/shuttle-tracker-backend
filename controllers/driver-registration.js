const Drivers = require("../models/DriverDb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

exports.driverLogin = async (req,res) => {
  const {email,password}= req.body;
  if(!password || !email){
    return res.status(400).json({error:"All fields are required"});
  }
  const emailRegrex =/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
};

exports.driverSignout = async () => {};
