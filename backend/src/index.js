require("dotenv").config();
const mongoose = require("mongoose");

const Instrument = require("./models/instrument.model");
const Source = require("./models/source.model");
const Message = require("./models/message.model");
const AggregatedSentiment = require("./models/aggregatedSentiment.model");
const LLMOpinion = require("./models/llmOpinion.model");
const User = require("./models/user.model");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/bnp";

async function start() {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to", MONGODB_URI);

  // simple test: count collections
  const counts = await Promise.all([
    Instrument.countDocuments(),
    Source.countDocuments(),
    Message.countDocuments(),
  ]).catch(() => [0, 0, 0]);

  console.log(
    "Counts: instruments=%d sources=%d messages=%d",
    counts[0],
    counts[1],
    counts[2]
  );

  // keep process alive when run as `npm start`
}

if (require.main === module) {
  start().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = {
  start,
  models: {
    Instrument,
    Source,
    Message,
    AggregatedSentiment,
    LLMOpinion,
    User,
  },
};
