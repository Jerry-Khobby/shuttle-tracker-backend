const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrdinaryUserSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: false,
  },
  accountId: {
    type: String,
    unique: true,
    required: false,
  },
  provider: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", OrdinaryUserSchema);
