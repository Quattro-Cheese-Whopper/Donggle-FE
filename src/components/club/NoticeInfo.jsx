import React, { useState, useRef } from "react";
import CustomText from "../../utils/CustomText";
import WYSIWYGEditor from "../editor/WYSIWYGEditor";
import colors from "../../constants/colors";
import { announceService } from "../../api/services/announceService";

const NoticeInfo = ({ clubId, onNoticeCreated }) => {
  const [noticeFormData, setNoticeFormData] = useState({
    title: "",
    content: "",
    pinned: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // WYSIWYG 에디터에서 getProcessedContent 함수를 받을 ref
  const getProcessedContentRef = useRef(null);

  const handleInputChange = (field, value) => {
    setNoticeFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // WYSIWYG 에디터로부터 getProcessedContent 함수를 받는 콜백
  const handleGetProcessedContent = (getProcessedContentFn) => {
    getProcessedContentRef.current = getProcessedContentFn;
  };

  const handleSave = async () => {
    if (!noticeFormData.title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }

    if (!noticeFormData.content.trim()) {
      setError("내용을 입력해주세요.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      console.log("💾 공지사항 생성 시작:", noticeFormData);

      // WYSIWYG 에디터에서 처리된 콘텐츠 가져오기 (Base64 이미지 → S3 변환)
      let processedContent = noticeFormData.content;

      if (getProcessedContentRef.current) {
        console.log("🖼️ 공지사항 이미지 S3 업로드 처리 중...");
        processedContent = await getProcessedContentRef.current();
        console.log("✅ 공지사항 이미지 처리 완료");
      }

      // API 요청 형식에 맞게 데이터 변환
      const requestData = {
        title: noticeFormData.title.trim(),
        content: processedContent,
        pinned: noticeFormData.pinned,
      };

      console.log("📤 서버로 전송할 공지사항 데이터:", requestData);

      // API 호출로 공지사항 생성
      await announceService.createClubAnnounce(clubId, requestData);

      console.log("✅ 공지사항 생성 성공");

      // 성공 후 폼 초기화
      setNoticeFormData({
        title: "",
        content: "",
        pinned: false,
      });

      // 부모 컴포넌트에 알림
      if (onNoticeCreated) {
        onNoticeCreated();
      }
    } catch (error) {
      console.error("❌ 공지사항 생성 실패:", error);
      setError("공지사항 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 공지사항 작성 폼 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <CustomText
          font="pretendard-700"
          className="text-lg mb-4"
          style={{ color: colors.black }}
        >
          공지사항 작성
        </CustomText>

        {/* 제목 입력 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제목
          </label>
          <input
            type="text"
            value={noticeFormData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="공지사항 제목을 입력하세요"
            maxLength={100}
          />
        </div>

        {/* 상단 고정 체크박스 */}
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={noticeFormData.pinned}
              onChange={(e) => handleInputChange("pinned", e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              상단에 고정
            </span>
          </label>
        </div>

        {/* 내용 WYSIWYG 에디터 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            내용
          </label>
          <WYSIWYGEditor
            content={noticeFormData.content}
            onChange={(content) => handleInputChange("content", content)}
            placeholder="공지사항 내용을 작성해주세요..."
            clubId={clubId}
            onGetProcessedContent={handleGetProcessedContent}
          />
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <CustomText
              font="pretendard-500"
              className="text-sm"
              style={{ color: colors.red }}
            >
              {error}
            </CustomText>
          </div>
        )}

        {/* 저장 버튼 */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                저장 중...
              </>
            ) : (
              "공지사항 등록"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoticeInfo;
