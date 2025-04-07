import axios from 'axios';
import { parseString } from 'xml2js';
import { promisify } from 'util';
import dotenv from 'dotenv';
import { getPM10Grade, getPM25Grade } from '../utils/airQualityUtils.js';

dotenv.config();

const parseXML = promisify(parseString);
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const AIR_KOREA_API_KEY = process.env.AIR_KOREA_API_KEY;

console.log('Weather API Key loaded:', WEATHER_API_KEY ? '설정됨' : '설정되지 않음');
console.log('Air Korea API Key loaded:', AIR_KOREA_API_KEY ? '설정됨' : '설정되지 않음');

export const getWeather = async (req, res) => {
  try {
    if (!WEATHER_API_KEY) {
      throw new Error('Weather API 키가 설정되지 않았습니다');
    }

    const lat = '35.0519';
    const lon = '126.9918';
    
    const [currentWeather, forecastData] = await Promise.all([
      axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=kr`),
      axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=kr`)
    ]);
    
    if (currentWeather.data) {
      const date = new Date(currentWeather.data.dt * 1000);
      const kstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
      
      let todayMin = currentWeather.data.main.temp;
      let todayMax = currentWeather.data.main.temp;
      
      if (forecastData.data && forecastData.data.list) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        forecastData.data.list.forEach(item => {
          const itemDate = new Date(item.dt * 1000);
          if (itemDate >= today && itemDate < tomorrow) {
            todayMin = Math.min(todayMin, item.main.temp);
            todayMax = Math.max(todayMax, item.main.temp);
          }
        });
      }
      
      const weatherData = {
        temperature: Math.round(currentWeather.data.main.temp * 10) / 10,
        temp_min: Math.round(todayMin * 10) / 10,
        temp_max: Math.round(todayMax * 10) / 10,
        humidity: currentWeather.data.main.humidity,
        rainfall: currentWeather.data.rain ? currentWeather.data.rain['1h'] || 0 : 0,
        windSpeed: Math.round(currentWeather.data.wind.speed * 10) / 10,
        windDirection: currentWeather.data.wind.deg,
        description: currentWeather.data.weather[0].description,
        icon: currentWeather.data.weather[0].icon,
        timestamp: kstDate.toISOString()
      };
      
      res.json(weatherData);
    } else {
      throw new Error('Invalid API response structure');
    }
  } catch (error) {
    console.error('날씨 API 호출 오류:', error);
    res.status(500).json({ error: '날씨 데이터를 가져오는데 실패했습니다' });
  }
};

export const getForecast = async (req, res) => {
  try {
    if (!WEATHER_API_KEY) {
      throw new Error('Weather API 키가 설정되지 않았습니다');
    }

    const lat = '35.0519';
    const lon = '126.9918';
    
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=kr`
    );
    
    if (response.data && response.data.list) {
      const dailyData = {};
      const tempData = {};
      
      const now = new Date();
      const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0, 0, 0, 0
      );
      
      response.data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const kstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
        
        const kstDateOnly = new Date(
          kstDate.getFullYear(),
          kstDate.getMonth(),
          kstDate.getDate()
        );
        
        if (kstDateOnly.getTime() <= today.getTime()) {
          return;
        }
        
        const dateKey = kstDate.toISOString().split('T')[0];
        const hours = kstDate.getHours();
        
        if (!tempData[dateKey]) {
          tempData[dateKey] = {
            temps: [],
            maxTemp: -Infinity,
            minTemp: Infinity,
            noonTemp: null,
            noonData: null
          };
        }
        
        const currentTemp = Math.round(item.main.temp * 10) / 10;
        tempData[dateKey].temps.push(currentTemp);
        tempData[dateKey].maxTemp = Math.max(tempData[dateKey].maxTemp, currentTemp);
        tempData[dateKey].minTemp = Math.min(tempData[dateKey].minTemp, currentTemp);
        
        if (hours === 12) {
          tempData[dateKey].noonTemp = currentTemp;
          tempData[dateKey].noonData = {
            dt: item.dt,
            humidity: item.main.humidity,
            weather: item.weather,
            wind: item.wind,
            rain: item.rain
          };
        }
      });
      
      Object.entries(tempData).forEach(([dateKey, data]) => {
        if (data.noonData) {
          dailyData[dateKey] = {
            dt: data.noonData.dt,
            main: {
              temp: data.noonTemp,
              temp_min: Math.round(data.minTemp * 10) / 10,
              temp_max: Math.round(data.maxTemp * 10) / 10,
              humidity: data.noonData.humidity
            },
            weather: data.noonData.weather.map(w => ({
              description: w.description,
              icon: w.icon
            })),
            wind: {
              speed: Math.round(data.noonData.wind.speed * 10) / 10,
              deg: data.noonData.wind.deg
            },
            rain: data.noonData.rain ? Math.round((data.noonData.rain['3h'] || 0) * 10) / 10 : 0
          };
        }
      });
      
      const sortedData = Object.entries(dailyData)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .slice(0, 5)
        .map(([, data]) => data);
      
      res.json(sortedData);
    } else {
      throw new Error('Invalid API response structure');
    }
  } catch (error) {
    console.error('예보 API 호출 오류:', error);
    res.status(500).json({ error: '예보 데이터를 가져오는데 실패했습니다' });
  }
};

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