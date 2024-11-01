const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const OrdinaryUser = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
    unique: true,
  },
  name: {
    type: String,
    required: true, // Required for both GitHub and regular users
  },
  email: {
    type: String,
    required: false, // Required for both GitHub and regular users
    unique: true,
    index: true, // Helps in querying the email quickly
  },
  password: {
    type: String,
    required: false, // Required for regular email/password users, but optional for OAuth users
  },
  accountId: {
    type: String,
    unique: true, // GitHub user accountId, optional for non-GitHub users
    required: false, // Only required for GitHub users
  },
  provider: {
    type: String,
    required: false, // Only required for OAuth users like GitHub
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the creation time
  },
});
