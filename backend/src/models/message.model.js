const mongoose = require("mongoose");
const { isURL } = require("validator");

const SentimentSchema = new mongoose.Schema(
  {
    channel: { type: String, required: true, trim: true },
    score: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) {
          return v >= -1 && v <= 1;
        },
        message: (props) =>
          `${props.value} is not a valid sentiment score (-1..1)`,
      },
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    tags: { type: [String], default: [] },
    weight: { type: Number, default: 1 },
  },
  { _id: false }
);

const MessageSchema = new mongoose.Schema({
  instrument_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Instrument",
    index: true,
    required: true,
  },
  source_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Source",
    required: true,
  },
  timestamp: { type: Date, index: true, required: true },
  title: { type: String, trim: true, maxlength: 500 },
  content: { type: String },
  url: {
    type: String,
    validate: {
      validator: function (v) {
        return !v || isURL(v, { require_protocol: true });
      },
      message: (props) => `${props.value} is not a valid URL`,
    },
  },
  raw_json: { type: mongoose.Schema.Types.Mixed },
  sentiments: { type: [SentimentSchema], default: [] },
  embedding: { type: [Number], default: undefined },
  created_at: { type: Date, default: Date.now },
});

MessageSchema.index({ instrument_id: 1, timestamp: -1 });

module.exports = mongoose.model("Message", MessageSchema);
