const mongoose = require("mongoose");
const { isURL } = require("validator");

const SourceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 200 },
  type: {
    type: String,
    enum: ["news", "social", "economic"],
    required: true,
    index: true,
  },
  reputation_score: { type: Number, default: 0, min: 0, max: 10 },
  url: {
    type: String,
    validate: {
      validator: function (v) {
        return !v || isURL(v, { require_protocol: true });
      },
      message: (props) => `${props.value} is not a valid URL`,
    },
  },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Source", SourceSchema);
