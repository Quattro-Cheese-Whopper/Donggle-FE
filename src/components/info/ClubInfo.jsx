import React from 'react';
import CustomText from '../../utils/CustomText';
import colors from '../../constants/colors';

const InfoItem = ({ label, value }) => {
  return (
    <div className="flex items-center py-1.5">
      <div className="w-16">
        <CustomText 
          font="pretendard-500"
          className="text-sm text-left"
          style={{ color: colors.darkGray }}
        >
          {label}
        </CustomText>
      </div>
      <div className="pl-4">
        <CustomText 
          font="pretendard-500"
          className="text-sm text-left"
          style={{ color: colors.black }}
        >
          {value}
        </CustomText>
      </div>
    </div>
  );
};

// 웹사이트 링크 항목
const WebsiteItem = ({ label, url }) => {
  if (!url) return null;
  
  return (
    <div className="flex items-center py-1.5">
      <div className="w-16">
        <CustomText 
          font="pretendard-500"
          className="text-sm text-left"
          style={{ color: colors.darkGray }}
        >
          {label || '관련 링크'}
        </CustomText>
      </div>
      <div className="pl-4">
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-gray-400 hover:underline text-sm text-left"
        >
          {url}
        </a>
      </div>
    </div>
  );
};

const InfoBoard = ({ leftItems, rightItems, website }) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white py-3 px-7">
      <div className="flex h-auto">
        <div className="flex-1 pr-4">
          <div className="space-y-0">
            {leftItems.map((item, index) => (
              <InfoItem 
                key={index}
                label={item.label}
                value={item.value}
              />
            ))}
          </div>
        </div>
        
        <div className="flex-1 pl-4">
          <div className="space-y-0">
            {rightItems.map((item, index) => (
              <InfoItem 
                key={index}
                label={item.label}
                value={item.value}
              />
            ))}
          </div>
        </div>
      </div>
      
      {website && <WebsiteItem url={website} />}
    </div>
  );
};
const ClubInfoBoard = ({ club, style = "introduce" }) => {
  if (!club) return null;
  
  if (style === "introduce") {
    const leftItems = [
      { label: '인원수', value: club.memberCount || '40+' },
      { label: '활동 내용', value: club.mainActivity || '프로젝트 개발' }
    ];
    
    const rightItems = [
      { label: '동아리방', value: club.clubRoom || '정보전산원 3층' },
    ];
    
    const website = club.website || 'https://econovation.kr/';

    return (
      <InfoBoard 
        leftItems={leftItems}
        rightItems={rightItems}
        website={website}
      />
    );
  }
};

export { InfoItem, WebsiteItem, InfoBoard, ClubInfoBoard };