import React, { useState } from 'react';
import TopNavigator from '../../utils/navigate/TopNavigator';
import Footer from '../../utils/footer/BottomFooter';
import { ClubCardGrid } from '../../components/cards/ClubCard';
import CardFilter from '../../components/cards/CardFilter';
import CustomText from '../../utils/CustomText';
import colors from '../../constants/colors';
import { useClubs } from '../../hooks/useClubs';

const CentralClub = () => {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const { clubs, categories, error, getFilteredClubs, filterByCategory } = useClubs('CENTRAL');

  const filteredClubs = getFilteredClubs(selectedCategory);
  // 카테고리 선택 핸들러
  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    await filterByCategory(category);
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-white-50">
        <TopNavigator />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <CustomText 
              font="pretendard-600"
              className="text-lg text-red-500 mb-4"
            >
              데이터를 불러오는 중 오류가 발생했습니다.
            </CustomText>
            <CustomText 
              font="pretendard-400"
              className="text-sm text-gray-600"
            >
              {error}
            </CustomText>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white-50">
      <div className="relative z-10">
        <TopNavigator />
      </div>
      <main className="flex-grow flex justify-center">
        <div className="max-w-7xl w-full pt-6 pb-24 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <CardFilter 
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
            />
            <CustomText 
                font="pretendard-600"
                className="text-lg mb-4"
                style={{ color: colors.black }}
            >
                중앙 동아리 목록
            </CustomText>
            <ClubCardGrid clubs={filteredClubs} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CentralClub;