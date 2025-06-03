// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { authService } from '../api/services/authService';
import { tokenManager } from '../utils/tokenManager';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // 초기 로그인 상태 확인
  useEffect(() => {
    const checkAuthStatus = () => {
      const loggedIn = authService.isLoggedIn();
      setIsLoggedIn(loggedIn);
      setIsLoading(false);
      
      // TODO: 사용자 정보 API 호출
      // if (loggedIn) {
      //   fetchUserProfile();
      // }
    };

    checkAuthStatus();
  }, []);

  // 로그인
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      setIsLoggedIn(true);
      // TODO: 사용자 정보 설정
      // setUser(response.user);
      
      return response;
    } catch (error) {
      setIsLoggedIn(false);
      setUser(null);
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
      setIsLoading(false);
    }
  };

  return {
    isLoggedIn,
    isLoading,
    user,
    login,
    signup,
    logout
  };
};