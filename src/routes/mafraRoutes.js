import express from 'express';
import { getMafraNews } from '../controllers/mafraController.js';

const router = express.Router();

router.get('/news', getMafraNews);

export default router; 