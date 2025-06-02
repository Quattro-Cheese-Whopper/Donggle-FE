// src/utils/tokenManager.js
const TOKEN_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    TOKEN_TYPE: 'tokenType'
  };
  
  export const tokenManager = {
    // 토큰 저장
    setTokens: (tokenData) => {
      localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokenData.accessToken);
      localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokenData.refreshToken);
      localStorage.setItem(TOKEN_KEYS.TOKEN_TYPE, tokenData.tokenType);
    },
  
    // 액세스 토큰 가져오기
    getAccessToken: () => {
      return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    },
  
    // 리프레시 토큰 가져오기
    getRefreshToken: () => {
      return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
    },
  
    // 토큰 타입 가져오기
    getTokenType: () => {
      return localStorage.getItem(TOKEN_KEYS.TOKEN_TYPE) || 'Bearer';
    },
  
    // Authorization 헤더 생성
    getAuthHeader: () => {
      const accessToken = tokenManager.getAccessToken();
      const tokenType = tokenManager.getTokenType();
      return accessToken ? `${tokenType} ${accessToken}` : null;
    },
  
    // 모든 토큰 삭제
    clearTokens: () => {
      localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(TOKEN_KEYS.TOKEN_TYPE);
    },
  
    // 토큰 존재 여부 확인
    hasValidTokens: () => {
      return !!(tokenManager.getAccessToken() && tokenManager.getRefreshToken());
    }
  };