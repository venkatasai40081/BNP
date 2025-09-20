const mongoose = require("mongoose");

const LLMSchema = new mongoose.Schema({
  instrument_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Instrument",
    index: true,
    required: true,
  },
  aggregated_sentiment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AggregatedSentiment",
  },
  recommendation: {
    type: String,
    enum: ["BUY", "SELL", "HOLD"],
    required: true,
  },
  explanation: { type: String },
  confidence: { type: Number, min: 0, max: 1 },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("LLMOpinion", LLMSchema);
