import express from 'express';
import { getWeather, getForecast, getAirQuality } from '../controllers/weatherController.js';

const router = express.Router();

router.get('/weather', getWeather);
router.get('/forecast', getForecast);
router.get('/air-quality', getAirQuality);

export default router; 