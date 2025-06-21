// src/api/services/authService.js - 디버깅 강화 버전
import { apiClient } from "../client";
import { tokenManager } from "../../utils/tokenManager";

export const authService = {
  // 로그인
  login: async (credentials) => {
    try {
      const response = await apiClient.post("/auth/login", credentials);

      // 토큰 저장
      if (response.accessToken) {
        tokenManager.setTokens(response);
      }

      return response;
    } catch (error) {
      console.error("로그인 실패:", error);
      throw error;
    }
  },

  // 회원가입
  signup: async (userData) => {
    console.log("🚀 authService.signup 시작");
    console.log("📤 전송할 데이터:", userData);

    try {
      console.log("📡 fetch 요청 시작...");

      const response = await fetch(
        "http://quattro-cheese.duckdns.org:8080/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      console.log("📥 응답 상태:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ 에러 응답:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorText}`
        );
      }

      // 🔧 빈 응답 처리
      const responseText = await response.text();
      console.log("📄 응답 본문:", responseText);

      if (!responseText || responseText.trim() === "") {
        console.log("✅ 빈 응답 - 회원가입 성공");
        return { success: true, message: "회원가입이 완료되었습니다." };
      }

      try {
        const responseData = JSON.parse(responseText);
        console.log("✅ JSON 응답:", responseData);
        return responseData;
      } catch (jsonError) {
        console.log("⚠️ JSON 파싱 실패하지만 성공으로 처리");
        return { success: true, message: "회원가입이 완료되었습니다." };
      }
    } catch (error) {
      console.error("💥 authService.signup 에러:", error);
      throw error;
    }
  },

  // 토큰 갱신
  refreshToken: async () => {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error("리프레시 토큰이 없습니다.");
      }

      const response = await apiClient.post("/auth/refresh", {
        refreshToken: refreshToken,
      });

      // 새 토큰 저장
      if (response.accessToken) {
        tokenManager.setTokens(response);
      }

      return response;
    } catch (error) {
      console.error("토큰 갱신 실패:", error);
      // 토큰 갱신 실패 시 모든 토큰 삭제
      tokenManager.clearTokens();
      throw error;
    }
  },

  // 로그아웃
  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("로그아웃 API 호출 실패:", error);
    } finally {
      // API 실패 여부와 관계없이 로컬 토큰 삭제
      tokenManager.clearTokens();
    }
  },

  // 로그인 상태 확인
  isLoggedIn: () => {
    return tokenManager.hasValidTokens();
  },

  // 내 프로필 조회
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get("/users/me");
      return response;
    } catch (error) {
      console.error("내 프로필 조회 실패:", error);
      throw error;
    }
  },
};
