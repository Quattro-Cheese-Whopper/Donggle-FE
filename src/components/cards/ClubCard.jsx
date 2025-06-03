import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomText from '../../utils/CustomText';
import colors from '../../constants/colors';

const ClubCard = ({ id, icon, name, description, category, isRecruiting }) => {
  const navigate = useNavigate();

  // 카드 클릭 핸들러
  const handleCardClick = () => {
    navigate(`/club/central/${id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm p-5 flex flex-col h-40 relative border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      {/* 동아리 아이콘 */}
      <div className="mb-2">
        <img src={icon} alt={`${name} 아이콘`} className="w-8 h-8" />
      </div>
      
      {/* 동아리 이름 */}
      <CustomText 
        font="pretendard-600"
        className="text-xl mb-1"
        style={{ color: colors.black }}
      >
        {name}
      </CustomText>
      
      {/* 분과 및 카테고리 정보 */}
      <div className="text-base">
        <CustomText 
          font="pretendard-400" 
          style={{ color: colors.darkGray }}
          className="block"
        >
          {category}
        </CustomText>
        <CustomText 
          font="pretendard-400" 
          style={{ color: colors.darkGray }}
          className="block"
        >
          {description}
        </CustomText>
      </div>
      
      {/* 모집 상태 배지 */}
      <div className="absolute bottom-4 right-4">
        <div 
          className="px-3 py-1 rounded-lg inline-block"
          style={{ 
            backgroundColor: isRecruiting ? colors.primary : colors.lightGray,
          }}
        >
          <CustomText 
            font="pretendard-400"
            className="text-xs"
            style={{ 
              color: isRecruiting ? colors.white : colors.mediumGray,
              margin: 0,
            }}
          >
            {isRecruiting ? '모집중' : '모집종료'}
          </CustomText>
        </div>
      </div>
    </div>
  );
};

const ClubCardGrid = ({ clubs }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {clubs.map((club) => (
        <ClubCard
          key={club.id}
          id={club.id}
          icon={club.icon}
          name={club.name}
          description={club.description}
          category={club.category}
          isRecruiting={club.isRecruiting}
        />
      ))}
    </div>
  );
};

const HorizontalClubCarousel = ({ clubs }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3;
  const totalItems = clubs.length;
  
  // 이전 페이지로 이동
  const goToPrevious = () => {
    if (currentIndex === 0) {
      // 첫 페이지에서 이전을 누르면 마지막으로 이동
      const lastPageStartIndex = Math.floor((totalItems - 1) / itemsPerPage) * itemsPerPage;
      setCurrentIndex(lastPageStartIndex);
    } else {
      setCurrentIndex(currentIndex - itemsPerPage);
    }
  };
  
  // 다음 페이지로 이동
  const goToNext = () => {
    if (currentIndex + itemsPerPage >= totalItems) {
      // 마지막 페이지에서 다음을 누르면 처음으로 이동
      setCurrentIndex(0);
    } else {
      setCurrentIndex(currentIndex + itemsPerPage);
    }
  };
  
  // 현재 화면에 표시할 동아리 (최대 3개)
  const visibleClubs = clubs.slice(currentIndex, currentIndex + itemsPerPage);
  
  return (
    <div className="relative w-full">
      {/* 좌측 화살표 */}
      <button 
        onClick={goToPrevious}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md border border-gray-100 focus:outline-none hover:bg-gray-50"
        aria-label="이전 동아리 보기"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke={colors.darkGray} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      {/* 동아리 카드 컨테이너 */}
      <div className="flex justify-between space-x-4 px-8">
        {visibleClubs.map((club) => (
          <div key={club.id} className="flex-1 min-w-0">
            <ClubCard
              id={club.id}
              icon={club.icon}
              name={club.name}
              department={club.department}
              category={club.category}
              isRecruiting={club.isRecruiting}
            />
          </div>
        ))}
        
        {/* 부족한 카드 공간 채우기 */}
        {visibleClubs.length < itemsPerPage && Array.from({ length: itemsPerPage - visibleClubs.length }).map((_, i) => (
          <div key={`empty-${i}`} className="flex-1 min-w-0"></div>
        ))}
      </div>
      
      {/* 우측 화살표 */}
      <button 
        onClick={goToNext}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md border border-gray-100 focus:outline-none hover:bg-gray-50"
        aria-label="다음 동아리 보기"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 6L15 12L9 18" stroke={colors.darkGray} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
};

// useState import 추가


// 컴포넌트 내보내기
export { ClubCard, ClubCardGrid, HorizontalClubCarousel };