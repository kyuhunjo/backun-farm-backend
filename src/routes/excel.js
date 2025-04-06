import express from 'express';
import { getAllData, searchData, getStats } from '../controllers/excelController.js';

const router = express.Router();

// 전체 데이터 조회
router.get('/excel', getAllData);

// 데이터 검색
router.get('/excel/search', searchData);

// 데이터 통계
router.get('/excel/stats', getStats);

export default router; 