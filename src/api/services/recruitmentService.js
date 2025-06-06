// src/api/services/recruitmentService.js
import { apiClient } from '../client';

export const recruitmentService = {
  // 동아리별 모집공고 조회
  getClubRecruitments: async (clubId) => {
    try {
      const response = await apiClient.get(`/recruitments/clubs/${clubId}`);
      return response;
    } catch (error) {
      console.error('동아리 모집공고 조회 실패:', error);
      throw error;
    }
  },

  // 모집공고 상세 정보 조회
  getRecruitmentDetail: async (recruitmentId) => {
    try {
      const response = await apiClient.get(`/recruitments/${recruitmentId}`);
      return response;
    } catch (error) {
      console.error('모집공고 상세 정보 조회 실패:', error);
      throw error;
    }
  },

  // 🔧 특정 동아리에 대한 모집공고 생성
  createRecruitmentForClub: async (clubId, recruitmentData) => {
    try {
      console.log(`📝 동아리 ${clubId}에 대한 모집공고 생성:`, recruitmentData);
      const response = await apiClient.post(`/recruitments/clubs/${clubId}`, recruitmentData);
      console.log('✅ 모집공고 생성 성공:', response);
      return response;
    } catch (error) {
      console.error('동아리 모집공고 생성 실패:', error);
      throw error;
    }
  },

  // 모집공고 생성 (기존 일반 생성 API)
  createRecruitment: async (recruitmentData) => {
    try {
      const response = await apiClient.post('/recruitments', recruitmentData);
      return response;
    } catch (error) {
      console.error('모집공고 생성 실패:', error);
      throw error;
    }
  },

  // 모집공고 수정
  updateRecruitment: async (recruitmentId, recruitmentData) => {
    try {
      const response = await apiClient.put(`/recruitments/${recruitmentId}`, recruitmentData);
      return response;
    } catch (error) {
      console.error('모집공고 수정 실패:', error);
      throw error;
    }
  },

  // 모집공고 삭제
  deleteRecruitment: async (recruitmentId) => {
    try {
      const response = await apiClient.delete(`/recruitments/${recruitmentId}`);
      return response;
    } catch (error) {
      console.error('모집공고 삭제 실패:', error);
      throw error;
    }
  }
};