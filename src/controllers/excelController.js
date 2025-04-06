import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

// 엑셀 데이터 캐시
let excelData = null;

// 엑셀 파일 읽기 함수
const readExcelFile = () => {
  if (excelData) return excelData;

  try {
    const workbook = xlsx.readFile(path.join(projectRoot, 'data.xlsx'));
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    excelData = xlsx.utils.sheet_to_json(worksheet);
    return excelData;
  } catch (error) {
    console.error('엑셀 파일 읽기 오류:', error);
    return null;
  }
};

// 전체 데이터 조회
export const getAllData = (req, res) => {
  try {
    const data = readExcelFile();
    if (!data) {
      return res.status(404).json({ error: '데이터를 찾을 수 없습니다.' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 특정 필드로 데이터 검색
export const searchData = (req, res) => {
  try {
    const { field, value } = req.query;
    if (!field || !value) {
      return res.status(400).json({ error: '검색 필드와 값을 모두 지정해주세요.' });
    }

    const data = readExcelFile();
    if (!data) {
      return res.status(404).json({ error: '데이터를 찾을 수 없습니다.' });
    }

    const results = data.filter(item => 
      String(item[field]).toLowerCase().includes(String(value).toLowerCase())
    );

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 데이터 통계
export const getStats = (req, res) => {
  try {
    const { field } = req.query;
    if (!field) {
      return res.status(400).json({ error: '통계를 낼 필드를 지정해주세요.' });
    }

    const data = readExcelFile();
    if (!data) {
      return res.status(404).json({ error: '데이터를 찾을 수 없습니다.' });
    }

    // 숫자 필드인 경우
    if (typeof data[0][field] === 'number') {
      const stats = {
        average: data.reduce((acc, curr) => acc + curr[field], 0) / data.length,
        max: Math.max(...data.map(item => item[field])),
        min: Math.min(...data.map(item => item[field])),
        total: data.reduce((acc, curr) => acc + curr[field], 0)
      };
      return res.json(stats);
    }

    // 문자열 필드인 경우
    const frequency = data.reduce((acc, curr) => {
      const value = curr[field];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});

    res.json({ frequency });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 