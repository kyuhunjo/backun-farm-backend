# 백운마을 스마트팜 백엔드 서버

화순군 백운마을의 스마트팜 시스템을 위한 백엔드 서버입니다.

## 주요 기능

- 실시간 날씨 정보 제공 (OpenWeatherMap API 연동)
- 대기질 정보 제공 (에어코리아 API 연동)
- 센서 데이터 수집 및 관리
  - 온도/습도
  - CO2 농도
  - 토양 수분
  - 기타 환경 데이터

## 기술 스택

- Node.js
- Express
- MongoDB
- OpenWeatherMap API
- 에어코리아 API

## 시작하기

### 필수 요구사항

- Node.js 18.0.0 이상
- MongoDB 5.0 이상
- OpenWeatherMap API 키
- 에어코리아 API 키

### 설치 방법

1. 저장소 클론
```bash
git clone https://github.com/kyuhunjo/backun-farm-backend.git
cd backun-farm-backend
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일을 열어 필요한 값들을 설정
```

4. 서버 실행
```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

## 환경 변수

| 변수명 | 설명 | 필수 여부 |
|--------|------|-----------|
| PORT | 서버 포트 번호 | 선택 (기본값: 8084) |
| MONGODB_URI | MongoDB 연결 문자열 | 필수 |
| WEATHER_API_KEY | OpenWeatherMap API 키 | 필수 |
| AIR_KOREA_API_KEY | 에어코리아 API 키 | 필수 |

## API 엔드포인트

### 날씨 정보
- GET `/api/weather` - 현재 날씨 정보
- GET `/api/forecast` - 5일 예보
- GET `/api/air-quality` - 대기질 정보

### 센서 데이터
- GET `/api/sensor-data` - 센서 데이터 조회
- GET `/api/sensor-data/:type` - 특정 유형의 센서 데이터 조회

## 프로젝트 구조

```
src/
├── app.js              # 애플리케이션 진입점
├── controllers/        # 컨트롤러
├── models/            # MongoDB 모델
├── routes/            # 라우터
└── utils/             # 유틸리티 함수
```

## 라이선스

MIT License

## 문의사항

프로젝트에 대한 문의사항이나 버그 리포트는 GitHub Issues를 통해 제출해 주세요. 