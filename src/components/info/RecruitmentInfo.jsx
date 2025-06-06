// src/components/info/RecruitmentInfo.jsx
import React from 'react';
import CustomText from '../../utils/CustomText';
import colors from '../../constants/colors';
import { InfoBoard } from './ClubInfo';

// 날짜 포맷 함수
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  } catch (error) {
    console.error('날짜 포맷 오류:', error);
    return dateString;
  }
};

// 모집 기간 문자열 생성
const formatRecruitmentPeriod = (startDate, endDate) => {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  
  if (start && end) {
    return `${start} ~ ${end}`;
  } else if (start) {
    return `${start}부터`;
  } else if (end) {
    return `${end}까지`;
  }
  
  return '미정';
};

// 모집공고 정보 보드
const RecruitmentInfoBoard = ({ recruitment }) => {
  if (!recruitment) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white py-8 px-7 text-center">
        <CustomText 
          font="pretendard-500"
          className="text-base"
          style={{ color: colors.darkGray }}
        >
          현재 진행 중인 모집공고가 없습니다.
        </CustomText>
      </div>
    );
  }

  const leftItems = [
    { 
      label: '모집인원', 
      value: recruitment.recruitCount > 0 ? `${recruitment.recruitCount}명` : '인원 미정'
    },
    { 
      label: '모집분야', 
      value: recruitment.title || '분야 미정'
    }
  ];
  
  const rightItems = [
    { 
      label: '모집기간', 
      value: formatRecruitmentPeriod(recruitment.startDate, recruitment.endDate)
    }
  ];

  return (
    <InfoBoard 
      leftItems={leftItems}
      rightItems={rightItems}
      website={recruitment.contactInfo}
    />
  );
};

export { RecruitmentInfoBoard };