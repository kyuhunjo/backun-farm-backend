import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import LocalFoodStore from '../models/LocalFoodStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

// 엑셀 데이터 캐시
let excelData = null;

// 엑셀 파일 읽기 함수
const readExcelFile = () => {
  if (excelData) return excelData;

  try {
    console.log('프로젝트 루트 경로:', projectRoot);
    const files = fs.readdirSync(projectRoot);
    console.log('디렉토리 내 파일 목록:', files);
    
    const excelFile = files.find(file => file.endsWith('.xlsx'));
    console.log('찾은 엑셀 파일:', excelFile);
    
    if (!excelFile) {
      console.error('엑셀 파일을 찾을 수 없습니다.');
      return null;
    }

    const filePath = path.join(projectRoot, excelFile);
    console.log('엑셀 파일 전체 경로:', filePath);
    
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    console.log('엑셀 데이터 첫 번째 행:', data[0]);
    console.log('엑셀 데이터 열 이름들:', Object.keys(data[0]));

    excelData = data;
    return excelData;
  } catch (error) {
    console.error('엑셀 파일 읽기 오류:', error);
    return null;
  }
};

// 전체 직매장 목록 조회 (페이지네이션 지원)
export const getAllStores = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const stores = await LocalFoodStore.find()
      .sort({ number: 1 })
      .skip(skip)
      .limit(limit);

    const total = await LocalFoodStore.countDocuments();

    res.json({
      data: stores,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 지역별 직매장 검색
export const getStoresByRegion = async (req, res) => {
  try {
    const { region, district } = req.query;
    const query = {};
    
    if (region) query.region = region;
    if (district) query.district = district;

    const stores = await LocalFoodStore.find(query).sort({ number: 1 });
    res.json(stores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 직매장 상세 정보 조회
export const getStoreById = async (req, res) => {
  try {
    const store = await LocalFoodStore.findOne({ number: req.params.id });
    if (!store) {
      return res.status(404).json({ error: '직매장을 찾을 수 없습니다.' });
    }
    res.json(store);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 직매장 검색 (사업장명 또는 농협명칭으로)
export const searchStores = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      return res.status(400).json({ error: '검색어를 입력해주세요.' });
    }

    const stores = await LocalFoodStore.find({
      $or: [
        { storeName: { $regex: keyword, $options: 'i' } },
        { nhName: { $regex: keyword, $options: 'i' } }
      ]
    }).sort({ number: 1 });

    res.json(stores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 지역별 통계
export const getRegionStats = async (req, res) => {
  try {
    const stats = await LocalFoodStore.aggregate([
      {
        $group: {
          _id: '$region',
          totalStores: { $sum: 1 },
          districts: { $addToSet: '$district' }
        }
      },
      {
        $project: {
          region: '$_id',
          totalStores: 1,
          districtCount: { $size: '$districts' },
          districts: 1,
          _id: 0
        }
      },
      { $sort: { region: 1 } }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 엑셀 데이터 DB 동기화
export const syncExcelData = async (req, res) => {
  try {
    const data = readExcelFile();
    if (!data) {
      return res.status(404).json({ error: '엑셀 파일을 찾을 수 없습니다.' });
    }

    // 기존 데이터 삭제
    await LocalFoodStore.deleteMany({});

    // 새 데이터 입력
    const formattedData = data.map((item, index) => {
      console.log(`[${index + 1}번째 항목] 원본 데이터:`, item);
      
      // 날짜 형식 변환
      let openDate = null;
      if (item['개장일']) {
        try {
          const dateStr = item['개장일'].toString().trim();
          if (dateStr) {
            // YY.MM.DD 형식을 YYYY-MM-DD로 변환
            const parts = dateStr.split(/[./-]/);
            if (parts.length === 3) {
              const year = parts[0].length === 2 ? `20${parts[0]}` : parts[0];
              const month = parts[1].padStart(2, '0');
              const day = parts[2].padStart(2, '0');
              openDate = new Date(`${year}-${month}-${day}`);
              
              // 유효한 날짜인지 확인
              if (isNaN(openDate.getTime())) {
                console.error(`[${index + 1}번째 항목] 유효하지 않은 날짜:`, dateStr);
                openDate = null;
              } else {
                console.log(`[${index + 1}번째 항목] 날짜 변환 성공:`, dateStr, '->', openDate);
              }
            } else {
              console.error(`[${index + 1}번째 항목] 잘못된 날짜 형식:`, dateStr);
            }
          }
        } catch (error) {
          console.error(`[${index + 1}번째 항목] 날짜 변환 오류:`, error);
        }
      }

      return {
        number: Number(item['순번'] || item['번호'] || index + 1),
        region: String(item['시도'] || ''),
        district: String(item['시군구'] || ''),
        storeName: String(item['직매장명'] || item['매장명'] || ''),
        nhName: String(item['운영주체'] || ''),
        openDate: openDate,
        phoneNumber: String(item['연락처'] || ''),
        address: String(item['주소'] || '')
      };
    });

    const result = await LocalFoodStore.insertMany(formattedData);
    console.log('데이터 저장 완료:', result.length, '개의 항목이 저장됨');
    res.json({ message: '데이터 동기화가 완료되었습니다.', count: formattedData.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 