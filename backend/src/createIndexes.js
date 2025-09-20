require("dotenv").config();
const mongoose = require("mongoose");

const Instrument = require("./models/instrument.model");
const Source = require("./models/source.model");
const Message = require("./models/message.model");
const AggregatedSentiment = require("./models/aggregatedSentiment.model");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/bnp";

async function run() {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to", MONGODB_URI);

  try {
    await Message.createIndexes();
    console.log("Created indexes for messages");

    await AggregatedSentiment.createIndexes();
    console.log("Created indexes for aggregated_sentiments");

    await Source.createIndexes();
    console.log("Created indexes for sources");

    console.log("All indexes created");
  } catch (err) {
    console.error("Error creating indexes", err);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
