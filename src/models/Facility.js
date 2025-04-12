import mongoose from 'mongoose';

const facilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  serviceType: {
    type: String,
    required: true
  },
  establishmentType: {
    type: String,
    required: true
  },
  designationDate: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  oldAddress: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  updatedDate: {
    type: Date,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
}, {
  timestamps: true
});

// 위치 기반 검색을 위한 인덱스 추가
facilitySchema.index({ location: '2dsphere' });

export default mongoose.model('Facility', facilitySchema); 