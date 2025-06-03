// src/utils/categoryMapper.js
// 카테고리 영어 → 한국어 매핑
export const CATEGORY_MAP = {
    'ACADEMIC': '학술분과',
    'CULTURE': '문예분과',
    'SPORTS': '체육분과',
    'VOLUNTEER': '봉사분과',
    'RELIGION': '종교분과',
    'OTHER': '기타',
  };
  
  // 역방향 매핑 (한국어 → 영어) - API 호출할 때 사용
  export const REVERSE_CATEGORY_MAP = Object.fromEntries(
    Object.entries(CATEGORY_MAP).map(([key, value]) => [value, key])
  );
  
  /**
   * 영어 카테고리를 한국어로 변환
   * @param {string} englishCategory - 영어 카테고리
   * @returns {string} 한국어 카테고리
   */
  export const mapCategoryToKorean = (englishCategory) => {
    return CATEGORY_MAP[englishCategory] || englishCategory;
  };
  
  /**
   * 한국어 카테고리를 영어로 변환
   * @param {string} koreanCategory - 한국어 카테고리  
   * @returns {string} 영어 카테고리
   */
  export const mapCategoryToEnglish = (koreanCategory) => {
    return REVERSE_CATEGORY_MAP[koreanCategory] || koreanCategory;
  };
  
  /**
   * 동아리 객체의 카테고리를 한국어로 변환
   * @param {Object} club - 동아리 객체
   * @returns {Object} 카테고리가 변환된 동아리 객체
   */
  export const transformClubCategory = (club) => {
    return {
      ...club,
      category: mapCategoryToKorean(club.category)
    };
  };
  
  /**
   * 동아리 배열의 모든 카테고리를 한국어로 변환
   * @param {Array} clubs - 동아리 배열
   * @returns {Array} 카테고리가 변환된 동아리 배열
   */
  export const transformClubsCategories = (clubs) => {
    if (!Array.isArray(clubs)) return [];
    return clubs.map(transformClubCategory);
  };