import Facility from '../models/Facility.js';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import iconv from 'iconv-lite';

// 모든 시설 조회
export const getAllFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find();
    res.json({
      success: true,
      data: facilities,
      count: facilities.length
    });
  } catch (error) {
    console.error('시설 조회 에러:', error);
    res.status(500).json({
      success: false,
      error: error.message || '시설 정보 조회 중 오류가 발생했습니다.'
    });
  }
};

// CSV 파일에서 데이터 가져오기
export const importFromCSV = async (req, res) => {
  try {
    await Facility.deleteMany({});
    
    const csvPath = path.join(process.cwd(), '전라남도 화순군_노인복지시설_20240628.csv');

    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({
        success: false,
        error: 'CSV 파일을 찾을 수 없습니다.'
      });
    }
    
    const results = [];
    fs.createReadStream(csvPath)
      .pipe(iconv.decodeStream('euc-kr'))
      .pipe(csv())
      .on('data', (data) => {
        const latitude = parseFloat(data['위도']);
        const longitude = parseFloat(data['경도']);
        
        if (!isNaN(latitude) && !isNaN(longitude)) {
          const facility = {
            name: data['시설명'].trim(),
            type: data['시설구분'].trim(),
            serviceType: data['급여구분'].trim(),
            establishmentType: data['설립구분'].trim(),
            designationDate: data['지정일자'].trim(),
            address: data['소재지도로명주소'].trim(),
            oldAddress: data['소재지지번주소'].trim(),
            latitude,
            longitude,
            phoneNumber: data['전화번호'].trim(),
            updatedDate: data['데이터기준일'].trim(),
            location: {
              type: "Point",
              coordinates: [longitude, latitude]
            }
          };
          
          if (facility.name && facility.type && facility.serviceType) {
            results.push(facility);
          }
        }
      })
      .on('end', async () => {
        if (results.length > 0) {
          await Facility.insertMany(results);
          res.json({
            success: true,
            message: '데이터 가져오기 완료',
            count: results.length
          });
        } else {
          res.status(400).json({
            success: false,
            error: '가져올 데이터가 없습니다.'
          });
        }
      })
      .on('error', (error) => {
        console.error('CSV 파일 읽기 오류:', error);
        res.status(500).json({
          success: false,
          error: 'CSV 파일 읽기 오류: ' + error.message
        });
      });
  } catch (error) {
    console.error('데이터 임포트 에러:', error);
    res.status(500).json({
      success: false,
      error: error.message || '데이터 가져오기 중 오류가 발생했습니다.'
    });
  }
};

// 특정 반경 내의 시설 검색
export const searchByRadius = async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;
    
    const facilities = await Facility.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseFloat(radius) * 1000
        }
      }
    });
    
    res.json({
      success: true,
      data: facilities,
      count: facilities.length
    });
  } catch (error) {
    console.error('반경 검색 에러:', error);
    res.status(500).json({
      success: false,
      error: error.message || '반경 검색 중 오류가 발생했습니다.'
    });
  }
}; 