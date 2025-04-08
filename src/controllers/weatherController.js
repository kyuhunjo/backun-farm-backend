import axios from 'axios';
import { parseString } from 'xml2js';
import { promisify } from 'util';
import dotenv from 'dotenv';
import { getPM10Grade, getPM25Grade } from '../utils/airQualityUtils.js';

dotenv.config();

const parseXML = promisify(parseString);
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

console.log('Weather API Key:', WEATHER_API_KEY ? '설정됨' : '설정되지 않음');

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
      // UTC 시간을 KST로 변환
      const utcDate = new Date(currentWeather.data.dt * 1000);
      const kstDate = new Date(utcDate.getTime() + (9 * 60 * 60 * 1000));
      
      // KST 기준으로 오늘 자정 설정
      const today = new Date(kstDate);
      today.setHours(0, 0, 0, 0);
      today.setTime(today.getTime() - (9 * 60 * 60 * 1000)); // UTC로 변환
      
      // KST 기준으로 내일 자정 설정
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      let todayMin = currentWeather.data.main.temp;
      let todayMax = currentWeather.data.main.temp;
      
      if (forecastData.data && forecastData.data.list) {
        forecastData.data.list.forEach(item => {
          const itemUtcDate = new Date(item.dt * 1000);
          const itemKstDate = new Date(itemUtcDate.getTime() + (9 * 60 * 60 * 1000));
          
          if (itemKstDate >= today && itemKstDate < tomorrow) {
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
        timestamp: kstDate.toISOString(),
        kstDateTime: new Intl.DateTimeFormat('ko-KR', {
          timeZone: 'Asia/Seoul',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(utcDate)
      };
      
      console.log('날씨 데이터 시간 정보:', {
        현재UTC시간: utcDate.toISOString(),
        현재KST시간: kstDate.toISOString(),
        변환된시간: weatherData.kstDateTime,
        오늘자정: today.toISOString(),
        내일자정: tomorrow.toISOString()
      });
      
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
      const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
      
      // KST 기준으로 오늘 자정 설정
      const today = new Date(kstNow);
      today.setHours(0, 0, 0, 0);
      today.setTime(today.getTime() - (9 * 60 * 60 * 1000)); // UTC로 변환
      
      // KST 기준으로 내일 자정 설정
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      console.log('시간 정보:', {
        현재UTC: now.toISOString(),
        현재KST: kstNow.toISOString(),
        오늘자정KST: today.toISOString(),
        내일자정KST: tomorrow.toISOString()
      });

      response.data.list.forEach(item => {
        const itemUtcDate = new Date(item.dt * 1000);
        const kstDate = new Date(itemUtcDate.getTime() + (9 * 60 * 60 * 1000));
        
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
            kstDateTime: new Intl.DateTimeFormat('ko-KR', {
              timeZone: 'Asia/Seoul',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }).format(kstDate),
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
            kstDateTime: data.noonData.kstDateTime,
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
      
      console.log('예보 데이터 응답:', sortedData.map(data => ({
        date: new Date(data.dt * 1000).toISOString(),
        kst: data.kstDateTime
      })));
      
      res.json(sortedData);
    } else {
      throw new Error('Invalid API response structure');
    }
  } catch (error) {
    console.error('예보 API 호출 오류:', error);
    res.status(500).json({ error: '예보 데이터를 가져오는데 실패했습니다' });
  }
}; 