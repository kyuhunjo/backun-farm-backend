import express from 'express';
import { getWeather, getForecast } from '../controllers/weatherController.js';

const router = express.Router();

router.get('/current', getWeather);
router.get('/forecast', getForecast);

export default router; 