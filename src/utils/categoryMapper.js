// src/utils/categoryMapper.js
// 카테고리 영어 → 한국어 매핑 (백엔드 enum과 정확히 일치시켜야 함)
export const CATEGORY_MAP = {
    'ACADEMIC': '학술분과',
    'CULTURE': '문예분과', 
    'SPORTS': '체육분과',
    'VOLUNTEER': '봉사분과',
    'RELIGION': '종교분과',
    'OTHER': '기타',
    // 백엔드에서 사용할 수 있는 다른 enum 값들 추가
    'ACADEMIC_RESEARCH': '학술분과',
    'CULTURAL': '문예분과',
    'SPORT': '체육분과',
    'SERVICE': '봉사분과',
    'RELIGIOUS': '종교분과',
  };
  
  // 역방향 매핑 (한국어 → 영어) - API 호출할 때 사용
  // 다양한 가능성을 시도해보기 위한 매핑
  export const REVERSE_CATEGORY_MAP = {
    '학술분과': 'ACADEMIC',
    '문예분과': 'CULTURE', 
    '체육분과': 'SPORTS',
    '봉사분과': 'VOLUNTEER',
    '종교분과': 'RELIGION',
    '기타': 'OTHER'
  };

  // 백엔드에서 사용할 수 있는 다른 enum 값들
  export const ALTERNATIVE_CATEGORY_MAP = {
    '학술분과': ['ACADEMIC', 'STUDY', 'RESEARCH', 'EDUCATION'],
    '문예분과': ['CULTURE', 'CULTURAL', 'ART', 'ARTS'],
    '체육분과': ['SPORTS', 'SPORT', 'PHYSICAL', 'FITNESS'],
    '봉사분과': ['VOLUNTEER', 'SERVICE', 'COMMUNITY'],
    '종교분과': ['RELIGION', 'RELIGIOUS', 'FAITH'],
    '기타': ['OTHER', 'ETC', 'MISC']
  };
  
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
    const englishCategory = REVERSE_CATEGORY_MAP[koreanCategory];
    console.log(`🔄 카테고리 변환: ${koreanCategory} → ${englishCategory}`);
    return englishCategory || koreanCategory;
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