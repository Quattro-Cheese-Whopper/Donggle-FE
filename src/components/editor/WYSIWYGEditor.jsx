// src/components/editor/WYSIWYGEditor.jsx 전체 수정

import React, { useState, useRef, useEffect } from "react";
import colors from "../../constants/colors";
import { fileService } from "../../api/services/fileService";
import { apiClient } from "../../api/client";

const WYSIWYGEditor = ({
  content = "",
  onChange,
  placeholder = "내용을 입력하세요...",
  clubId,
  onGetProcessedContent,
}) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(new Set());
  const [isComposing, setIsComposing] = useState(false);
  const debounceTimerRef = useRef(null); // 🔧 debounce 타이머

  // 🔧 상대 경로 이미지를 절대 경로로 변환하는 함수
  const convertRelativeImageUrls = (htmlContent) => {
    if (!htmlContent) return htmlContent;

    return htmlContent.replace(
      /<img([^>]*src=["'])\/api\/files\/download\/([^"']*)(["'][^>]*)>/g,
      (match, prefix, storedName, suffix) => {
        const fullUrl = `${apiClient.baseURL}/files/download/${storedName}`;
        console.log(
          "🔄 에디터에서 상대경로 이미지 변환:",
          `/api/files/download/${storedName}`,
          "→",
          fullUrl
        );
        return `<img${prefix}${fullUrl}${suffix}>`;
      }
    );
  };

  // 🔧 초기 content 설정 (한 번만) - 상대 경로를 절대 경로로 변환
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    if (editorRef.current && content && !isInitialized) {
      const convertedContent = convertRelativeImageUrls(content);
      editorRef.current.innerHTML = convertedContent;
      setIsInitialized(true);
      console.log("✅ 에디터 초기화 완료 - 이미지 경로 변환됨");
    }
  }, [content, isInitialized]);

  // 🔧 debounced onChange 함수
  const debouncedOnChange = (htmlContent) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (onChange) {
        onChange(htmlContent);
      }
    }, 300); // 300ms 지연
  };

  // 🔧 한글 조합 핸들러
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
    if (editorRef.current) {
      debouncedOnChange(editorRef.current.innerHTML);
    }
  };

  // 🔧 입력 핸들러 (debounce 적용)
  const handleInput = () => {
    if (!isComposing && editorRef.current) {
      debouncedOnChange(editorRef.current.innerHTML);
    }
  };

  // 🔧 즉시 동기화가 필요한 경우 (저장 시)
  const syncContent = () => {
    if (editorRef.current && onChange) {
      // 기존 타이머 취소
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      // 즉시 onChange 호출
      onChange(editorRef.current.innerHTML);
    }
  };

  // 🔧 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Base64 이미지를 S3에 업로드하고 교체
  const processBase64Images = async (htmlContent) => {
    if (!clubId) return htmlContent;

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const images = doc.querySelectorAll("img");

    let processedContent = htmlContent;

    for (const img of images) {
      const src = img.getAttribute("src");

      if (src && src.startsWith("data:image/")) {
        try {
          console.log("🔄 Base64 이미지를 S3로 업로드 중...");

          const timestamp = Date.now();
          const mimeType = src.split(",")[0].split(":")[1].split(";")[0];
          const extension = mimeType.split("/")[1];
          const fileName = `image_${timestamp}.${extension}`;

          const uploadResult = await fileService.uploadBase64Image(
            src,
            fileName,
            "ANNOUNCE_ATTACHMENT",
            clubId
          );
          const storedName = uploadResult.downloadUrl.split("/").pop();
          const s3ImageUrl = `/api/files/download/${storedName}`;

          processedContent = processedContent.replace(src, s3ImageUrl);

          console.log("✅ Base64 이미지 S3 업로드 완료:", s3ImageUrl);
        } catch (error) {
          console.error("❌ Base64 이미지 업로드 실패:", error);
        }
      }
    }

    return processedContent;
  };

  // 🔧 절대 경로 이미지를 상대 경로로 변환하는 함수 (저장용)
  const convertAbsoluteImageUrls = (htmlContent) => {
    if (!htmlContent) return htmlContent;

    return htmlContent.replace(
      /<img([^>]*src=["'])(https?:\/\/[^"']*\/api\/files\/download\/[^"']*)(["'][^>]*)>/g,
      (match, prefix, fullUrl, suffix) => {
        const storedName = fullUrl.split("/").pop();
        const relativeUrl = `/api/files/download/${storedName}`;
        console.log(
          "🔄 에디터에서 절대경로 이미지 변환 (저장용):",
          fullUrl,
          "→",
          relativeUrl
        );
        return `<img${prefix}${relativeUrl}${suffix}>`;
      }
    );
  };

  // 🔧 저장 시 Base64 이미지를 S3로 변환하는 함수
  const getProcessedContent = async () => {
    // 🔧 저장 시에는 최신 내용을 즉시 동기화
    syncContent();

    const currentContent = editorRef.current
      ? editorRef.current.innerHTML
      : content;

    // 1. Base64 이미지를 S3로 업로드
    let processedContent = await processBase64Images(currentContent);

    // 2. 절대 경로 이미지를 상대 경로로 변환 (저장용)
    processedContent = convertAbsoluteImageUrls(processedContent);

    console.log("✅ 저장용 콘텐츠 처리 완료");
    return processedContent;
  };

  useEffect(() => {
    if (onGetProcessedContent) {
      onGetProcessedContent(getProcessedContent);
    }
  }, [clubId, onGetProcessedContent]);

  // 이미지를 S3에 업로드하고 에디터에 삽입
  const uploadAndInsertImage = async (file) => {
    if (!clubId) {
      alert("동아리 ID가 없어 이미지를 업로드할 수 없습니다.");
      return;
    }

    const tempImageId = `temp-${Date.now()}`;

    try {
      setUploadingImages((prev) => new Set([...prev, tempImageId]));

      console.log("🖼️ 이미지 S3 업로드 시작:", file.name);

      const loadingImageHtml = `
        <div id="${tempImageId}" style="margin: 10px 0; text-align: center; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
          <div style="display: inline-flex; align-items: center; gap: 8px;">
            <div style="width: 20px; height: 20px; border: 2px solid #4f46e5; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <span style="color: #6b7280; font-size: 14px;">이미지 업로드 중...</span>
          </div>
        </div>
        <style>
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
      `;

      insertHtmlAtCursor(loadingImageHtml);

      const uploadResult = await fileService.uploadFile(
        file,
        "ANNOUNCE_ATTACHMENT",
        clubId
      );

      console.log("✅ S3 업로드 완료:", uploadResult);

      const storedName = uploadResult.downloadUrl.split("/").pop();
      const s3ImageUrl = `/api/files/download/${storedName}`;

      const tempElement = editorRef.current.querySelector(`#${tempImageId}`);
      if (tempElement) {
        const actualImageHtml = `<img src="${s3ImageUrl}" alt="${uploadResult.originalName}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px; display: block;" data-stored-name="${storedName}" />`;
        tempElement.outerHTML = actualImageHtml;
      }

      console.log("✅ 에디터에 S3 이미지 삽입 완료");
    } catch (error) {
      console.error("❌ 이미지 업로드 실패:", error);

      const tempElement = editorRef.current.querySelector(`#${tempImageId}`);
      if (tempElement) {
        const errorHtml = `
          <div style="margin: 10px 0; padding: 15px; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #dc2626; text-align: center;">
            이미지 업로드에 실패했습니다: ${error.message}
          </div>
        `;
        tempElement.outerHTML = errorHtml;
      }

      alert(`이미지 업로드에 실패했습니다: ${error.message}`);
    } finally {
      setUploadingImages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(tempImageId);
        return newSet;
      });
      // 🔧 이미지 삽입 후 내용 동기화
      syncContent();
    }
  };

  // 커서 위치에 HTML 삽입
  const insertHtmlAtCursor = (html) => {
    editorRef.current.focus();

    const selection = window.getSelection();

    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      if (
        editorRef.current.contains(range.commonAncestorContainer) ||
        editorRef.current === range.commonAncestorContainer
      ) {
        document.execCommand("insertHTML", false, html);
      } else {
        editorRef.current.innerHTML += html;
      }
    } else {
      editorRef.current.innerHTML += html;
    }
  };

  // 커서 위치에 이미지 삽입
  const insertImageAtCursor = (src, alt = "이미지") => {
    const imageHtml = `<img src="${src}" alt="${alt}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px; display: block;" />`;
    insertHtmlAtCursor(imageHtml);
    syncContent(); // 🔧 즉시 동기화
  };

  // 파일 업로드 처리
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      if (clubId) {
        uploadAndInsertImage(file);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          insertImageAtCursor(event.target.result, file.name);
        };
        reader.readAsDataURL(file);
      }
    }
    e.target.value = "";
  };

  // 이미지 업로드 버튼 클릭
  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  // URL로 이미지 삽입
  const handleImageUrl = () => {
    const url = prompt("이미지 URL을 입력하세요:");
    if (url) {
      insertImageAtCursor(url, "이미지");
    }
  };

  // 텍스트 포맷팅 명령 실행
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    syncContent(); // 🔧 포맷팅 후 즉시 동기화
  };

  // 현재 선택된 텍스트의 포맷 상태 확인
  const isFormatActive = (command) => {
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  };

  // 툴바 버튼 컴포넌트
  const ToolbarButton = ({ onClick, active, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded border transition-colors ${
        active
          ? "bg-blue-100 border-blue-300 text-blue-700"
          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );

  // 제목 선택 드롭다운
  const HeadingSelect = () => (
    <select
      onChange={(e) => {
        if (e.target.value) {
          execCommand("formatBlock", e.target.value);
          e.target.value = "";
        }
      }}
      className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
    >
      <option value="">제목</option>
      <option value="h1">제목 1</option>
      <option value="h2">제목 2</option>
      <option value="h3">제목 3</option>
      <option value="p">본문</option>
    </select>
  );

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />

      {/* 툴바 */}
      <div className="border-b border-gray-200 p-3 bg-gray-50">
        <div className="flex flex-wrap items-center gap-2">
          <HeadingSelect />

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          <ToolbarButton
            onClick={() => execCommand("bold")}
            active={isFormatActive("bold")}
            title="굵게 (Ctrl+B)"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M12.9 6.6c.5.3.9.9.9 1.6 0 1.1-.9 2-2 2H7V4h4.5c1 0 1.8.8 1.8 1.8 0 .4-.2.8-.4 1.1zm-1.4 4.2c1.3 0 2.3 1 2.3 2.3S13.8 15.5 12.5 15.5H7v-4.7h4.5z" />
            </svg>
          </ToolbarButton>

          <ToolbarButton
            onClick={() => execCommand("italic")}
            active={isFormatActive("italic")}
            title="기울임 (Ctrl+I)"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 4l-6 12h2l6-12h-2z" />
            </svg>
          </ToolbarButton>

          <ToolbarButton
            onClick={() => execCommand("underline")}
            active={isFormatActive("underline")}
            title="밑줄 (Ctrl+U)"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 3v8c0 2.2 1.8 4 4 4s4-1.8 4-4V3h-2v8c0 1.1-.9 2-2 2s-2-.9-2-2V3H6zm-1 14h10v2H5v-2z" />
            </svg>
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          <ToolbarButton
            onClick={() => execCommand("justifyLeft")}
            title="왼쪽 정렬"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4h14v2H3V4zm0 4h10v2H3V8zm0 4h14v2H3v-2zm0 4h10v2H3v-2z" />
            </svg>
          </ToolbarButton>

          <ToolbarButton
            onClick={() => execCommand("justifyCenter")}
            title="가운데 정렬"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4h14v2H3V4zm2 4h10v2H5V8zm-2 4h14v2H3v-2zm2 4h10v2H5v-2z" />
            </svg>
          </ToolbarButton>

          <ToolbarButton
            onClick={() => execCommand("justifyRight")}
            title="오른쪽 정렬"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4h14v2H3V4zm4 4h10v2H7V8zm-4 4h14v2H3v-2zm4 4h10v2H7v-2z" />
            </svg>
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          <ToolbarButton
            onClick={() => execCommand("insertUnorderedList")}
            title="글머리 기호"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 6a2 2 0 100-4 2 2 0 000 4zM6 8H18v2H6V8zm0 4h12v2H6v-2zm0 4h12v2H6v-2zM4 14a2 2 0 100-4 2 2 0 000 4zM4 18a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </ToolbarButton>

          <ToolbarButton
            onClick={() => execCommand("insertOrderedList")}
            title="번호 매기기"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4h1v1H3zM6 4h12v2H6zM3 8h1v1H3zM6 8h12v2H6zM3 12h1v1H3zM6 12h12v2H6zM3 16h1v1H3zM6 16h12v2H6z" />
            </svg>
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          <ToolbarButton
            onClick={() => {
              const url = prompt("링크 URL을 입력하세요:");
              if (url) {
                execCommand("createLink", url);
              }
            }}
            title="링크 삽입"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" />
            </svg>
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          <ToolbarButton
            onClick={handleImageUpload}
            title={clubId ? "이미지 업로드 (S3에 저장)" : "이미지 업로드"}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
          </ToolbarButton>

          <ToolbarButton onClick={handleImageUrl} title="이미지 URL로 삽입">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </ToolbarButton>

          {uploadingImages.size > 0 && (
            <div className="ml-2 flex items-center text-sm text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              이미지 업로드 중... ({uploadingImages.size}개)
            </div>
          )}
        </div>
      </div>

      {/* 에디터 영역 */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
        className={`p-4 min-h-[300px] outline-none transition-colors ${
          isActive ? "bg-white" : "bg-gray-50"
        }`}
        style={{
          lineHeight: "1.6",
          fontSize: "14px",
          color: colors.black,
          fontFamily:
            "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }

        [contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }

        [contenteditable] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
        }

        [contenteditable] h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.83em 0;
        }

        [contenteditable] p {
          margin: 1em 0;
        }

        [contenteditable] ul,
        [contenteditable] ol {
          margin: 1em 0;
          padding-left: 2em;
        }

        [contenteditable] li {
          margin: 0.5em 0;
        }

        [contenteditable] a {
          color: #2563eb;
          text-decoration: underline;
        }

        [contenteditable] img {
          max-width: 100%;
          height: auto;
          margin: 1em 0;
          border-radius: 8px;
          display: block;
        }
      `}</style>
    </div>
  );
};

export default WYSIWYGEditor;
