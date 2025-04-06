import mongoose from 'mongoose';

const LocalFoodStoreSchema = new mongoose.Schema({
  number: { type: Number },
  region: { type: String },
  district: { type: String },
  storeName: { type: String },
  nhName: { type: String },
  openDate: { type: Date },
  phoneNumber: { type: String },
  address: { type: String }
});

// 검색을 위한 인덱스 생성
LocalFoodStoreSchema.index({ region: 1, district: 1 });
LocalFoodStoreSchema.index({ storeName: 'text', nhName: 'text' });

export default mongoose.model('LocalFoodStore', LocalFoodStoreSchema); 