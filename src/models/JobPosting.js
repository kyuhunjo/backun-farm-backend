import mongoose from 'mongoose';

const jobPostingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '제목은 필수 입력입니다.']
  },
  startDate: {
    type: Date,
    required: [true, '시작일은 필수 입력입니다.']
  },
  endDate: {
    type: Date,
    required: [true, '종료일은 필수 입력입니다.']
  },
  location: {
    type: String,
    required: [true, '장소는 필수 입력입니다.']
  },
  numberOfPeople: {
    type: Number,
    required: [true, '필요 인원은 필수 입력입니다.'],
    min: [1, '최소 1명 이상이어야 합니다.']
  },
  dailyWage: {
    type: Number,
    required: [true, '일당은 필수 입력입니다.'],
    min: [0, '일당은 0원 이상이어야 합니다.']
  },
  details: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['모집중', '모집완료', '기간만료'],
    default: '모집중'
  }
}, {
  timestamps: true
});

// 시작일이 종료일보다 이전인지 검증
jobPostingSchema.pre('save', function(next) {
  if (this.startDate > this.endDate) {
    next(new Error('시작일은 종료일보다 이전이어야 합니다.'));
  }
  next();
});

export default mongoose.model('JobPosting', jobPostingSchema); 