import React, { useState, useRef, useEffect } from 'react';
import colors from '../../constants/colors';

const WYSIWYGEditor = ({ content = '', onChange, placeholder = '내용을 입력하세요...' }) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (editorRef.current && content) {
      editorRef.current.innerHTML = content;
    }
  }, []);

  // 에디터 내용이 변경될 때 호출
  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // 커서 위치에 이미지 삽입
  const insertImageAtCursor = (src, alt = '이미지') => {
    editorRef.current.focus();
    
    // 이미지 HTML 생성
    const imageHtml = `<img src="${src}" alt="${alt}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px; display: block;" />`;
    
    // 현재 선택 영역 가져오기
    const selection = window.getSelection();
    
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      // 선택된 내용이 에디터 안에 있는지 확인
      if (editorRef.current.contains(range.commonAncestorContainer) || 
          editorRef.current === range.commonAncestorContainer) {
        
        // HTML로 삽입
        document.execCommand('insertHTML', false, imageHtml);
      } else {
        // 에디터 끝에 추가
        editorRef.current.innerHTML += imageHtml;
      }
    } else {
      // 선택 영역이 없으면 에디터 끝에 추가
      editorRef.current.innerHTML += imageHtml;
    }
    
    handleInput();
  };

  // 파일 업로드 처리
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        insertImageAtCursor(event.target.result, file.name);
      };
      reader.readAsDataURL(file);
    }
    // input 값 초기화 (같은 파일 다시 선택 가능하도록)
    e.target.value = '';
  };

  // 이미지 업로드 버튼 클릭
  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  // URL로 이미지 삽입
  const handleImageUrl = () => {
    const url = prompt('이미지 URL을 입력하세요:');
    if (url) {
      insertImageAtCursor(url, '이미지');
    }
  };

  // 텍스트 포맷팅 명령 실행
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    handleInput();
  };

  // 현재 선택된 텍스트의 포맷 상태 확인
  const isFormatActive = (command) => {
    try {
      return document.queryCommandState(command);
    } catch (e) {
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
          ? 'bg-blue-100 border-blue-300 text-blue-700' 
          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
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
          execCommand('formatBlock', e.target.value);
          e.target.value = '';
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
        style={{ display: 'none' }}
      />
      
      {/* 툴바 */}
      <div className="border-b border-gray-200 p-3 bg-gray-50">
        <div className="flex flex-wrap items-center gap-2">
          {/* 제목 스타일 */}
          <HeadingSelect />
          
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          
          {/* 텍스트 스타일 */}
          <ToolbarButton
            onClick={() => execCommand('bold')}
            active={isFormatActive('bold')}
            title="굵게 (Ctrl+B)"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M12.9 6.6c.5.3.9.9.9 1.6 0 1.1-.9 2-2 2H7V4h4.5c1 0 1.8.8 1.8 1.8 0 .4-.2.8-.4 1.1zm-1.4 4.2c1.3 0 2.3 1 2.3 2.3S13.8 15.5 12.5 15.5H7v-4.7h4.5z"/>
            </svg>
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => execCommand('italic')}
            active={isFormatActive('italic')}
            title="기울임 (Ctrl+I)"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 4l-6 12h2l6-12h-2z"/>
            </svg>
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => execCommand('underline')}
            active={isFormatActive('underline')}
            title="밑줄 (Ctrl+U)"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 3v8c0 2.2 1.8 4 4 4s4-1.8 4-4V3h-2v8c0 1.1-.9 2-2 2s-2-.9-2-2V3H6zm-1 14h10v2H5v-2z"/>
            </svg>
          </ToolbarButton>
          
          
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          
          {/* 정렬 */}
          <ToolbarButton
            onClick={() => execCommand('justifyLeft')}
            title="왼쪽 정렬"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4h14v2H3V4zm0 4h10v2H3V8zm0 4h14v2H3v-2zm0 4h10v2H3v-2z"/>
            </svg>
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => execCommand('justifyCenter')}
            title="가운데 정렬"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4h14v2H3V4zm2 4h10v2H5V8zm-2 4h14v2H3v-2zm2 4h10v2H5v-2z"/>
            </svg>
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => execCommand('justifyRight')}
            title="오른쪽 정렬"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4h14v2H3V4zm4 4h10v2H7V8zm-4 4h14v2H3v-2zm4 4h10v2H7v-2z"/>
            </svg>
          </ToolbarButton>
          
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          
          {/* 목록 */}
          <ToolbarButton
            onClick={() => execCommand('insertUnorderedList')}
            title="글머리 기호"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 6a2 2 0 100-4 2 2 0 000 4zM6 8H18v2H6V8zm0 4h12v2H6v-2zm0 4h12v2H6v-2zM4 14a2 2 0 100-4 2 2 0 000 4zM4 18a2 2 0 100-4 2 2 0 000 4z"/>
            </svg>
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => execCommand('insertOrderedList')}
            title="번호 매기기"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4h1v1H3zM6 4h12v2H6zM3 8h1v1H3zM6 8h12v2H6zM3 12h1v1H3zM6 12h12v2H6zM3 16h1v1H3zM6 16h12v2H6z"/>
            </svg>
          </ToolbarButton>
          
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          
          {/* 링크 */}
          <ToolbarButton
            onClick={() => {
              const url = prompt('링크 URL을 입력하세요:');
              if (url) {
                execCommand('createLink', url);
              }
            }}
            title="링크 삽입"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"/>
            </svg>
          </ToolbarButton>
          
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          
          {/* 이미지 업로드 */}
          <ToolbarButton
            onClick={handleImageUpload}
            title="이미지 업로드"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
            </svg>
          </ToolbarButton>
          
        </div>
      </div>
      
      {/* 에디터 영역 */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
        className={`p-4 min-h-[300px] outline-none transition-colors ${
          isActive ? 'bg-white' : 'bg-gray-50'
        }`}
        style={{
          lineHeight: '1.6',
          fontSize: '14px',
          color: colors.black,
          fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif"
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
        
        [contenteditable] ul, [contenteditable] ol {
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