import mongoose from 'mongoose';

const MarketDataSchema = new mongoose.Schema({
  date: Date,
  location: String,
  price: Number,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('MarketData', MarketDataSchema); 