Backend for BNP — MongoDB schemas using Mongoose

Quick start

1. copy `.env.example` to `.env` and set `MONGODB_URI`
2. run `npm install`
3. run `npm run create-indexes` to create recommended indexes

Files

- `src/models/*` — Mongoose models
- `src/createIndexes.js` — script to create indexes
- `src/index.js` — simple connection test / exports

Usage

Import models from `src/index.js` in your application:

```js
const { models } = require("./src/index");
const { Instrument, Message } = models;

// example: find latest messages for an instrument
async function latestMessages(instrumentId) {
  return Message.find({ instrument_id: instrumentId })
    .sort({ timestamp: -1 })
    .limit(50)
    .exec();
}
```

Create the recommended indexes (one-time):

```powershell
cd d:\BNP\backend
npm run create-indexes
```
