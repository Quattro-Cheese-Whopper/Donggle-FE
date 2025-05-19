import React from 'react';
import CustomText from '../../utils/CustomText';
import colors from '../../constants/colors';

// 개별 정보 항목 (가로 배치 버전)
const InfoItem = ({ label, value }) => {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-b-0">
      <CustomText 
        font="pretendard-400"
        className="text-sm"
        style={{ color: colors.darkGray }}
      >
        {label}
      </CustomText>
      <CustomText 
        font="pretendard-600"
        className="text-base text-right ml-4"
        style={{ color: colors.black }}
      >
        {value}
      </CustomText>
    </div>
  );
};

// 웹사이트 링크 항목
const WebsiteItem = ({ label, url }) => {
  if (!url) return null;
  
  return (
    <div className="flex justify-between items-center py-1.5 border-t border-gray-100 mt-2">
      <CustomText 
        font="pretendard-400"
        className="text-sm"
        style={{ color: colors.darkGray }}
      >
        {label || '관련 링크'}
      </CustomText>
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-blue-500 hover:underline text-sm text-right ml-4"
      >
        {url}
      </a>
    </div>
  );
};

// 정보 보드 (여러 정보 항목을 포함하는 섹션)
const InfoBoard = ({ items, website }) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="space-y-0">
        {items.map((item, index) => (
          <InfoItem 
            key={index}
            label={item.label}
            value={item.value}
          />
        ))}
      </div>
      
      {website && <WebsiteItem url={website} />}
    </div>
  );
};

// 정보 그리드 아이템 (첫 번째 이미지와 같은 스타일)
const GridInfoItem = ({ label, value }) => {
  return (
    <div className="py-2">
      <CustomText 
        font="pretendard-400"
        className="text-sm mb-1"
        style={{ color: colors.darkGray }}
      >
        {label}
      </CustomText>
      <CustomText 
        font="pretendard-600"
        className="text-base"
        style={{ color: colors.black }}
      >
        {value}
      </CustomText>
    </div>
  );
};

// 첫 번째 이미지와 같은 스타일의 정보 보드 (2x2 그리드)
const FirstImageStyleBoard = ({ club }) => {
  if (!club) return null;
  
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-4">
        <GridInfoItem label="인원수" value={club.memberCount || "40+"} />
        <GridInfoItem label="동아리방" value={club.clubRoom || "동아리방"} />
        <GridInfoItem label="활동 내용" value={club.mainActivity || "프로젝트 개발"} />
        <GridInfoItem label="위치" value={club.location || "정보전산원 3층"} />
      </div>
      
      {club.website && (
        <div className="border-t border-gray-100 pt-4">
          <CustomText 
            font="pretendard-400"
            className="text-sm mb-1"
            style={{ color: colors.darkGray }}
          >
            관련 링크
          </CustomText>
          <a 
            href={club.website} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-500 hover:underline text-sm"
          >
            {club.website}
          </a>
        </div>
      )}
    </div>
  );
};

// 정보 그리드 (여러 정보 보드를 그리드로 배치)
const InfoGrid = ({ boards, gap = 6 }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-${gap}`}>
      {boards.map((board, index) => (
        <InfoBoard 
          key={index}
          items={board.items}
          website={board.website}
        />
      ))}
    </div>
  );
};

// 동아리 정보 보드 (특화된 InfoBoard)
const ClubInfoBoard = ({ club, style = "default" }) => {
  if (!club) return null;
  
  // 스타일에 따라 다른 보드 컴포넌트 반환
  if (style === "firstImage") {
    return <FirstImageStyleBoard club={club} />;
  }
  
  // 기본 정보 항목 구성
  const infoItems = [
    { label: '인원수', value: club.memberCount || '40+' },
    { label: '동아리방', value: club.clubRoom || '동아리방' },
    { label: '위치', value: club.location || '정보전산원 3층' },
    { label: '활동 내용', value: club.mainActivity || '프로젝트 개발' }
  ];
  
  return (
    <InfoBoard 
      items={infoItems}
      website={club.website}
    />
  );
};

export { InfoItem, WebsiteItem, InfoBoard, FirstImageStyleBoard, InfoGrid, ClubInfoBoard };