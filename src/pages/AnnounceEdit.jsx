import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopNavigator from "../utils/navigate/TopNavigator";
import Footer from "../utils/footer/BottomFooter";
import CustomText from "../utils/CustomText";
import colors from "../constants/colors";
import WYSIWYGEditor from "../components/editor/WYSIWYGEditor";
import { announceService } from "../api/services/announceService";
import { clubService } from "../api/services/clubService";
import { useClubImage } from "../hooks/useClubImage";
import { useAuth } from "../hooks/useAuth";

const AnnounceEdit = () => {
  const { announceId } = useParams();
  const navigate = useNavigate();
  const [announce, setAnnounce] = useState(null);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // 인증 훅
  const { isLoggedIn, isMyClub, fetchMyClubs, myClubs } = useAuth();

  // 동아리 이미지 훅
  const {
    imageUrl,
    loading: imageLoading,
    error: imageError,
  } = useClubImage(club?.profileImageName);

  // 편집 가능한 공지사항 필드들의 상태
  const [noticeFormData, setNoticeFormData] = useState({
    title: "",
    content: "",
    pinned: false,
  });

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

  // 공지사항 상세 조회
  const fetchAnnounceDetail = async () => {
    if (!announceId) {
      setError("공지사항 ID가 없습니다.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`📢 편집용 공지사항 ${announceId} 상세 조회 시작`);

      const response = await announceService.getAnnounce(announceId);
      const announceData = response.data || response;

      console.log(
        `✅ 편집용 공지사항 ${announceId} 상세 조회 성공:`,
        announceData
      );

      setAnnounce(announceData);

      // 폼 데이터 설정
      setNoticeFormData({
        title: announceData.title || "",
        content: announceData.content || "",
        pinned: announceData.pinned || false,
      });

      // 동아리 공지사항인 경우 동아리 정보도 조회
      if (announceData.type === "CLUB" && announceData.clubId) {
        try {
          console.log(`🏢 편집용 동아리 ${announceData.clubId} 정보 조회 시작`);
          const clubResponse = await clubService.getClubDetail(
            announceData.clubId
          );
          const clubData = clubResponse.data || clubResponse;
          console.log(
            `✅ 편집용 동아리 ${announceData.clubId} 정보 조회 성공:`,
            clubData
          );
          setClub(clubData);
        } catch (clubError) {
          console.warn(`⚠️ 편집용 동아리 정보 조회 실패:`, clubError);
        }
      }
    } catch (err) {
      console.error(`❌ 편집용 공지사항 ${announceId} 상세 조회 실패:`, err);
      setError(err.message || "공지사항을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 내 동아리 정보 조회 (동아리 공지사항인 경우)
  useEffect(() => {
    if (
      announce?.type === "CLUB" &&
      club &&
      isLoggedIn &&
      myClubs.length === 0
    ) {
      console.log("🏢 공지사항 편집에서 내 동아리 정보 조회");
      fetchMyClubs();
    }
  }, [announce, club, isLoggedIn, myClubs.length, fetchMyClubs]);

  // 권한 확인
  useEffect(() => {
    if (announce && club && isLoggedIn && myClubs.length > 0) {
      const canEdit = isMyClub(club.id);
      if (!canEdit) {
        setError("이 공지사항을 편집할 권한이 없습니다.");
      }
    }
  }, [announce, club, isLoggedIn, myClubs, isMyClub]);

  // 데이터 조회
  useEffect(() => {
    fetchAnnounceDetail();
  }, [announceId]);

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
      console.log("💾 공지사항 수정 시작:", noticeFormData);

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

      // API 호출로 공지사항 수정
      await announceService.updateAnnounce(announceId, requestData);

      console.log("✅ 공지사항 수정 성공");

      // 성공 후 상세 페이지로 돌아가기
      navigate(`/announces/${announceId}`);
    } catch (error) {
      console.error("❌ 공지사항 수정 실패:", error);
      setError("공지사항 수정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/announces/${announceId}`);
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white-50">
        <div className="relative z-10">
          <TopNavigator />
        </div>
        <main className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <CustomText
              font="pretendard-600"
              className="text-lg"
              style={{ color: colors.darkGray }}
            >
              공지사항을 불러오는 중...
            </CustomText>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 에러 상태
  if (error || !announce) {
    return (
      <div className="min-h-screen flex flex-col bg-white-50">
        <div className="relative z-10">
          <TopNavigator />
        </div>
        <main className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <CustomText
              font="pretendard-600"
              className="text-lg mb-4"
              style={{ color: colors.black }}
            >
              {error || "공지사항을 찾을 수 없습니다"}
            </CustomText>
            <button
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={() => navigate("/announces")}
            >
              목록으로 돌아가기
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white-50">
      <div className="relative z-10">
        <TopNavigator />
      </div>

      {/* 헤더 영역 */}
      <div className="w-full bg-white border-b">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            {club && (
              <div className="mr-6">
                {/* 동아리 이미지 렌더링 */}
                {imageLoading ? (
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : imageError || !imageUrl ? (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                ) : (
                  <img
                    src={imageUrl}
                    alt={`${club.name} 로고`}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
              </div>
            )}
            <div>
              <CustomText
                font="pretendard-700"
                className="text-2xl mb-2"
                style={{ color: colors.black }}
              >
                공지사항 편집
              </CustomText>
              <CustomText
                font="pretendard-500"
                className="text-base"
                style={{ color: colors.darkGray }}
              >
                {announce.title} 수정
              </CustomText>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow flex justify-center">
        <div className="max-w-screen-lg w-full pb-24 sm:px-6 lg:px-8">
          <div className="px-4">
            <div className="mt-8">
              {/* 공지사항 작성 폼 */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <CustomText
                  font="pretendard-700"
                  className="text-lg mb-4"
                  style={{ color: colors.black }}
                >
                  공지사항 수정
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
                      onChange={(e) =>
                        handleInputChange("pinned", e.target.checked)
                      }
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
                    onChange={(content) =>
                      handleInputChange("content", content)
                    }
                    placeholder="공지사항 내용을 작성해주세요..."
                    clubId={club?.id}
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

                {/* 저장/취소 버튼 */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={saving}
                  >
                    취소
                  </button>
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
                      "수정 완료"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AnnounceEdit;
