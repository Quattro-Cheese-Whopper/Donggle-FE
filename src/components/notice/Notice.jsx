import React from 'react';
import CustomText from '../../utils/CustomText';
import colors from '../../constants/colors';

// 개별 공지사항 항목
const NoticeItem = ({ title, date }) => {
  return (
    <li className="flex justify-between py-1.5 border-b border-gray-100 last:border-b-0">
      <div className="flex items-start">
        <span className="w-1 h-1 bg-gray-400 rounded-full mr-2 mt-2.5"></span>
        <CustomText 
          font="pretendard-400"
          className="text-base truncate max-w-s"
          style={{ color: colors.darkGray }}
        >
          {title}
        </CustomText>
      </div>
      <CustomText 
        font="pretendard-400"
        className="text-base ml-2 whitespace-nowrap"
        style={{ color: colors.mediumGray }}
      >
        {date}
      </CustomText>
    </li>
  );
};

// 공지사항 보드
const NoticeBoard = ({ title, notices, moreLink }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <CustomText 
          font="pretendard-600"
          className="text-xl"
          style={{ color: colors.black }}
        >
          {title}
        </CustomText>
        <a href={moreLink} className="flex items-center">
          <CustomText 
            font="pretendard-700"
            className="text-sm mr-1"
            style={{ color: colors.primary }}
          >
            더보기
          </CustomText>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 6L15 12L9 18" stroke={colors.primary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
      
      <ul className="space-y-0.5">
        {notices.slice(0, 5).map((notice, index) => (
          <NoticeItem 
            key={index} 
            title={notice.title} 
            date={notice.date} 
          />
        ))}
      </ul>
    </div>
  );
};

const NoticeGrid = ({ leftNotice, rightNotice }) => {
  return (
    <div className="grid grid-cols-2 gap-28">
      <NoticeBoard 
        title={leftNotice.title}
        notices={leftNotice.items}
        moreLink={leftNotice.moreLink}
      />
      
      <NoticeBoard 
        title={rightNotice.title}
        notices={rightNotice.items}
        moreLink={rightNotice.moreLink}
      />
    </div>
  );
};

export { NoticeItem, NoticeBoard, NoticeGrid };