import mongoose from 'mongoose';

const SensorDataSchema = new mongoose.Schema({
  location: String,
  type: String,
  value: Number,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('SensorData', SensorDataSchema); 