import express from 'express';
import {
  getAllJobPostings,
  getJobPosting,
  createJobPosting,
  updateJobPosting,
  deleteJobPosting,
  updateStatus
} from '../controllers/jobPostingController.js';

const router = express.Router();

// 모든 일손모집 공고 조회
router.get('/', getAllJobPostings);

// 특정 일손모집 공고 조회
router.get('/:id', getJobPosting);

// 일손모집 공고 생성
router.post('/', createJobPosting);

// 일손모집 공고 수정
router.put('/:id', updateJobPosting);

// 일손모집 공고 삭제
router.delete('/:id', deleteJobPosting);

// 모집 상태 변경
router.patch('/:id/status', updateStatus);

export default router; 