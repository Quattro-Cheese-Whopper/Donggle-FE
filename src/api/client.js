import { apiConfig } from './config';

class ApiClient {
    constructor(config) {
      this.baseURL = config.baseURL;
      this.timeout = config.timeout;
      this.headers = config.headers;
    }
  
    async request(endpoint, options = {}) {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        timeout: this.timeout,
        headers: { ...this.headers, ...options.headers },
        ...options
      };
  
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        const response = await fetch(url, {
          ...config,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error('API request failed:', error);
        throw error;
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