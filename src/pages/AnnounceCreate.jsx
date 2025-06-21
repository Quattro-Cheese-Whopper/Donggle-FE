import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import TopNavigator from "../utils/navigate/TopNavigator";
import Footer from "../utils/footer/BottomFooter";
import CustomText from "../utils/CustomText";
import colors from "../constants/colors";
import WYSIWYGEditor from "../components/editor/WYSIWYGEditor";
import { announceService } from "../api/services/announceService";
import { clubService } from "../api/services/clubService";
import { useAuth } from "../hooks/useAuth";

const AnnounceCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [club, setClub] = useState(null);

  // 인증 훅 - 동아리 관리자 권한 확인을 위해 필요한 함수들 추가
  const {
    isLoggedIn,
    isAdmin,
    isMyClub,
    fetchMyClubs,
    fetchCurrentUser,
    myClubs,
    user,
  } = useAuth();

  // URL 파라미터에서 clubId 가져오기
  const clubId = searchParams.get("clubId");

  // 공지사항 작성 폼 데이터
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

  // 🔧 동아리 정보 조회 (동아리별 공지사항 작성인 경우)
  const fetchClubInfo = async () => {
    if (!clubId) return;

    try {
      console.log(`🏢 동아리 ${clubId} 정보 조회 시작`);
      const response = await clubService.getClubDetail(clubId);
      const clubData = response.data || response;
      console.log(`✅ 동아리 ${clubId} 정보 조회 성공:`, clubData);
      setClub(clubData);
    } catch (error) {
      console.error(`❌ 동아리 ${clubId} 정보 조회 실패:`, error);
      setError("동아리 정보를 불러올 수 없습니다.");
    }
  };

  // 🔧 내 동아리 정보 조회 (동아리별 공지사항 작성인 경우)
  const fetchMyClubsOnce = async () => {
    if (clubId && isLoggedIn && myClubs.length === 0) {
      try {
        console.log("🏢 공지사항 작성에서 내 동아리 정보 조회");
        await fetchMyClubs();
      } catch (error) {
        console.warn("⚠️ 내 동아리 정보 조회 실패:", error.message);
      }
    }
  };

  // 내 사용자 정보 조회
  useEffect(() => {
    if (isLoggedIn && !user) {
      fetchCurrentUser();
    }
  }, [isLoggedIn, user, fetchCurrentUser]);

  // 🔧 동아리 정보 조회 (동아리별 공지사항 작성인 경우)
  useEffect(() => {
    fetchClubInfo();
  }, [clubId]);

  // 🔧 내 동아리 정보 조회 (동아리별 공지사항 작성인 경우)
  useEffect(() => {
    fetchMyClubsOnce();
  }, [clubId, isLoggedIn, myClubs.length, fetchMyClubs]);

  // 🔧 권한 확인 (일반 공지사항: ADMIN 권한, 동아리 공지사항: 해당 동아리 관리자 권한)
  useEffect(() => {
    if (isLoggedIn && user) {
      let hasPermission = false;

      if (clubId) {
        // 동아리별 공지사항 작성: 해당 동아리 관리자 권한 확인
        // 🔧 내 동아리 정보가 로딩 중이거나 로드된 후에만 권한 확인
        if (myClubs.length > 0) {
          hasPermission = isMyClub(parseInt(clubId));
          if (!hasPermission) {
            setError("해당 동아리의 공지사항을 작성할 권한이 없습니다.");
          } else {
            setError(null); // 권한이 있으면 에러 제거
          }
        }
        // myClubs.length === 0인 경우는 아직 로딩 중이므로 권한 확인 보류
      } else {
        // 일반 공지사항 작성: ADMIN 권한 확인
        hasPermission = isAdmin();
        if (!hasPermission) {
          setError("총동연 공지사항을 작성할 권한이 없습니다.");
        } else {
          setError(null); // 권한이 있으면 에러 제거
        }
      }
    }
  }, [isLoggedIn, user, clubId, myClubs.length, isMyClub, isAdmin]);

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

      let response;

      if (clubId) {
        // 🔧 동아리별 공지사항 생성
        console.log(`💾 동아리 ${clubId} 공지사항 생성 시작:`, requestData);
        response = await announceService.createClubAnnounce(
          clubId,
          requestData
        );
        console.log(`✅ 동아리 ${clubId} 공지사항 생성 성공:`, response);

        // 성공 후 동아리별 공지사항 목록 페이지로 이동
        navigate(`/announces?type=CLUB&clubId=${clubId}`);
      } else {
        // 일반 공지사항 생성
        console.log("💾 일반 공지사항 생성 시작:", requestData);
        response = await announceService.createGeneralAnnounce(requestData);
        console.log("✅ 일반 공지사항 생성 성공:", response);

        // 성공 후 일반 공지사항 목록 페이지로 이동
        navigate("/announces?type=GENERAL");
      }
    } catch (error) {
      console.error("❌ 공지사항 생성 실패:", error);
      setError("공지사항 작성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (clubId) {
      // 동아리별 공지사항 작성 취소 시 동아리별 목록으로 이동
      navigate(`/announces?type=CLUB&clubId=${clubId}`);
    } else {
      // 일반 공지사항 작성 취소 시 일반 목록으로 이동
      navigate("/announces?type=GENERAL");
    }
  };

  // 🔧 권한이 없는 경우
  if (
    isLoggedIn &&
    user &&
    ((clubId && myClubs.length > 0 && !isMyClub(parseInt(clubId))) ||
      (!clubId && !isAdmin()))
  ) {
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
              {clubId
                ? "해당 동아리의 공지사항을 작성할 권한이 없습니다"
                : "총동연 공지사항을 작성할 권한이 없습니다"}
            </CustomText>
            <button
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={handleCancel}
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
            <div>
              <CustomText
                font="pretendard-700"
                className="text-2xl mb-2"
                style={{ color: colors.black }}
              >
                {clubId ? "동아리 공지사항 작성" : "총동연 공지사항 작성"}
              </CustomText>
              <CustomText
                font="pretendard-500"
                className="text-base"
                style={{ color: colors.darkGray }}
              >
                {clubId
                  ? `새로운 동아리 공지사항을 작성합니다${
                      club ? ` (${club.name})` : ""
                    }`
                  : "새로운 총동연 공지사항을 작성합니다"}
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
                      "작성 완료"
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

export default AnnounceCreate;
