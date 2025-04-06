import express from 'express';
import {
  getAllStores,
  getStoresByRegion,
  getStoreById,
  searchStores,
  getRegionStats,
  syncExcelData
} from '../controllers/localFoodController.js';

const router = express.Router();

// 전체 직매장 목록 조회 (페이지네이션)
router.get('/stores', getAllStores);

// 지역별 직매장 검색
router.get('/stores/region', getStoresByRegion);

// 직매장 상세 정보 조회
router.get('/stores/:id', getStoreById);

// 직매장 검색 (사업장명/농협명칭)
router.get('/stores/search', searchStores);

// 지역별 통계
router.get('/stats/region', getRegionStats);

// 엑셀 데이터 DB 동기화
router.post('/sync', syncExcelData);

export default router; 