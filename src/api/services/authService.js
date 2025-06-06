// src/api/services/authService.js - 수정된 버전
import { apiClient } from '../client';
import { tokenManager } from '../../utils/tokenManager';

export const authService = {
  // 로그인
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      
      // 토큰 저장
      if (response.accessToken) {
        tokenManager.setTokens(response);
      }
      
      return response;
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    }
  },

  // 🔧 회원가입 - apiClient 사용하도록 수정
  signup: async (userData) => {
    try {
      console.log('🚀 authService.signup 시작');
      console.log('📤 전송할 데이터:', userData);
      
      const response = await apiClient.post('/auth/signup', userData);
      
      console.log('✅ 회원가입 성공:', response);
      return response || { success: true, message: '회원가입이 완료되었습니다.' };
      
    } catch (error) {
      console.error('💥 authService.signup 에러:', error);
      throw error;
    }
  },

  // 토큰 갱신
  refreshToken: async () => {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('리프레시 토큰이 없습니다.');
      }

      const response = await apiClient.post('/auth/refresh', {
        refreshToken: refreshToken
      });

      // 새 토큰 저장
      if (response.accessToken) {
        tokenManager.setTokens(response);
      }

      return response;
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      // 토큰 갱신 실패 시 모든 토큰 삭제
      tokenManager.clearTokens();
      throw error;
    }
  },

  // 로그아웃
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('로그아웃 API 호출 실패:', error);
    } finally {
      // API 실패 여부와 관계없이 로컬 토큰 삭제
      tokenManager.clearTokens();
    }
  },

  // 로그인 상태 확인
  isLoggedIn: () => {
    return tokenManager.hasValidTokens();
  }
};