import React from "react";
import colors from "../../constants/colors";
import CustomText from "../../utils/CustomText";

const ClubTabs = ({ activeTab, onTabChange }) => {
  const isIntroActive = activeTab === "intro";
  const isRecruitActive = activeTab === "recruit";
  const isNoticeActive = activeTab === "notice";

  const handleIntroClick = () => {
    onTabChange("intro");
  };

  const handleRecruitClick = () => {
    onTabChange("recruit");
  };

  const handleNoticeClick = () => {
    onTabChange("notice");
  };

  return (
    <div className="w-full border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex">
          <div
            className={`flex-1 text-center py-4 cursor-pointer ${
              isIntroActive ? "border-b-2" : ""
            }`}
            style={{
              borderBottomColor: isIntroActive ? colors.primary : "transparent",
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
            className={`flex-1 text-center py-4 cursor-pointer ${
              isRecruitActive ? "border-b-2" : ""
            }`}
            style={{
              borderBottomColor: isRecruitActive
                ? colors.primary
                : "transparent",
            }}
            onClick={handleRecruitClick}
          >
            <CustomText
              font={isRecruitActive ? "pretendard-700" : "pretendard-400"}
              className="text-base"
              style={{
                color: isRecruitActive ? colors.primary : colors.mediumGray,
                margin: 0,
              }}
            >
              신입 모집
            </CustomText>
          </div>

          <div
            className={`flex-1 text-center py-4 cursor-pointer ${
              isNoticeActive ? "border-b-2" : ""
            }`}
            style={{
              borderBottomColor: isNoticeActive
                ? colors.primary
                : "transparent",
            }}
            onClick={handleNoticeClick}
          >
            <CustomText
              font={isNoticeActive ? "pretendard-700" : "pretendard-400"}
              className="text-base"
              style={{
                color: isNoticeActive ? colors.primary : colors.mediumGray,
                margin: 0,
              }}
            >
              공지사항
            </CustomText>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubTabs;
