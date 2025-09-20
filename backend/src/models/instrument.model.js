const mongoose = require("mongoose");

const InstrumentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 200 },
  ticker: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    index: true,
    maxlength: 20,
  },
  isin: {
    type: String,
    trim: true,
    uppercase: true,
    validate: {
      validator: function (v) {
        // basic ISIN check: 12 chars alphanumeric
        return !v || /^[A-Z0-9]{12}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid ISIN`,
    },
  },
  sector: { type: String, trim: true, maxlength: 100 },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Instrument", InstrumentSchema);
