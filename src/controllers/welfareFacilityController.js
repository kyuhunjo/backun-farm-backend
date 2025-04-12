import WelfareFacility from '../models/WelfareFacility.js';

// 모든 복지시설 조회
export const getAllFacilities = async (req, res) => {
  try {
    const facilities = await WelfareFacility.find();
    res.json({ 
      success: true, 
      data: facilities 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '복지시설 조회 중 오류가 발생했습니다.',
      error: error.message 
    });
  }
};

// 시설 유형별 조회
export const getFacilitiesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const facilities = await WelfareFacility.find({ facilityType: type });
    res.json({ 
      success: true, 
      data: facilities 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '복지시설 유형별 조회 중 오류가 발생했습니다.',
      error: error.message 
    });
  }
};

// 위치 기반 근처 시설 조회
export const getNearbyFacilities = async (req, res) => {
  try {
    const { latitude, longitude, radius = 1 } = req.query;
    
    const facilities = await WelfareFacility.find({
      latitude: { 
        $gte: parseFloat(latitude) - radius/111.32,
        $lte: parseFloat(latitude) + radius/111.32
      },
      longitude: {
        $gte: parseFloat(longitude) - radius/(111.32*Math.cos(latitude*(Math.PI/180))),
        $lte: parseFloat(longitude) + radius/(111.32*Math.cos(latitude*(Math.PI/180)))
      }
    });
    
    res.json({ 
      success: true, 
      data: facilities 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '주변 복지시설 조회 중 오류가 발생했습니다.',
      error: error.message 
    });
  }
};