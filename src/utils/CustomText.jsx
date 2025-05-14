import React from 'react';
import './fonts.css';

const CustomText = ({
  children,
  style,
  font = 'pretendard-500',
  ...rest
}) => {
  // 폰트 스타일 매핑
  const getFontStyle = (fontName) => {
    // chnam 폰트 처리
    if (fontName === 'chnam') {
      return {
        fontFamily: 'Chnam',
        fontWeight: 400
      };
    }
    
    // pretendard 폰트 처리 (숫자 형식)
    if (fontName.startsWith('pretendard-')) {
      const weightStr = fontName.split('-')[1];
      const weight = parseInt(weightStr, 10);
      
      // 유효한 weight 값인지 확인 (100-900 사이의 100 단위 값)
      if (!isNaN(weight) && weight >= 100 && weight <= 900 && weight % 100 === 0) {
        return {
          fontFamily: 'Pretendard',
          fontWeight: weight
        };
      }
    }
    
    // 기본값 반환 (pretendard-500)
    return {
      fontFamily: 'Pretendard',
      fontWeight: 500
    };
  };

  // 폰트 스타일과 사용자 정의 스타일 결합
  const combinedStyle = {
    ...getFontStyle(font),
    ...style
  };

  return (
    <p style={combinedStyle} {...rest}>
      {children}
    </p>
  );
};

export default CustomText;