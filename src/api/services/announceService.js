import { apiClient } from "../client";

export const announceService = {
  // 타입별 최근 공지사항 조회 (홈 화면용)
  getRecentAnnouncesByType: async (type) => {
    try {
      console.log(`📢 ${type} 타입 최근 공지사항 조회 시작`);

      const response = await apiClient.get(`/announces/recent/type/${type}`);

      console.log(`✅ ${type} 타입 최근 공지사항 조회 성공:`, response);

      return response;
    } catch (error) {
      console.error(`❌ ${type} 타입 최근 공지사항 조회 실패:`, error);
      throw error;
    }
  },

  // 동아리별 최근 공지사항 조회
  getRecentAnnouncesByClub: async (clubId) => {
    try {
      console.log(`📢 동아리 ${clubId} 최근 공지사항 조회 시작`);

      const response = await apiClient.get(`/announces/recent/clubs/${clubId}`);

      console.log(`✅ 동아리 ${clubId} 최근 공지사항 조회 성공:`, response);

      return response;
    } catch (error) {
      console.error(`❌ 동아리 ${clubId} 최근 공지사항 조회 실패:`, error);
      throw error;
    }
  },

  // 공지사항 상세 조회
  getAnnounce: async (announceId) => {
    try {
      console.log(`📢 공지사항 ${announceId} 상세 조회 시작`);

      const response = await apiClient.get(`/announces/${announceId}`);

      console.log(`✅ 공지사항 ${announceId} 상세 조회 성공:`, response);

      return response;
    } catch (error) {
      console.error(`❌ 공지사항 ${announceId} 상세 조회 실패:`, error);
      throw error;
    }
  },

  // 일반 공지사항 생성 (관리자용)
  createGeneralAnnounce: async (announceData) => {
    try {
      console.log("📢 일반 공지사항 생성 시작:", announceData);

      const response = await apiClient.post("/announces", announceData);

      console.log("✅ 일반 공지사항 생성 성공:", response);

      return response;
    } catch (error) {
      console.error("❌ 일반 공지사항 생성 실패:", error);
      throw error;
    }
  },

  // 동아리 공지사항 생성
  createClubAnnounce: async (clubId, announceData) => {
    try {
      console.log(`📢 동아리 ${clubId} 공지사항 생성 시작:`, announceData);

      const response = await apiClient.post(
        `/announces/clubs/${clubId}`,
        announceData
      );

      console.log(`✅ 동아리 ${clubId} 공지사항 생성 성공:`, response);

      return response;
    } catch (error) {
      console.error(`❌ 동아리 ${clubId} 공지사항 생성 실패:`, error);
      throw error;
    }
  },

  // 공지사항 수정
  updateAnnounce: async (announceId, announceData) => {
    try {
      console.log(`📢 공지사항 ${announceId} 수정 시작:`, announceData);

      const response = await apiClient.put(
        `/announces/${announceId}`,
        announceData
      );

      console.log(`✅ 공지사항 ${announceId} 수정 성공:`, response);

      return response;
    } catch (error) {
      console.error(`❌ 공지사항 ${announceId} 수정 실패:`, error);
      throw error;
    }
  },

  // 공지사항 삭제
  deleteAnnounce: async (announceId) => {
    try {
      console.log(`📢 공지사항 ${announceId} 삭제 시작`);

      const response = await apiClient.delete(`/announces/${announceId}`);

      console.log(`✅ 공지사항 ${announceId} 삭제 성공:`, response);

      return response;
    } catch (error) {
      console.error(`❌ 공지사항 ${announceId} 삭제 실패:`, error);
      throw error;
    }
  },
};
