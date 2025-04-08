import axios from 'axios';
import { parseString } from 'xml2js';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();

const parseXML = promisify(parseString);
const AIR_QUALITY_API_KEY = process.env.AIR_KOREA_API_KEY;

console.log('Air Korea API Key:', AIR_QUALITY_API_KEY ? '설정됨' : '설정되지 않음');

export const getAirQuality = async (req, res) => {
  try {
    if (!AIR_QUALITY_API_KEY) {
      throw new Error('Air Quality API 키가 설정되지 않았습니다');
    }

    const response = await axios.get('http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty', {
      params: {
        serviceKey: AIR_QUALITY_API_KEY,
        returnType: 'xml',
        numOfRows: '100',
        pageNo: '1',
        sidoName: '전남',
        ver: '1.0'
      }
    });

    const result = await parseXML(response.data);
    
    // API 응답의 전체 구조 확인
    const responseData = {
      resultCode: result.response?.header?.[0]?.resultCode?.[0] || '',
      resultMsg: result.response?.header?.[0]?.resultMsg?.[0] || '',
      numOfRows: result.response?.body?.[0]?.numOfRows?.[0] || '',
      pageNo: result.response?.body?.[0]?.pageNo?.[0] || '',
      totalCount: result.response?.body?.[0]?.totalCount?.[0] || '',
      items: []
    };
    
    if (!result.response?.body?.[0]?.items?.[0]?.item) {
      throw new Error('API 응답 데이터 형식이 올바르지 않습니다');
    }

    const items = result.response.body[0].items[0].item;
    const hwasunData = items.find(item => item.stationName[0] === '화순읍');

    if (hwasunData) {
      responseData.items = [{
        stationName: hwasunData.stationName?.[0] || '',      // 측정소명
        mangName: hwasunData.mangName?.[0] || '',            // 측정망 정보
        dataTime: hwasunData.dataTime?.[0] || '',            // 측정일시
        so2Value: hwasunData.so2Value?.[0] || '0',           // 아황산가스 농도
        coValue: hwasunData.coValue?.[0] || '0',             // 일산화탄소 농도
        o3Value: hwasunData.o3Value?.[0] || '0',             // 오존 농도
        no2Value: hwasunData.no2Value?.[0] || '0',           // 이산화질소 농도
        pm10Value: hwasunData.pm10Value?.[0] || '0',         // 미세먼지(PM10) 농도
        pm10Value24: hwasunData.pm10Value24?.[0] || '0',     // 미세먼지(PM10) 24시간 예측이동농도
        pm25Value: hwasunData.pm25Value?.[0] || '0',         // 초미세먼지(PM2.5) 농도
        pm25Value24: hwasunData.pm25Value24?.[0] || '0',     // 초미세먼지(PM2.5) 24시간 예측이동농도
        khaiValue: hwasunData.khaiValue?.[0] || '0',         // 통합대기환경수치
        khaiGrade: hwasunData.khaiGrade?.[0] || '0',         // 통합대기환경지수
        so2Grade: hwasunData.so2Grade?.[0] || '0',           // 아황산가스 지수
        coGrade: hwasunData.coGrade?.[0] || '0',             // 일산화탄소 지수
        o3Grade: hwasunData.o3Grade?.[0] || '0',             // 오존 지수
        no2Grade: hwasunData.no2Grade?.[0] || '0',           // 이산화질소 지수
        pm10Grade: hwasunData.pm10Grade?.[0] || '0',         // 미세먼지(PM10) 24시간 등급
        pm25Grade: hwasunData.pm25Grade?.[0] || '0',         // 초미세먼지(PM2.5) 24시간 등급
        pm10Grade1h: hwasunData.pm10Grade1h?.[0] || '0',     // 미세먼지(PM10) 1시간 등급
        pm25Grade1h: hwasunData.pm25Grade1h?.[0] || '0',     // 초미세먼지(PM2.5) 1시간 등급
        so2Flag: hwasunData.so2Flag?.[0] || '',              // 아황산가스 플래그
        coFlag: hwasunData.coFlag?.[0] || '',                // 일산화탄소 플래그
        o3Flag: hwasunData.o3Flag?.[0] || '',                // 오존 플래그
        no2Flag: hwasunData.no2Flag?.[0] || '',              // 이산화질소 플래그
        pm10Flag: hwasunData.pm10Flag?.[0] || '',            // 미세먼지(PM10) 플래그
        pm25Flag: hwasunData.pm25Flag?.[0] || ''             // 초미세먼지(PM2.5) 플래그
      }];
    }

    res.json(responseData);
  } catch (error) {
    console.error('대기질 데이터 조회 오류:', error.message);
    res.status(500).json({ error: '대기질 데이터를 가져오는데 실패했습니다' });
  }
};

export const getAllAirQuality = async (req, res) => {
  try {
    if (!AIR_QUALITY_API_KEY) {
      throw new Error('Air Quality API 키가 설정되지 않았습니다');
    }

    const response = await axios.get('http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty', {
      params: {
        serviceKey: AIR_QUALITY_API_KEY,
        returnType: 'xml',
        numOfRows: '100',
        pageNo: '1',
        sidoName: '전남',
        ver: '1.0'
      }
    });

    const result = await parseXML(response.data);
    
    // API 응답의 전체 구조 확인
    const responseData = {
      resultCode: result.response?.header?.[0]?.resultCode?.[0] || '',
      resultMsg: result.response?.header?.[0]?.resultMsg?.[0] || '',
      numOfRows: result.response?.body?.[0]?.numOfRows?.[0] || '',
      pageNo: result.response?.body?.[0]?.pageNo?.[0] || '',
      totalCount: result.response?.body?.[0]?.totalCount?.[0] || '',
      items: []
    };

    if (!result.response?.body?.[0]?.items?.[0]?.item) {
      throw new Error('API 응답 데이터 형식이 올바르지 않습니다');
    }

    const items = result.response.body[0].items[0].item;

    if (!Array.isArray(items)) {
      throw new Error('측정소 데이터가 배열 형식이 아닙니다');
    }

    responseData.items = items.map(item => ({
      stationName: item.stationName?.[0] || '',      // 측정소명
      mangName: item.mangName?.[0] || '',            // 측정망 정보
      dataTime: item.dataTime?.[0] || '',            // 측정일시
      so2Value: item.so2Value?.[0] || '0',           // 아황산가스 농도
      coValue: item.coValue?.[0] || '0',             // 일산화탄소 농도
      o3Value: item.o3Value?.[0] || '0',             // 오존 농도
      no2Value: item.no2Value?.[0] || '0',           // 이산화질소 농도
      pm10Value: item.pm10Value?.[0] || '0',         // 미세먼지(PM10) 농도
      pm10Value24: item.pm10Value24?.[0] || '0',     // 미세먼지(PM10) 24시간 예측이동농도
      pm25Value: item.pm25Value?.[0] || '0',         // 초미세먼지(PM2.5) 농도
      pm25Value24: item.pm25Value24?.[0] || '0',     // 초미세먼지(PM2.5) 24시간 예측이동농도
      khaiValue: item.khaiValue?.[0] || '0',         // 통합대기환경수치
      khaiGrade: item.khaiGrade?.[0] || '0',         // 통합대기환경지수
      so2Grade: item.so2Grade?.[0] || '0',           // 아황산가스 지수
      coGrade: item.coGrade?.[0] || '0',             // 일산화탄소 지수
      o3Grade: item.o3Grade?.[0] || '0',             // 오존 지수
      no2Grade: item.no2Grade?.[0] || '0',           // 이산화질소 지수
      pm10Grade: item.pm10Grade?.[0] || '0',         // 미세먼지(PM10) 24시간 등급
      pm25Grade: item.pm25Grade?.[0] || '0',         // 초미세먼지(PM2.5) 24시간 등급
      pm10Grade1h: item.pm10Grade1h?.[0] || '0',     // 미세먼지(PM10) 1시간 등급
      pm25Grade1h: item.pm25Grade1h?.[0] || '0',     // 초미세먼지(PM2.5) 1시간 등급
      so2Flag: item.so2Flag?.[0] || '',              // 아황산가스 플래그
      coFlag: item.coFlag?.[0] || '',                // 일산화탄소 플래그
      o3Flag: item.o3Flag?.[0] || '',                // 오존 플래그
      no2Flag: item.no2Flag?.[0] || '',              // 이산화질소 플래그
      pm10Flag: item.pm10Flag?.[0] || '',            // 미세먼지(PM10) 플래그
      pm25Flag: item.pm25Flag?.[0] || ''             // 초미세먼지(PM2.5) 플래그
    }));

    // 측정소 이름으로 정렬
    responseData.items.sort((a, b) => {
      const locA = a.stationName || '';
      const locB = b.stationName || '';
      return locA.localeCompare(locB);
    });

    res.json(responseData);
  } catch (error) {
    console.error('전체 대기질 데이터 조회 오류:', error.message);
    res.status(500).json({ error: '대기질 데이터를 가져오는데 실패했습니다' });
  }
}; 