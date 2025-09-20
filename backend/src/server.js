require('dotenv').config();
const express = require('express');
const { models, start } = require('./index');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.get('/health', (req, res) => res.json({ ok: true }));

// Get latest messages for an instrument by ticker
app.get('/instruments/:ticker/messages', async (req, res) => {
  const { ticker } = req.params;
  try {
    const instrument = await models.Instrument.findOne({ ticker: ticker.toUpperCase() }).exec();
    if (!instrument) return res.status(404).json({ error: 'Instrument not found' });

    const messages = await models.Message.find({ instrument_id: instrument._id })
      .sort({ timestamp: -1 })
      .limit(50)
      .exec();

    res.json({ instrument, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

// Get latest aggregated sentiment for an instrument
app.get('/instruments/:ticker/sentiment/latest', async (req, res) => {
  const { ticker } = req.params;
  try {
    const instrument = await models.Instrument.findOne({ ticker: ticker.toUpperCase() }).exec();
    if (!instrument) return res.status(404).json({ error: 'Instrument not found' });

    const agg = await models.AggregatedSentiment.find({ instrument_id: instrument._id })
      .sort({ period_end: -1 })
      .limit(1)
      .exec();

    res.json({ instrument, aggregated: agg[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

// start DB connection then start HTTP server
start().then(() => {
  app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
}).catch(err => {
  console.error('Failed to start app', err);
  process.exit(1);
});
