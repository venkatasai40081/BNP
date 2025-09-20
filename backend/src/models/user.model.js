const mongoose = require("mongoose");
const { isEmail } = require("validator");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: (v) => isEmail(v),
      message: (p) => `${p.value} is not a valid email`,
    },
  },
  password_hash: { type: String, required: true },
  preferences: {
    watchlist: { type: [String], default: [] },
  },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
