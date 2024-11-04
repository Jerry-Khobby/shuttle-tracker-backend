const mongoose = require("mongoose");

const DriversRegistrationSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    surname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trime: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    licenseNumber: {
      type: String,
      required: true,
      trim: true,
    },
    yearsOfExperience: {
      type: Number,
      required: true,
      min: 1, // Minimum value for years of experience
    },
    licenseImage: {
      type: String, // Store the URI of the uploaded image
    },
  },
  { timestamps: true }
);

const DriverRegistration = mongoose.model("Drivers", DriversRegistrationSchema);

module.exports = DriverRegistration;
