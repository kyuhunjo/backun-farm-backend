import express from 'express';
import { getSensorData, getSensorDataByType } from '../controllers/sensorController.js';

const router = express.Router();

router.get('/sensor-data', getSensorData);
router.get('/sensor-data/:type', getSensorDataByType);

export default router; 