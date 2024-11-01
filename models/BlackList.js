const mongoose = require("mongoose");

const BlackListSchema = new mongoose.Schema({
  token: {
    required: true,
    type: String,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Blacklist", BlackListSchema);
