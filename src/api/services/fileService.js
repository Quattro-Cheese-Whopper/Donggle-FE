// src/api/services/fileService.js
import { apiClient } from '../client';

export const fileService = {
  // 파일 정보 조회
  getFileInfo: async (fileId) => {
    try {
      const response = await apiClient.get(`/files/${fileId}`);
      return response;
    } catch (error) {
      console.error('파일 정보 조회 실패:', error);
      throw error;
    }
  },

  // 파일 다운로드 URL 생성
  getDownloadUrl: (storedName) => {
    const url = `${apiClient.baseURL}/files/download/${storedName}`;
    console.log('🔗 생성된 다운로드 URL:', url);
    return url;
  },

  // 동아리 ID로 이미지 URL 가져오기 (두 단계 결합)
  getClubImageUrl: async (clubId) => {
    try {
      console.log('🔍 동아리 이미지 로드 시작:', clubId);
      const fileInfo = await fileService.getFileInfo(clubId);
      console.log('📄 파일 정보:', fileInfo);
      
      if (!fileInfo || !fileInfo.downloadUrl) {
        console.warn('⚠️ 파일 정보가 없거나 downloadUrl이 없음');
        return null;
      }
      
      // downloadUrl에서 storedName 추출
      const downloadUrl = fileInfo.downloadUrl;
      const storedName = downloadUrl.split('/').pop(); // 마지막 부분이 storedName
      console.log('🔗 추출된 storedName:', storedName);
      
      const finalUrl = fileService.getDownloadUrl(storedName);
      console.log('✅ 최종 이미지 URL:', finalUrl);
      
      return finalUrl;
    } catch (error) {
      console.error('❌ 동아리 이미지 URL 생성 실패:', error);
      return null;
    }
  }
};