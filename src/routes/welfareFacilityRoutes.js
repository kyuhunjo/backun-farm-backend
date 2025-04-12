import express from 'express';
import {
  getAllFacilities,
  getFacilitiesByType,
  getNearbyFacilities
} from '../controllers/welfareFacilityController.js';

const router = express.Router();

// 모든 시설 조회
router.get('/', getAllFacilities);

// 시설 유형별 조회
router.get('/type/:type', getFacilitiesByType);

// 주변 시설 조회
router.get('/nearby', getNearbyFacilities);

export default router;