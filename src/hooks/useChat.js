import { useState, useRef } from "react";
import {
  getChatHealth,
  sendChatMessage,
  clearChatMemory,
} from "../api/services/chatService";

export default function useChat() {
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]); // {role: 'user'|'ai', content: string}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isActive = useRef(false);

  // AI 서버 상태 확인
  const checkHealth = async () => {
    try {
      setLoading(true);
      await getChatHealth();
      setLoading(false);
      return true;
    } catch {
      setError("AI 서버에 연결할 수 없습니다.");
      setLoading(false);
      return false;
    }
  };

  // 메시지 전송 (UX 개선)
  const sendMessage = async (message, isNewChat = false) => {
    // 1. 사용자 메시지 즉시 표시
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setLoading(true);
    setError(null);

    try {
      const currentChatId = isNewChat ? undefined : chatId;
      const res = await sendChatMessage({
        message,
        chatId: currentChatId,
        isNewChat,
      });

      const aiMessage = res?.message;
      const newChatId = res?.chatId;

      if (!aiMessage) {
        throw new Error("AI 응답 메시지가 비어있습니다.");
      }

      if (isNewChat || !chatId) {
        setChatId(newChatId);
      }

      // 3. AI 메시지 표시
      setMessages((prev) => [...prev, { role: "ai", content: aiMessage }]);
    } catch (e) {
      console.error("채팅 메시지 전송 에러:", e);
      const serverMsg = e?.response?.data?.message || e.message;
      const errorMsg = `오류가 발생했습니다: ${
        serverMsg || "다시 시도해주세요."
      }`;
      setError(errorMsg);
      setMessages((prev) => [...prev, { role: "ai", content: errorMsg }]);
    } finally {
      // 2. 로딩 종료
      setLoading(false);
    }
  };

  // 채팅 메모리 초기화 및 상태 리셋
  const resetChat = async () => {
    if (chatId) {
      try {
        await clearChatMemory(chatId);
      } catch {
        // 무시
      }
    }
    setChatId(null);
    setMessages([]);
    setError(null);
  };

  // 채팅 활성화/비활성화
  const openChat = async () => {
    isActive.current = true;
    setMessages([]);
    setChatId(null);
    setError(null);
    await checkHealth();
  };
  const closeChat = async () => {
    isActive.current = false;
    await resetChat();
  };

  return {
    chatId,
    messages,
    loading,
    error,
    sendMessage,
    resetChat,
    openChat,
    closeChat,
    isActive: isActive.current,
  };
}
