import express from 'express';
import { getAllFacilities, importFromCSV, searchByRadius } from '../controllers/facilityController.js';

const router = express.Router();

// 모든 시설 조회
router.get('/', getAllFacilities);

// CSV 파일에서 데이터 가져오기
router.post('/import', importFromCSV);

// 특정 반경 내의 시설 검색
router.get('/search', searchByRadius);

export default router; 