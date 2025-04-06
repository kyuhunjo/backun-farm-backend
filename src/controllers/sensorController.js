import SensorData from '../models/SensorData.js';

export const getSensorData = async (req, res) => {
  try {
    const { location, type, period } = req.query;
    const query = {};
    
    if (location) query.location = location;
    if (type) query.type = type;
    
    let timeFilter = {};
    if (period) {
      const now = new Date();
      switch (period) {
        case 'day':
          timeFilter = { $gte: new Date(now.setDate(now.getDate() - 1)) };
          break;
        case 'week':
          timeFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
          break;
        case 'month':
          timeFilter = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
          break;
        default:
          timeFilter = { $gte: new Date(now.setHours(now.getHours() - 6)) };
      }
      query.timestamp = timeFilter;
    }

    const data = await SensorData.find(query).sort({ timestamp: -1 }).limit(100);
    
    if (data.length === 0) {
      // 샘플 데이터 반환
      return res.json([
        {
          location: 'deodeok-A',
          type: 'moisture',
          value: 65,
          timestamp: new Date()
        },
        {
          location: 'doraji-A',
          type: 'co2',
          value: 420,
          timestamp: new Date()
        }
      ]);
    }
    
    res.json(data);
  } catch (error) {
    console.error('센서 데이터 조회 중 오류:', error);
    res.status(500).json({ error: '센서 데이터를 가져오는데 실패했습니다' });
  }
};

export const getSensorDataByType = async (req, res) => {
  try {
    const { type } = req.params;
    const data = await SensorData.find({ type })
      .sort({ timestamp: -1 })
      .limit(1);
    res.json(data[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 