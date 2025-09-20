require('dotenv').config();
const mongoose = require('mongoose');
const { Instrument, Source, Message, AggregatedSentiment, LLMOpinion, User } = require('../src/index').models;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bnp';

async function seed() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  console.log('Connected to', MONGODB_URI);

  // Clear small set for idempotence (CAUTION: in prod don't drop collections)
  await Promise.all([
    Instrument.deleteMany({}),
    Source.deleteMany({}),
    Message.deleteMany({}),
    AggregatedSentiment.deleteMany({}),
    LLMOpinion.deleteMany({}),
    User.deleteMany({})
  ]);

  const inst = await Instrument.create({ name: 'Apple Inc', ticker: 'AAPL', isin: 'US0378331005', sector: 'Technology' });
  const src = await Source.create({ name: 'Example News', type: 'news', reputation_score: 8, url: 'https://news.example.com' });

  const msg = await Message.create({
    instrument_id: inst._id,
    source_id: src._id,
    timestamp: new Date(),
    title: 'Apple releases new iPhone',
    content: 'Apple launched its latest device...',
    url: 'https://news.example.com/apple-iphone',
    raw_json: { sample: true },
    sentiments: [ { channel: 'news', score: 0.8, confidence: 0.9, tags: ['product_launch'], weight: 1 } ]
  });

  const agg = await AggregatedSentiment.create({
    instrument_id: inst._id,
    period_start: new Date(Date.now() - 30*60*1000),
    period_end: new Date(),
    scores: { news: 0.65, social: 0.3 },
    aggregated_score: 0.45,
    rating: 4
  });

  await LLMOpinion.create({ instrument_id: inst._id, aggregated_sentiment_id: agg._id, recommendation: 'BUY', explanation: 'Positive news and strong earnings report', confidence: 0.9 });

  await User.create({ username: 'trader123', email: 'trader@example.com', password_hash: 'changeme', preferences: { watchlist: ['AAPL'] } });

  console.log('Seed complete');
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
