import React from "react";
import CustomText from "../../utils/CustomText";
import WYSIWYGEditor from "../editor/WYSIWYGEditor";
import colors from "../../constants/colors";

const ClubIntroEdit = ({
  clubFormData,
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
              동아리명
            </label>
            <input
              type="text"
              value={clubFormData.name}
              onChange={(e) => onInputChange("name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              인원수
            </label>
            <input
              type="number"
              value={clubFormData.memberCount}
              onChange={(e) =>
                onInputChange("memberCount", parseInt(e.target.value) || 0)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              동아리방
            </label>
            <input
              type="text"
              value={clubFormData.location}
              onChange={(e) => onInputChange("location", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 정보전산원 3층"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              관련 링크
            </label>
            <input
              type="url"
              value={clubFormData.contactInfo}
              onChange={(e) => onInputChange("contactInfo", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com"
            />
          </div>
        </div>
      </div>

      {/* 상세 소개 WYSIWYG 에디터 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <CustomText
          font="pretendard-700"
          className="text-lg mb-4"
          style={{ color: colors.black }}
        >
          상세 소개
        </CustomText>

        <div className="mt-4">
          <WYSIWYGEditor
            content={clubFormData.description}
            onChange={(content) => onInputChange("description", content)}
            placeholder="동아리에 대한 상세한 소개를 작성해주세요..."
            clubId={clubId}
            onGetProcessedContent={onGetProcessedContent}
          />
        </div>
      </div>
    </div>
  );
};

export default ClubIntroEdit;
