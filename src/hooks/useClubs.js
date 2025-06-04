// src/hooks/useClubs.js
import { useState, useEffect, useCallback } from 'react';
import { clubService } from '../api/services/clubService';
import { transformClubsCategories } from '../utils/categoryMapper';

export const useClubs = (type = 'central') => {
  const [clubs, setClubs] = useState([]);
  const [categories, setCategories] = useState(['전체']);
  const [error, setError] = useState(null);

  // 동아리 목록 가져오기
  const fetchClubs = useCallback(async (params = {}) => {
    setError(null);
    
    try {
      let response;
      if (type === 'all') {
        response = await clubService.getAllClubs(params);
      } else {
        response = await clubService.getClubsByType(type, params);
      }
      
      const rawClubsData = response.data || response.content || response;
      
      // 🔄 카테고리 변환 적용
      const transformedClubs = transformClubsCategories(rawClubsData);
      
      setClubs(transformedClubs);
      
      if (transformedClubs && transformedClubs.length > 0) {
        generateCategories(transformedClubs);
      }
    } catch (err) {
      console.error('API 에러:', err);
      setError(err.message);
      setClubs([]);
    }
  }, [type]);

  // 카테고리 목록 생성 (이미 한국어로 변환된 상태)
  const generateCategories = useCallback((clubsData) => {
    const uniqueCategories = [...new Set(clubsData.map(club => club.category))].filter(Boolean);
    const finalCategories = ['전체', ...uniqueCategories];
    setCategories(finalCategories);
  }, []);

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  const getFilteredClubs = useCallback((selectedCategory) => {
    if (selectedCategory === '전체') {
      return clubs;
    }
    return clubs.filter(club => club.category === selectedCategory);
  }, [clubs]);

  // 🔧 카테고리별 필터링 - 한글 그대로 API 호출
  const filterByCategory = useCallback(async (category) => {
    if (category === '전체') {
      await fetchClubs();
    } else {
      setError(null);
      try {
        console.log(`🔍 카테고리별 조회: ${category}`);
        
        // 한글 카테고리를 그대로 API에 전달
        const response = await clubService.getClubsByCategory(category);
        const rawClubsData = response.data || response.content || response;
        
        // 응답 받은 데이터는 이미 한글이므로 변환 불필요할 수도 있음
        const transformedClubs = transformClubsCategories(rawClubsData);
        setClubs(transformedClubs);
      } catch (err) {
        console.error('카테고리 필터링 에러:', err);
        
        // 카테고리 API 호출이 실패하면 클라이언트에서 필터링
        console.log('🔄 서버 필터링 실패, 클라이언트에서 필터링 수행');
        setError(null);
        
        // 전체 목록을 다시 가져와서 클라이언트에서 필터링
        await fetchClubs();
      }
    }
  }, [fetchClubs]);

  return {
    clubs,
    categories,
    error,
    fetchClubs,
    getFilteredClubs,
    filterByCategory,
    refetch: fetchClubs
  };
};