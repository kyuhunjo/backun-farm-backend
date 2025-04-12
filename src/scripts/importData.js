import mongoose from 'mongoose';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import iconv from 'iconv-lite';
import Facility from '../models/Facility.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

mongoose.connect('mongodb://localhost:27017/farm', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB 연결 성공');
  importData();
}).catch((error) => {
  console.error('MongoDB 연결 실패:', error);
  process.exit(1);
});

const importData = async () => {
  try {
    await Facility.deleteMany({});
    console.log('기존 데이터 삭제 완료');
    
    const csvPath = path.join(process.cwd(), '전라남도 화순군_노인복지시설_20240628.csv');
    const results = [];

    fs.createReadStream(csvPath)
      .pipe(iconv.decodeStream('euc-kr'))
      .pipe(csv({ 
        headers: ['name', 'type', 'serviceType', 'establishmentType', 'designationDate', 
                 'address', 'oldAddress', 'latitude', 'longitude', 'phoneNumber', 'updatedDate'], 
        skipLines: 1 
      }))
      .on('data', (data) => {
        const latitude = parseFloat(data.latitude);
        const longitude = parseFloat(data.longitude);
        
        if (!isNaN(latitude) && !isNaN(longitude)) {
          results.push({
            ...data,
            latitude,
            longitude,
            updatedDate: new Date(data.updatedDate),
            location: {
              type: "Point",
              coordinates: [longitude, latitude]
            }
          });
        }
      })
      .on('end', async () => {
        if (results.length > 0) {
          await Facility.insertMany(results);
          console.log(`총 ${results.length}개의 데이터가 MongoDB에 저장되었습니다.`);
        }
        mongoose.connection.close();
        process.exit(0);
      })
      .on('error', (error) => {
        console.error('CSV 파일 읽기 오류:', error);
        process.exit(1);
      });
  } catch (error) {
    console.error('데이터 처리 중 오류 발생:', error);
    process.exit(1);
  }
}; 