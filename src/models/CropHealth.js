import mongoose from 'mongoose';

const CropHealthSchema = new mongoose.Schema({
  cropType: String,
  location: String,
  imageUrl: String,
  diagnosis: String,
  confidence: Number,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('CropHealth', CropHealthSchema); 