const mongoose = require("mongoose");

const AggregatedSentimentSchema = new mongoose.Schema({
  instrument_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Instrument",
    index: true,
    required: true,
  },
  period_start: { type: Date, required: true },
  period_end: { type: Date, index: true, required: true },
  scores: { type: Map, of: Number, default: {} },
  aggregated_score: {
    type: Number,
    validate: {
      validator: function (v) {
        return v === undefined || (v >= -1 && v <= 1);
      },
      message: (props) =>
        `${props.value} is not a valid aggregated score (-1..1)`,
    },
  },
  rating: { type: Number, min: 1, max: 5 },
  created_at: { type: Date, default: Date.now },
});

AggregatedSentimentSchema.index({ instrument_id: 1, period_end: -1 });

module.exports = mongoose.model(
  "AggregatedSentiment",
  AggregatedSentimentSchema
);
