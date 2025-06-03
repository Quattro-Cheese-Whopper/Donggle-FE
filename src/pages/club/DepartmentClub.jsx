import React, { useState, useEffect } from 'react';
import TopNavigator from '../../utils/navigate/TopNavigator';
import Footer from '../../utils/footer/BottomFooter';
import { ClubCardGrid } from '../../components/cards/ClubCard';
import CardFilter from '../../components/cards/CardFilter';
import sampleCentralClubs from '../../constants/clubs';
import CustomText from '../../utils/CustomText';
import colors from '../../constants/colors';

const DepartmentClub = () => {
  // 모든 분야 목록 추출 (중복 제거)
  const allCategories = ['전체', ...new Set(sampleCentralClubs.map(club => club.department))];
  
  // 선택된 분야 상태
  const [selectedCategory, setSelectedCategory] = useState('전체');
  
  // 필터링된 동아리 목록
  const [filteredClubs, setFilteredClubs] = useState(sampleCentralClubs);
  
  // 분야 선택이 변경될 때마다 동아리 목록 필터링
  useEffect(() => {
    if (selectedCategory === '전체') {
      setFilteredClubs(sampleCentralClubs);
    } else {
      setFilteredClubs(sampleCentralClubs.filter(club => club.department === selectedCategory));
    }
  }, [selectedCategory]);
  
  return (
    <div className="min-h-screen flex flex-col bg-white-50">
      <div className="relative z-10">
        <TopNavigator />
      </div>
      {/* 메인 컨텐츠 */}
      <main className="flex-grow flex justify-center">
        <div className="max-w-7xl w-full pt-6 pb-24 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* 분야별 필터 추가 */}
            <CardFilter 
              categories={allCategories}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
            <CustomText 
                font="pretendard-600"
                className="text-lg mb-4"
                style={{ color: colors.black }}
            >
                학과 동아리 목록
            </CustomText>
            {/* 필터링된 동아리 목록 */}
            <ClubCardGrid clubs={filteredClubs} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DepartmentClub;