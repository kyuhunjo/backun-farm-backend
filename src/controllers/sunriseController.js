import axios from 'axios';
import { parseString } from 'xml2js';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();

const parseXML = promisify(parseString);
const SUNRISE_API_KEY = process.env.SUNRISE_API_KEY;

export const getSunriseSunset = async (req, res) => {
  try {
    // 파라미터 처리
    const { date, longitude, latitude } = req.query;
    
    // 날짜 파라미터 처리 (YYYYMMDD 형식)
    let locdate;
    if (date) {
      if (!/^\d{8}$/.test(date)) {
        return res.status(400).json({ 
          error: '날짜는 YYYYMMDD 형식이어야 합니다 (예: 20240409)' 
        });
      }
      locdate = date;
    } else {
      const now = new Date();
      now.setHours(now.getHours() + 9); // UTC를 KST로 변환
      locdate = now.toISOString().slice(0, 10).replace(/-/g, '');
    }

    // 기본 위치 (화순읍)
    let defaultLongitude = '126.9918';  // 경도
    let defaultLatitude = '35.0519';    // 위도

    // 위도/경도 파라미터 처리
    let lon = longitude || defaultLongitude;
    let lat = latitude || defaultLatitude;
    
    // 실수 형태인지 확인
    const isFloatingPoint = lon.includes('.') || lat.includes('.');
    const dnYn = isFloatingPoint ? 'Y' : 'N';

    let lonDeg, lonMin, latDeg, latMin;

    if (isFloatingPoint) {
      // 실수 형태(129.xxx)를 도분 형태로 변환
      [lonDeg, lonMin] = lon.split('.').map((part, index) => 
        index === 1 ? Math.round(Number('0.' + part) * 60) : Number(part)
      );
      [latDeg, latMin] = lat.split('.').map((part, index) => 
        index === 1 ? Math.round(Number('0.' + part) * 60) : Number(part)
      );
    } else {
      // 이미 도분 형태(128도 00분)인 경우
      lonDeg = Math.floor(Number(lon));
      lonMin = Math.round((Number(lon) - lonDeg) * 100);
      latDeg = Math.floor(Number(lat));
      latMin = Math.round((Number(lat) - latDeg) * 100);
    }

    // API 요청 파라미터 로깅
    console.log('API 요청 파라미터:', {
      locdate,
      longitude: lonDeg,
      latitude: latDeg,
      dnYn,
      longitudeMin: lonMin,
      latitudeMin: latMin
    });

    // API 요청
    const response = await axios.get('http://apis.data.go.kr/B090041/openapi/service/RiseSetInfoService/getLCRiseSetInfo', {
      params: {
        serviceKey: SUNRISE_API_KEY,
        locdate,
        longitude: lonDeg,
        latitude: latDeg,
        dnYn,
        longitudeMin: lonMin,
        latitudeMin: latMin,
        _type: 'xml'  // XML 형식으로 응답 요청
      },
      headers: {
        Accept: 'application/xml'  // XML 형식 요청 헤더 추가
      },
      paramsSerializer: params => {
        return Object.entries(params)
          .map(([key, value]) => {
            if (key === 'serviceKey') {
              return `${key}=${value}`; // 서비스 키는 이미 인코딩되어 있으므로 그대로 사용
            }
            return `${key}=${encodeURIComponent(value)}`; // 나머지 파라미터는 인코딩
          })
          .join('&');
      }
    });

    // API 응답이 JSON인 경우 처리
    let result;
    if (typeof response.data === 'object') {
      result = response.data;
    } else {
      // XML 응답인 경우 파싱
      result = await parseXML(response.data);
    }

    // API 응답 로깅
    console.log('API 원본 응답:', typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2));
    console.log('파싱된 응답:', JSON.stringify(result, null, 2));

    // 결과 코드 확인
    const resultCode = result.response?.header?.[0]?.resultCode?.[0];
    const resultMsg = result.response?.header?.[0]?.resultMsg?.[0];

    if (resultCode !== '00') {
      throw new Error(`API 오류: ${resultMsg || '알 수 없는 오류'} (코드: ${resultCode})`);
    }

    // 아이템 데이터 추출
    const item = result.response?.body?.[0]?.items?.[0]?.item?.[0];

    if (!item) {
      throw new Error('일출/일몰 데이터를 찾을 수 없습니다');
    }

    // 데이터 추출 함수 (공백 제거 추가)
    const getValue = (obj, key) => {
      const value = Array.isArray(obj[key]) ? obj[key][0] : obj[key];
      return value ? value.toString().trim() : '';
    };

    const sunriseData = {
      sunrise: getValue(item, 'sunrise'),           // 일출 시각
      sunset: getValue(item, 'sunset'),             // 일몰 시각
      location: getValue(item, 'location'),         // API에서 반환된 위치
      date: getValue(item, 'locdate'),             // API에서 반환된 날짜
      longitude: getValue(item, 'longitudeNum'),    // API에서 반환된 경도
      latitude: getValue(item, 'latitudeNum'),      // API에서 반환된 위도
      coordinates: {                               // 변환된 좌표
        longitude: `${lonDeg}도 ${lonMin}분`,
        latitude: `${latDeg}도 ${latMin}분`
      },
      moonrise: getValue(item, 'moonrise'),        // 월출 시각
      moonset: getValue(item, 'moonset'),          // 월몰 시각
      moontransit: getValue(item, 'moontransit'),  // 월남중 시각
      suntransit: getValue(item, 'suntransit'),    // 일남중 시각
      civilTwilight: {                             // 시민 박명
        morning: getValue(item, 'civilm'),         // 아침 시민 박명
        evening: getValue(item, 'civile')          // 저녁 시민 박명
      },
      nauticalTwilight: {                          // 항해 박명
        morning: getValue(item, 'nautm'),          // 아침 항해 박명
        evening: getValue(item, 'naute')           // 저녁 항해 박명
      },
      astronomicalTwilight: {                      // 천문 박명
        morning: getValue(item, 'astm'),           // 아침 천문 박명
        evening: getValue(item, 'aste')            // 저녁 천문 박명
      }
    };

    console.log(`[${locdate}] 일출: ${sunriseData.sunrise}, 일몰: ${sunriseData.sunset}`);
    res.json(sunriseData);
  } catch (error) {
    console.error('일출/일몰 API 오류:', error.message);
    if (error.response) {
      console.error('API 응답 상태:', error.response.status);
      console.error('API 응답 데이터:', error.response.data);
    }
    res.status(500).json({ 
      error: '일출/일몰 데이터를 가져오는데 실패했습니다',
      message: error.message 
    });
  }
}; 