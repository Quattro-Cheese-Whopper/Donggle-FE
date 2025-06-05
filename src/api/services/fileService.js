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

  // 🔧 이미지 파일 업로드 (동아리용)
  uploadFile: async (file, fileType = 'ANNOUNCE_ATTACHMENT', relatedId) => {
    try {
      console.log('📤 파일 업로드 시작:', {
        fileName: file.name,
        fileSize: file.size,
        fileType,
        relatedId
      });

      const formData = new FormData();
      formData.append('file', file);

      // fetch를 직접 사용 (FormData는 Content-Type을 자동 설정)
      const response = await fetch(`${apiClient.baseURL}/files/upload/${fileType}/${relatedId}`, {
        method: 'POST',
        headers: {
          'Authorization': localStorage.getItem('accessToken') ? 
            `Bearer ${localStorage.getItem('accessToken')}` : ''
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`파일 업로드 실패: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ 파일 업로드 성공:', result);
      
      return result;
    } catch (error) {
      console.error('❌ 파일 업로드 실패:', error);
      throw error;
    }
  },

  // 🔧 Base64 이미지를 Blob으로 변환하여 업로드
  uploadBase64Image: async (base64Data, fileName, fileType = 'ANNOUNCE_ATTACHMENT', relatedId) => {
    try {
      // Base64 데이터에서 실제 데이터 부분만 추출
      const base64WithoutPrefix = base64Data.split(',')[1];
      const mimeType = base64Data.split(',')[0].split(':')[1].split(';')[0];
      
      // Base64를 Blob으로 변환
      const byteCharacters = atob(base64WithoutPrefix);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      
      // File 객체 생성
      const file = new File([blob], fileName, { type: mimeType });
      
      // 업로드 수행
      return await fileService.uploadFile(file, fileType, relatedId);
    } catch (error) {
      console.error('❌ Base64 이미지 업로드 실패:', error);
      throw error;
    }
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