// src/hooks/useClubImage.js
import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export const useClubImage = (profileImageName) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      if (!profileImageName) {
        setImageUrl(null);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log(`🖼️ 이미지 다운로드 시작: ${profileImageName}`);
        
        // 이미지 파일 다운로드 API 호출
        const response = await fetch(`${apiClient.baseURL}/files/download/${profileImageName}`, {
          method: 'GET',
          headers: {
            'Authorization': localStorage.getItem('accessToken') ? 
              `Bearer ${localStorage.getItem('accessToken')}` : ''
          }
        });

        if (!response.ok) {
          throw new Error(`이미지 다운로드 실패: ${response.status}`);
        }

        // Blob으로 이미지 데이터 받기
        const blob = await response.blob();
        
        // Blob을 URL로 변환
        const objectUrl = URL.createObjectURL(blob);
        
        console.log(`✅ 이미지 다운로드 완료: ${profileImageName}`);
        setImageUrl(objectUrl);

      } catch (err) {
        console.error('이미지 다운로드 에러:', err);
        setError(err.message);
        setImageUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();

    // cleanup: 컴포넌트 언마운트시 객체 URL 해제
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [profileImageName]);

  return { imageUrl, loading, error };
};