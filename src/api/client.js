// src/api/client.js - 정교한 토큰 리프레시 로직
import { apiConfig } from './config';
import { tokenManager } from '../utils/tokenManager';

class ApiClient {
  constructor(config) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
    this.headers = config.headers;
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const authHeader = tokenManager.getAuthHeader();
    const headers = { 
      ...this.headers, 
      ...options.headers
    };
    
    if (authHeader && !endpoint.includes('/auth/')) {
      headers.Authorization = authHeader;
    }

    const config = {
      timeout: this.timeout,
      headers,
      ...options
    };

    console.log('🔄 API 요청:', {
      url,
      method: config.method || 'GET',
      headers: config.headers,
      body: config.body
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      console.log('📥 API 응답:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      // 🔧 401 에러 처리 - 토큰이 있고 인증이 필요한 엔드포인트에서만 리프레시 시도
      if (response.status === 401 && !endpoint.includes('/auth/')) {
        return this.handleAuthError(url, config, '401 인증 실패');
      }

      if (!response.ok) {
        let errorBody;
        let errorJson = null;
        try {
          errorBody = await response.text();
          console.error('❌ 에러 응답 본문:', errorBody);
          
          try {
            errorJson = JSON.parse(errorBody);
            console.error('❌ 에러 JSON:', errorJson);
            
            // 🔧 500 에러에서 토큰 만료 메시지인 경우만 리프레시 시도
            if (response.status === 500 && 
                errorJson.message && 
                errorJson.message.includes('Token is expired') &&
                !endpoint.includes('/auth/')) {
              
              console.log('🔄 500 에러에서 토큰 만료 메시지 감지');
              return this.handleAuthError(url, config, '토큰 만료');
            }
          } catch (e) {
            console.error('❌ 에러 응답이 JSON이 아님');
          }
        } catch (e) {
          console.error('❌ 에러 응답 본문 읽기 실패');
        }
        
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody || 'No body'}`);
      }

      const responseData = await response.json();
      console.log('✅ 성공 응답 데이터:', responseData);
      return responseData;
      
    } catch (error) {
      console.error('💥 API 요청 실패:', error);
      throw error;
    }
  }

  // 🔧 인증 에러 처리 통합 함수
  async handleAuthError(originalUrl, originalConfig, reason) {
    const hasAccessToken = !!tokenManager.getAccessToken();
    const hasRefreshToken = !!tokenManager.getRefreshToken();
    
    console.log('🔍 토큰 상태 확인:', {
      hasAccessToken,
      hasRefreshToken,
      reason
    });

    // 1. 토큰이 있고 리프레시 토큰도 있는 경우 -> 토큰 리프레시 시도
    if (hasAccessToken && hasRefreshToken) {
      console.log('🔄 토큰이 존재하므로 리프레시 시도');
      try {
        return await this.handleTokenRefresh(originalUrl, originalConfig);
      } catch (refreshError) {
        console.error('❌ 토큰 리프레시 실패:', refreshError);
        // 리프레시 실패 시 토큰 정리하고 로그인으로 리다이렉트
        tokenManager.clearTokens();
        console.log('➡️ 토큰 리프레시 실패로 로그인 페이지로 리다이렉트');
        window.location.href = '/signin';
        throw refreshError;
      }
    }
    
    // 2. 토큰이 없거나 리프레시 토큰이 없는 경우
    if (!hasAccessToken) {
      console.log('⚠️ 액세스 토큰이 없음 - 리프레시하지 않음');
    } else if (!hasRefreshToken) {
      console.log('⚠️ 리프레시 토큰이 없음 - 리프레시 불가능');
      tokenManager.clearTokens(); // 불완전한 토큰 상태 정리
    }
    
    // 토큰이 없는 상태에서는 리다이렉트하지 않고 에러만 throw
    throw new Error(`인증이 필요합니다. ${reason}`);
  }

  async handleTokenRefresh(originalUrl, originalConfig) {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      }).then(() => {
        const authHeader = tokenManager.getAuthHeader();
        if (authHeader) {
          originalConfig.headers.Authorization = authHeader;
        }
        return fetch(originalUrl, originalConfig).then(res => res.json());
      });
    }

    this.isRefreshing = true;

    try {
      console.log('🔄 토큰 리프레시 시도...');
      
      // 리프레시 토큰 재확인
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('리프레시 토큰이 없습니다.');
      }
      
      const { authService } = await import('./services/authService');
      await authService.refreshToken();
      
      console.log('✅ 토큰 리프레시 성공');
      this.processQueue(null);
      
      const authHeader = tokenManager.getAuthHeader();
      if (authHeader) {
        originalConfig.headers.Authorization = authHeader;
      }
      
      console.log('🔄 원래 요청 재시도...');
      const response = await fetch(originalUrl, originalConfig);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ 토큰 리프레시 실패:', error);
      this.processQueue(error, null);
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(apiConfig);