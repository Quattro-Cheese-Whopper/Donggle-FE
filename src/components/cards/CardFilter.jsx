import React, { useState, useRef, useEffect } from 'react';
import CustomText from '../../utils/CustomText';
import colors from '../../constants/colors';

/**
 * 분야별 필터 캐러셀 컴포넌트
 * @param {Object} props
 * @param {Array} props.categories - 분야 목록 배열
 * @param {string} props.selectedCategory - 현재 선택된 분야
 * @param {function} props.onCategorySelect - 분야 선택 시 호출되는 콜백 함수
 */
const CardFilter = ({ categories, selectedCategory, onCategorySelect }) => {
  return (
    <div className="relative w-full mt-6 mb-8">
      <CustomText 
        font="pretendard-600"
        className="text-lg mb-4"
        style={{ color: colors.black }}
      >
        분야별
      </CustomText>
      
      <div className="relative flex items-center">
        <div 
          className="flex overflow-x-auto py-2 scrollbar-hide"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {categories.map((category) => (
            <button
              key={category}
              className={`whitespace-nowrap px-12 py-3 rounded-full mx-1.5 focus:outline-none transition-colors ${
                category === selectedCategory 
                  ? 'bg-green-100 text-green-800 font-medium' 
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
              onClick={() => onCategorySelect(category)}
            >
              <CustomText 
                font={category === selectedCategory ? "pretendard-600" : "pretendard-400"}
                className="text-sm"
                style={{ 
                  color: category === selectedCategory ? colors.green : colors.darkGray,
                  margin: 0
                }}
              >
                {category}
              </CustomText>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardFilter;