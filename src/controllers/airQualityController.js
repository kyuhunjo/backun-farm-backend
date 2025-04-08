import axios from 'axios';
import { parseString } from 'xml2js';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();

const parseXML = promisify(parseString);
const AIR_KOREA_API_KEY = process.env.AIR_KOREA_API_KEY;

console.log('Air Korea API Key:', AIR_KOREA_API_KEY ? '설정됨' : '설정되지 않음');

export const getAirQuality = async (req, res) => {
  try {
    if (!AIR_KOREA_API_KEY) {
      throw new Error('Air Korea API 키가 설정되지 않았습니다');
    }

    const encodedKey = encodeURIComponent(AIR_KOREA_API_KEY);
    const url = `http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty?serviceKey=${encodedKey}&returnType=xml&numOfRows=100&pageNo=1&sidoName=전남&ver=1.0`;
    
    console.log('대기질 API 요청:', { sidoName: '전남' });
    const response = await axios.get(url);
    
    if (!response.data) {
      throw new Error('API 응답이 없습니다');
    }

    console.log('대기질 API 원본 응답:', response.data);
    const jsonData = await parseXML(response.data);
    console.log('대기질 API 파싱된 응답:', JSON.stringify(jsonData, null, 2));
    
    const items = jsonData.response?.body?.[0]?.items?.[0]?.item || [];
    console.log('추출된 items:', items);
    
    const targetData = Array.isArray(items) ? 
      items.find(item => item.stationName?.[0] === '화순읍') : 
      items;

    if (!targetData) {
      console.log('화순읍 측정소 데이터가 없어 기본값을 반환합니다.');
      const defaultData = {
        pm10Value: '0',
        pm25Value: '0',
        pm10Grade: '1',
        pm25Grade: '1',
        o3Value: '0',
        coValue: '0',
        no2Value: '0',
        so2Value: '0',
        stationName: '화순읍',
        dataTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
        sidoName: '전남'
      };
      return res.json(defaultData);
    }

    const result = {
      pm10Value: targetData.pm10Value?.[0]?.toString() || '0',
      pm25Value: targetData.pm25Value?.[0]?.toString() || '0',
      pm10Grade: targetData.pm10Grade?.[0]?.toString() || '1',
      pm25Grade: targetData.pm25Grade?.[0]?.toString() || '1',
      o3Value: targetData.o3Value?.[0]?.toString() || '0',
      coValue: targetData.coValue?.[0]?.toString() || '0',
      no2Value: targetData.no2Value?.[0]?.toString() || '0',
      so2Value: targetData.so2Value?.[0]?.toString() || '0',
      stationName: targetData.stationName?.[0] || '화순읍',
      dataTime: targetData.dataTime?.[0] || new Date().toISOString().slice(0, 19).replace('T', ' '),
      sidoName: targetData.sidoName?.[0] || '전남'
    };

    Object.keys(result).forEach(key => {
      if (result[key] === '-') {
        result[key] = '0';
      }
    });

    res.json(result);
  } catch (error) {
    console.error('대기질 API 호출 오류:', error);
    res.status(500).json({ error: '대기질 데이터를 가져오는데 실패했습니다' });
  }
}; 