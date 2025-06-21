import React from "react";
import CustomText from "../../utils/CustomText";
import colors from "../../constants/colors";

// 개별 공지사항 항목
const NoticeItem = ({ title, date }) => {
  return (
    <li className="flex justify-between py-1.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
      <div className="flex items-start flex-1 min-w-0">
        <span className="w-1 h-1 bg-gray-400 rounded-full mr-2 mt-2.5 flex-shrink-0"></span>
        <CustomText
          font="pretendard-400"
          className="text-base truncate"
          style={{ color: colors.darkGray }}
          title={title}
        >
          {title}
        </CustomText>
      </div>
      <CustomText
        font="pretendard-400"
        className="text-base ml-2 whitespace-nowrap flex-shrink-0"
        style={{ color: colors.mediumGray }}
      >
        {date}
      </CustomText>
    </li>
  );
};

// 빈 상태 컴포넌트
const EmptyNoticeState = ({ type }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
            stroke={colors.mediumGray}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 2V8H20"
            stroke={colors.mediumGray}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 13H8"
            stroke={colors.mediumGray}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 17H8"
            stroke={colors.mediumGray}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 9H8"
            stroke={colors.mediumGray}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <CustomText
        font="pretendard-500"
        className="text-sm mb-1"
        style={{ color: colors.darkGray }}
      >
        {type === "general"
          ? "일반 공지사항이 없습니다"
          : "동아리 공지사항이 없습니다"}
      </CustomText>
      <CustomText
        font="pretendard-400"
        className="text-xs"
        style={{ color: colors.mediumGray }}
      >
        새로운 공지사항을 기다려주세요
      </CustomText>
    </div>
  );
};

// 공지사항 보드
const NoticeBoard = ({ title, notices, moreLink, type }) => {
  const hasNotices = notices && notices.length > 0;

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <CustomText
          font="pretendard-600"
          className="text-xl"
          style={{ color: colors.black }}
        >
          {title}
        </CustomText>
        <a
          href={moreLink}
          className="flex items-center hover:opacity-80 transition-opacity duration-200"
        >
          <CustomText
            font="pretendard-700"
            className="text-sm mr-1"
            style={{ color: colors.primary }}
          >
            더보기
          </CustomText>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 6L15 12L9 18"
              stroke={colors.primary}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>

      {hasNotices ? (
        <ul className="space-y-0.5">
          {notices.slice(0, 5).map((notice, index) => (
            <NoticeItem key={index} title={notice.title} date={notice.date} />
          ))}
        </ul>
      ) : (
        <EmptyNoticeState type={type} />
      )}
    </div>
  );
};

const NoticeGrid = ({ leftNotice, rightNotice }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      <NoticeBoard
        title={leftNotice.title}
        notices={leftNotice.items}
        moreLink={leftNotice.moreLink}
        type="general"
      />

      <NoticeBoard
        title={rightNotice.title}
        notices={rightNotice.items}
        moreLink={rightNotice.moreLink}
        type="club"
      />
    </div>
  );
};

export { NoticeItem, NoticeBoard, NoticeGrid, EmptyNoticeState };
