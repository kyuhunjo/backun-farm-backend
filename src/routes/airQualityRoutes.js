import express from 'express';
import { getAirQuality } from '../controllers/airQualityController.js';

const router = express.Router();

router.get('/current', getAirQuality);

export default router; 