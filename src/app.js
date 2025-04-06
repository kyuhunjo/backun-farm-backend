import express from 'express';
import path from 'path';
import compression from 'compression';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';

// 라우터 임포트
import weatherRoutes from './routes/weather.js';
import sensorRoutes from './routes/sensor.js';
import excelRoutes from './routes/excel.js';
import localFoodRoutes from './routes/localFood.js';

// .env 파일 로딩
dotenv.config();

// 환경변수 설정
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farm';
const PORT = process.env.PORT || 8086;

// MongoDB 연결
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB 연결 성공'))
  .catch(err => console.error('MongoDB 연결 실패:', err));

// Multer 설정
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const app = express();

// 미들웨어 설정
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:3000', 
          'http://172.30.1.14:8084', 'http://172.30.1.14', 'http://backun-farm-frontend:8083',
          'http://backun-farm-frontend', 'https://hs.imjoe24.com', 'https://hs-api.imjoe24.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'http:'],
      imgSrc: ["'self'", 'data:', 'https:', 'http:'],
      connectSrc: ["'self'", 'https:', 'http:', 'ws:', 'wss:', 'api.openweathermap.org'],
      fontSrc: ["'self'", 'https:', 'data:', 'http:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
}));
app.use(compression());

// 라우터 설정
app.use('/api', weatherRoutes);
app.use('/api', sensorRoutes);
app.use('/api', excelRoutes);
app.use('/api', localFoodRoutes);

// 헬스체크
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 서버 시작
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API 서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 