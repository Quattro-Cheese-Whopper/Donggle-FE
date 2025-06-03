// src/api/client.js - 디버깅 버전
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

      if (response.status === 401 && !endpoint.includes('/auth/')) {
        return this.handleTokenRefresh(url, config);
      }

      if (!response.ok) {
        // 🔍 에러 응답 본문 확인
        let errorBody;
        try {
          errorBody = await response.text();
          console.error('❌ 에러 응답 본문:', errorBody);
          
          // JSON 파싱 시도
          try {
            const errorJson = JSON.parse(errorBody);
            console.error('❌ 에러 JSON:', errorJson);
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
      const { authService } = await import('./services/authService');
      await authService.refreshToken();
      
      this.processQueue(null);
      
      const authHeader = tokenManager.getAuthHeader();
      if (authHeader) {
        originalConfig.headers.Authorization = authHeader;
      }
      
      const response = await fetch(originalUrl, originalConfig);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      this.processQueue(error, null);
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