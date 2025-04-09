import axios from 'axios';
import xml2js from 'xml2js';

const RSS_URL = 'https://www.mafra.go.kr/bbs/home/792/rssList.do?row=50';
const parser = new xml2js.Parser();

export const getMafraNews = async (req, res) => {
  try {
    const response = await axios.get(RSS_URL);
    const result = await parser.parseStringPromise(response.data);
    
    // 뉴스 항목 추출 및 정리
    const items = result.rss.channel[0].item.map(item => ({
      title: item.title[0],
      link: item.link[0],
      pubDate: item.pubDate[0],
      author: item.author[0]
    }));

    // 응답 데이터 구성
    const newsData = {
      success: true,
      data: {
        title: result.rss.channel[0].title[0],
        link: result.rss.channel[0].link[0],
        description: result.rss.channel[0].description[0],
        language: result.rss.channel[0].language[0],
        items: items
      }
    };

    res.json(newsData);
  } catch (error) {
    console.error('농림축산식품부 뉴스 가져오기 실패:', error);
    res.status(500).json({
      success: false,
      error: '농림축산식품부 뉴스를 가져오는데 실패했습니다',
      message: error.message
    });
  }
}; 