import { apiClient } from "../client";

// AI 챗봇 상태 확인
export const getChatHealth = () => {
  return apiClient.get("/ai/chat/health");
};

// AI 챗봇과 대화
export const sendChatMessage = ({ message, chatId, isNewChat }) => {
  return apiClient.post("/ai/chat", {
    message,
    ...(chatId ? { chatId } : {}),
    ...(isNewChat !== undefined ? { isNewChat } : {}),
  });
};

// 채팅 메모리 초기화
export const clearChatMemory = (chatId) => {
  return apiClient.delete(`/ai/chat/${chatId}/memory`);
};
