// src/hooks/useAuth.js
import { useState, useEffect, useRef } from 'react';
import { authService } from '../api/services/authService';
import { clubService } from '../api/services/clubService';
import { tokenManager } from '../utils/tokenManager';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [myClubs, setMyClubs] = useState([]);
  const [myClubIds, setMyClubIds] = useState([]);
  
  // 🔧 중복 호출 방지를 위한 ref
  const isInitialized = useRef(false);
  const isFetchingClubs = useRef(false);

  // 내 동아리 정보 가져오기
  const fetchMyClubs = async () => {
    // 🔧 이미 요청 중이면 중복 호출 방지
    if (isFetchingClubs.current) {
      console.log('🚫 이미 내 동아리 정보 조회 중 - 중복 호출 방지');
      return;
    }

    // 로그인되어 있지 않으면 조회하지 않음
    if (!isLoggedIn) {
      console.log('🚫 로그인되지 않음 - 내 동아리 조회 안함');
      return;
    }

    isFetchingClubs.current = true;
    
    try {
      console.log('🏢 내 동아리 정보 조회 시작...');
      const response = await clubService.getMyClubs();
      const clubs = response.data || response || [];
      
      console.log('🏢 내 동아리 정보:', clubs);
      setMyClubs(clubs);
      
      // ID만 추출해서 저장
      const clubIds = clubs.map(club => club.id);
      setMyClubIds(clubIds);
      console.log('🏢 내 동아리 ID들:', clubIds);
      
    } catch (error) {
      console.error('❌ 내 동아리 조회 실패:', error);
      setMyClubs([]);
      setMyClubIds([]);
    } finally {
      isFetchingClubs.current = false;
    }
  };

  // 🔧 초기 로그인 상태만 확인 (내 동아리 정보 자동 조회 제거)
  useEffect(() => {
    if (isInitialized.current) {
      return;
    }

    const checkAuthStatus = () => {
      console.log('🔐 인증 상태 확인 시작...');
      const loggedIn = authService.isLoggedIn();
      setIsLoggedIn(loggedIn);
      setIsLoading(false);
      isInitialized.current = true;
      console.log('✅ 인증 상태 확인 완료 - 로그인:', loggedIn);
    };

    checkAuthStatus();
  }, []); // 빈 의존성 배열

  // 로그인
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      setIsLoggedIn(true);
      
      // 🔧 로그인 시에도 자동으로 내 동아리 정보 가져오지 않음
      // 필요한 페이지에서 fetchMyClubs() 직접 호출
      
      return response;
    } catch (error) {
      setIsLoggedIn(false);
      setUser(null);
      setMyClubs([]);
      setMyClubIds([]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 회원가입
  const signup = async (userData) => {
    try {
      setIsLoading(true);
      const response = await authService.signup(userData);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    } finally {
      setIsLoggedIn(false);
      setUser(null);
      setMyClubs([]);
      setMyClubIds([]);
      setIsLoading(false);
      isInitialized.current = false;
      isFetchingClubs.current = false;
    }
  };

  // 특정 동아리를 내가 관리하는지 확인하는 헬퍼 함수
  const isMyClub = (clubId) => {
    return myClubIds.includes(clubId);
  };

  return {
    isLoggedIn,
    isLoading,
    user,
    myClubs,
    myClubIds,
    isMyClub,
    login,
    signup,
    logout,
    fetchMyClubs // 🔧 필요한 페이지에서 직접 호출
  };
};