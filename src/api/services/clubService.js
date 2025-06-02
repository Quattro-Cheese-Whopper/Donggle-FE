import { apiClient } from '../client';

export const clubService = {
  // 전체 동아리 목록 조회
  getAllClubs: async (params = {}) => {
    try {
      const response = await apiClient.get('/clubs', params);
      return response;
    } catch (error) {
      console.error('전체 동아리 조회 실패:', error);
      throw error;
    }
  },

  // 동아리 타입별 조회 (중앙/학과)
  getClubsByType: async (type, params = {}) => {
    try {
      const response = await apiClient.get(`/clubs/type/${type}`, params);
      console.log(response);
      return response;
    } catch (error) {
      console.error(`${type} 동아리 조회 실패:`, error);
      throw error;
    }
  },

  // 동아리 카테고리별 조회
  getClubsByCategory: async (category, params = {}) => {
    try {
      const response = await apiClient.get(`/clubs/category/${category}`, params);
      return response;
    } catch (error) {
      console.error('카테고리별 동아리 조회 실패:', error);
      throw error;
    }
  },

  // 동아리 필터링 조회
  getFilteredClubs: async (filterParams = {}) => {
    try {
      const response = await apiClient.get('/clubs/filter', filterParams);
      return response;
    } catch (error) {
      console.error('동아리 필터링 조회 실패:', error);
      throw error;
    }
  },

  // 특정 동아리 상세 정보 조회
  getClubDetail: async (clubId) => {
    try {
      const response = await apiClient.get(`/clubs/${clubId}`);
      return response;
    } catch (error) {
      console.error('동아리 상세 정보 조회 실패:', error);
      throw error;
    }
  },

  // 동아리 검색
  searchClubs: async (searchParams) => {
    try {
      const response = await apiClient.get('/clubs/search', searchParams);
      return response;
    } catch (error) {
      console.error('동아리 검색 실패:', error);
      throw error;
    }
  },

  // 내가 관리하는 동아리 목록 조회
  getMyClubs: async () => {
    try {
      const response = await apiClient.get('/clubs/my-clubs');
      return response;
    } catch (error) {
      console.error('내 동아리 조회 실패:', error);
      throw error;
    }
  },

  // 동아리 생성
  createClub: async (clubData) => {
    try {
      const response = await apiClient.post('/clubs', clubData);
      return response;
    } catch (error) {
      console.error('동아리 생성 실패:', error);
      throw error;
    }
  },

  // 동아리 수정
  updateClub: async (clubId, clubData) => {
    try {
      const response = await apiClient.put(`/clubs/${clubId}`, clubData);
      return response;
    } catch (error) {
      console.error('동아리 수정 실패:', error);
      throw error;
    }
  },

  // 동아리 삭제
  deleteClub: async (clubId) => {
    try {
      const response = await apiClient.delete(`/clubs/${clubId}`);
      return response;
    } catch (error) {
      console.error('동아리 삭제 실패:', error);
      throw error;
    }
  }
};