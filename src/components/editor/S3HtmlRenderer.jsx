// src/components/editor/S3HtmlRenderer.jsx
import React, { useEffect, useRef, useState } from 'react';
import { apiClient } from '../../api/client';

const S3HtmlRenderer = ({ htmlContent, className = '' }) => {
  const containerRef = useRef(null);
  const [processedContent, setProcessedContent] = useState('');

  useEffect(() => {
    const processHtml = async () => {
      if (!htmlContent) {
        setProcessedContent('');
        return;
      }

      console.log('🔍 처리할 원본 HTML:', htmlContent);

      let processed = htmlContent;

      // 1. 상대 경로 S3 이미지 URL을 절대 경로로 변환
      processed = processed.replace(
        /<img([^>]*src=["'])\/api\/files\/download\/([^"']*)(["'][^>]*)>/g,
        (match, prefix, storedName, suffix) => {
          const fullUrl = `${apiClient.baseURL}/files/download/${storedName}`;
          console.log('🔄 상대경로 이미지 변환:', `/files/download/${storedName}`, '→', fullUrl);
          return `<img${prefix}${fullUrl}${suffix}>`;
        }
      );

      // 2. 이미 절대 경로인 S3 이미지도 확인
      processed = processed.replace(
        /<img([^>]*src=["'])(http[^"']*\/api\/files\/download\/[^"']*)(["'][^>]*)>/g,
        (match, prefix, url, suffix) => {
          console.log('🔍 절대경로 이미지 발견:', url);
          return match; // 이미 절대 경로이므로 그대로 유지
        }
      );

      // 3. 모든 이미지에 스타일과 에러 처리 추가
      processed = processed.replace(
        /<img([^>]*)>/g,
        (match, attributes) => {
          // 기존 style 속성이 있는지 확인
          const hasStyle = /style\s*=/.test(attributes);
          const baseStyle = 'max-width: 100%; height: auto; margin: 1em 0; border-radius: 8px; display: block;';
          
          if (hasStyle) {
            // 기존 style에 추가
            return match.replace(
              /style\s*=\s*["']([^"']*)["']/,
              `style="${baseStyle} $1"`
            );
          } else {
            // 새로운 style 속성 추가
            return `<img${attributes} style="${baseStyle}">`;
          }
        }
      );

      console.log('✅ 최종 처리된 HTML:', processed);
      setProcessedContent(processed);
    };

    processHtml();
  }, [htmlContent]);

  // 이미지 로드 에러 처리
  useEffect(() => {
    if (!containerRef.current) return;

    const handleImageError = (event) => {
      const img = event.target;
      if (img.tagName === 'IMG') {
        console.error('❌ 이미지 로드 실패:', img.src);
        
        // 에러 플레이스홀더 생성
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
          padding: 20px;
          background-color: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          text-align: center;
          color: #6b7280;
          margin: 1em 0;
          font-size: 14px;
        `;
        errorDiv.innerHTML = `
          <svg width="24" height="24" style="margin: 0 auto 8px auto;" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
          </svg>
          <div>이미지를 불러올 수 없습니다</div>
          <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">${img.src}</div>
        `;
        
        // 원본 이미지를 에러 메시지로 교체
        img.parentNode.replaceChild(errorDiv, img);
      }
    };

    const handleImageLoad = (event) => {
      const img = event.target;
      if (img.tagName === 'IMG') {
        console.log('✅ 이미지 로드 성공:', img.src);
      }
    };

    // 이벤트 리스너를 컨테이너에 위임
    const container = containerRef.current;
    container.addEventListener('error', handleImageError, true);
    container.addEventListener('load', handleImageLoad, true);

    return () => {
      container.removeEventListener('error', handleImageError, true);
      container.removeEventListener('load', handleImageLoad, true);
    };
  }, [processedContent]);

  return (
    <div 
      ref={containerRef}
      className={`prose prose-lg max-w-none leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
};

export default S3HtmlRenderer;