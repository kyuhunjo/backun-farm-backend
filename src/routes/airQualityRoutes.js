import express from 'express';
import { getAirQuality, getAllAirQuality } from '../controllers/airQualityController.js';

const router = express.Router();

router.get('/current', getAirQuality);
router.get('/all', getAllAirQuality);

export default router; 