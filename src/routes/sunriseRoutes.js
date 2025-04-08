import express from 'express';
import { getSunriseSunset } from '../controllers/sunriseController.js';

const router = express.Router();

router.get('/current', getSunriseSunset);

export default router; 