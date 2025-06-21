import React from "react";
import CustomText from "../../utils/CustomText";
import WYSIWYGEditor from "../editor/WYSIWYGEditor";
import colors from "../../constants/colors";

const RecruitmentEdit = ({
  recruitmentFormData,
  onInputChange,
  clubId,
  onGetProcessedContent,
}) => {
  return (
    <div className="space-y-6">
      {/* 기본 정보 편집 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <CustomText
          font="pretendard-700"
          className="text-lg mb-4"
          style={{ color: colors.black }}
        >
          기본 정보
        </CustomText>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              모집분야
            </label>
            <input
              type="text"
              value={recruitmentFormData.title}
              onChange={(e) => onInputChange("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: FE, BE, AI, GAME, PM, DE"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              모집인원
            </label>
            <input
              type="number"
              value={recruitmentFormData.recruitCount}
              onChange={(e) =>
                onInputChange("recruitCount", parseInt(e.target.value) || 0)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              placeholder="0 (0이면 '인원 미정'으로 표시)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              모집 시작일
            </label>
            <input
              type="date"
              value={recruitmentFormData.startDate}
              onChange={(e) => onInputChange("startDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              모집 마감일
            </label>
            <input
              type="date"
              value={recruitmentFormData.endDate}
              onChange={(e) => onInputChange("endDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              모집상태
            </label>
            <select
              value={recruitmentFormData.status}
              onChange={(e) => onInputChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="RECRUITING">모집중</option>
              <option value="ALWAYS_RECRUITING">상시모집</option>
              <option value="COMPLETED">모집종료</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              관련링크
            </label>
            <input
              type="url"
              value={recruitmentFormData.contactInfo}
              onChange={(e) => onInputChange("contactInfo", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://recruit.example.com"
            />
          </div>
        </div>
      </div>

      {/* 모집 상세 정보 WYSIWYG 에디터 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <CustomText
          font="pretendard-700"
          className="text-lg mb-4"
          style={{ color: colors.black }}
        >
          모집 상세 정보
        </CustomText>

        <div className="mt-4">
          <WYSIWYGEditor
            content={recruitmentFormData.content}
            onChange={(content) => onInputChange("content", content)}
            placeholder="모집에 대한 상세한 정보를 작성해주세요..."
            clubId={clubId}
            onGetProcessedContent={onGetProcessedContent}
          />
        </div>
      </div>
    </div>
  );
};

export default RecruitmentEdit;
