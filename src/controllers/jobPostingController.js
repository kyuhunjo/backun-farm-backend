import JobPosting from '../models/JobPosting.js';

// 모든 일손모집 공고 조회
export const getAllJobPostings = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    
    const jobPostings = await JobPosting.find(query)
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: jobPostings,
      count: jobPostings.length
    });
  } catch (error) {
    console.error('일손모집 공고 조회 에러:', error);
    res.status(500).json({
      success: false,
      error: '일손모집 공고 조회 중 오류가 발생했습니다.'
    });
  }
};

// 특정 일손모집 공고 조회
export const getJobPosting = async (req, res) => {
  try {
    const jobPosting = await JobPosting.findById(req.params.id);
    if (!jobPosting) {
      return res.status(404).json({
        success: false,
        error: '해당 일손모집 공고를 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      data: jobPosting
    });
  } catch (error) {
    console.error('일손모집 공고 조회 에러:', error);
    res.status(500).json({
      success: false,
      error: '일손모집 공고 조회 중 오류가 발생했습니다.'
    });
  }
};

// 일손모집 공고 생성
export const createJobPosting = async (req, res) => {
  try {
    const jobPosting = new JobPosting(req.body);
    await jobPosting.save();
    
    res.status(201).json({
      success: true,
      data: jobPosting
    });
  } catch (error) {
    console.error('일손모집 공고 생성 에러:', error);
    res.status(400).json({
      success: false,
      error: error.message || '일손모집 공고 생성 중 오류가 발생했습니다.'
    });
  }
};

// 일손모집 공고 수정
export const updateJobPosting = async (req, res) => {
  try {
    const jobPosting = await JobPosting.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!jobPosting) {
      return res.status(404).json({
        success: false,
        error: '해당 일손모집 공고를 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      data: jobPosting
    });
  } catch (error) {
    console.error('일손모집 공고 수정 에러:', error);
    res.status(400).json({
      success: false,
      error: error.message || '일손모집 공고 수정 중 오류가 발생했습니다.'
    });
  }
};

// 일손모집 공고 삭제
export const deleteJobPosting = async (req, res) => {
  try {
    const jobPosting = await JobPosting.findByIdAndDelete(req.params.id);
    
    if (!jobPosting) {
      return res.status(404).json({
        success: false,
        error: '해당 일손모집 공고를 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      message: '일손모집 공고가 삭제되었습니다.'
    });
  } catch (error) {
    console.error('일손모집 공고 삭제 에러:', error);
    res.status(500).json({
      success: false,
      error: '일손모집 공고 삭제 중 오류가 발생했습니다.'
    });
  }
};

// 모집 상태 변경
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['모집중', '모집완료', '기간만료'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: '잘못된 상태값입니다.'
      });
    }
    
    const jobPosting = await JobPosting.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!jobPosting) {
      return res.status(404).json({
        success: false,
        error: '해당 일손모집 공고를 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      data: jobPosting
    });
  } catch (error) {
    console.error('상태 변경 에러:', error);
    res.status(500).json({
      success: false,
      error: '상태 변경 중 오류가 발생했습니다.'
    });
  }
}; 