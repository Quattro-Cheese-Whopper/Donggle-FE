import React from 'react';
import colors from '../../constants/colors';
import CustomText from '../../utils/CustomText';

const ClubTabs = ({ activeTab, onTabChange }) => {
  const isIntroActive = activeTab === 'intro';
  
  const handleRecruitClick = () => {
    onTabChange('recruit');
  };

  const handleIntroClick = () => {
    onTabChange('intro');
  };

  return (
    <div className="w-full border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex">
          <div 
            className={`w-1/2 text-center py-4 cursor-pointer ${isIntroActive ? 'border-b-2' : ''}`} 
            style={{ 
              borderBottomColor: isIntroActive ? colors.primary : 'transparent'
            }}
            onClick={handleIntroClick}
          >
            <CustomText 
                font={isIntroActive ? "pretendard-700" : "pretendard-400"}
                className="text-base"
                style={{ 
                color: isIntroActive ? colors.primary : colors.mediumGray,
                margin: 0,
                }}
            >
                동아리 소개
            </CustomText>
          </div>
          
          <div 
            className={`w-1/2 text-center py-4 cursor-pointer ${!isIntroActive ? 'border-b-2' : ''}`}
            style={{ 
              borderBottomColor: !isIntroActive ? colors.primary : 'transparent'
            }}
            onClick={handleRecruitClick}
          >
            <CustomText 
                font={isIntroActive ? "pretendard-400" : "pretendard-700"}
                className="text-base"
                style={{ 
                color: isIntroActive ? colors.mediumGray : colors.primary,
                margin: 0,
                }}
            >
                신입 모집
            </CustomText>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubTabs;