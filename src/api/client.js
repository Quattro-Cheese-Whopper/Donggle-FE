// src/api/client.js - 토큰 만료 500 에러 처리 추가
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

    // 🔍 디버깅: 요청 정보 로그
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

      // 🔍 디버깅: 응답 정보 로그
      console.log('📥 API 응답:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      // 401 인증 오류 처리
      if (response.status === 401 && !endpoint.includes('/auth/')) {
        return this.handleTokenRefresh(url, config);
      }

      if (!response.ok) {
        // 🔍 에러 응답 본문 확인
        let errorBody;
        let errorJson = null;
        try {
          errorBody = await response.text();
          console.error('❌ 에러 응답 본문:', errorBody);
          
          // JSON 파싱 시도
          try {
            errorJson = JSON.parse(errorBody);
            console.error('❌ 에러 JSON:', errorJson);
            
            // 🔧 500 에러이지만 토큰 만료 메시지인 경우 토큰 리프레시 시도
            if (response.status === 500 && 
                errorJson.message && 
                errorJson.message.includes('Token is expired') &&
                !endpoint.includes('/auth/')) {
              console.log('🔄 500 에러이지만 토큰 만료로 판단, 토큰 리프레시 시도');
              return this.handleTokenRefresh(url, config);
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
      
      // 토큰 리프레시 실패시 로그인 페이지로 리다이렉트
      console.log('➡️ 로그인 페이지로 리다이렉트');
      window.location.href = '/signin';
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