// src/hooks/useClubImage.js
import { useState, useEffect } from 'react';
import { fileService } from '../api/services/fileService';

export const useClubImage = (clubId) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadImage = async () => {
      if (!clubId) {
        console.log('🚫 clubId가 없음');
        setLoading(false);
        return;
      }

      try {
        console.log('🚀 이미지 로드 시작 - clubId:', clubId);
        setLoading(true);
        const url = await fileService.getClubImageUrl(clubId);
        console.log('🖼️ 최종 이미지 URL:', url);
        setImageUrl(url);
        setError(null);
      } catch (err) {
        console.error('❌ 이미지 로드 실패:', err);
        setError(err);
        setImageUrl(null);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [clubId]);

  return { imageUrl, loading, error };
};