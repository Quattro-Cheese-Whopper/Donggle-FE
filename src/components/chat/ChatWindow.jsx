import React, { useState, useRef, useEffect } from "react";
import CustomText from "../../utils/CustomText";
import ReactMarkdown from "react-markdown";

const LoadingBubble = () => (
  <div className="flex justify-start">
    <div className="px-3 py-2 rounded-lg text-sm bg-gray-200 animate-pulse">
      <div className="flex items-center space-x-1">
        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
      </div>
    </div>
  </div>
);

export default function ChatWindow({
  open,
  onClose,
  messages,
  onSend,
  loading,
  error,
}) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSend = () => {
    if (input.trim() && !loading) {
      onSend(input);
      setInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 w-96 max-w-full bg-white rounded-xl shadow-2xl flex flex-col border border-gray-200 animate-fade-in">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <CustomText className="font-bold text-lg">AI 챗봇</CustomText>
        <button
          onClick={onClose}
          aria-label="채팅 닫기"
          className="text-gray-400 hover:text-gray-700 text-xl"
        >
          ×
        </button>
      </div>
      <div
        className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-gray-50"
        style={{ minHeight: 320, maxHeight: 480 }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-3 py-2 rounded-lg text-sm max-w-[80%] break-words ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white border text-left"
              }`}
            >
              {msg.role === "user" ? (
                <CustomText>{msg.content}</CustomText>
              ) : (
                <ReactMarkdown
                  components={{
                    p: (props) => <p className="mb-1 last:mb-0" {...props} />,
                  }}
                >
                  {msg.content.replace(/\n/g, "  \n")}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        {loading && <LoadingBubble />}
        {messages.length === 0 && !loading && (
          <CustomText className="text-gray-400 text-sm">
            AI 에이전트에게 궁금한 점을 물어보세요!
          </CustomText>
        )}
        <div ref={messagesEndRef} />
      </div>
      {error && <div className="px-4 py-1 text-xs text-red-500">{error}</div>}
      <div className="flex items-center px-3 py-2 border-t bg-white">
        <textarea
          className="flex-1 resize-none border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요..."
          disabled={loading}
        />
        <button
          onClick={handleSend}
          className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={loading || !input.trim()}
        >
          {loading ? "..." : "전송"}
        </button>
      </div>
    </div>
  );
}
