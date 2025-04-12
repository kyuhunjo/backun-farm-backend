import mongoose from 'mongoose';

const welfareFacilitySchema = new mongoose.Schema({
  facilityName: { type: String, required: true },
  facilityType: { type: String, required: true },
  serviceType: { type: String, required: true },
  operationStatus: { type: String, required: true },
  designationDate: { type: Date, required: true },
  roadAddress: { type: String, required: true },
  parcelAddress: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  phoneNumber: { type: String, required: true },
  dataBaseDate: { type: Date, required: true }
}, {
  timestamps: true
});

// 위도,경도 인덱스 생성
welfareFacilitySchema.index({ latitude: 1, longitude: 1 });

// 시설명 인덱스 생성
welfareFacilitySchema.index({ facilityName: 'text' });

const WelfareFacility = mongoose.model('WelfareFacility', welfareFacilitySchema);

export default WelfareFacility;