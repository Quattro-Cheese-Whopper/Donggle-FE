// src/hooks/useClubs.js
import { useState, useEffect, useCallback } from 'react';
import { clubService } from '../api/services/clubService';
import { transformClubsCategories, mapCategoryToEnglish } from '../utils/categoryMapper';

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

  // 🔧 카테고리별 필터링 시 영어로 변환해서 API 호출
  const filterByCategory = useCallback(async (category) => {
    if (category === '전체') {
      await fetchClubs();
    } else {
      setError(null);
      try {
        // 한국어 카테고리를 영어로 변환해서 API 호출
        const englishCategory = mapCategoryToEnglish(category);
        
        const response = await clubService.getClubsByCategory(englishCategory);
        const rawClubsData = response.data || response.content || response;
        
        // 응답 받은 데이터도 한국어로 변환
        const transformedClubs = transformClubsCategories(rawClubsData);
        setClubs(transformedClubs);
      } catch (err) {
        setError(err.message);
        setClubs([]);
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