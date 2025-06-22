import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import TopNavigator from "../../utils/navigate/TopNavigator";
import Footer from "../../utils/footer/BottomFooter";
import CustomText from "../../utils/CustomText";
import colors from "../../constants/colors";
import ClubTabs from "../../components/tabs/ClubTabs";
import ClubIntroEdit from "../../components/club/ClubIntroEdit";
import RecruitmentEdit from "../../components/club/RecruitmentEdit";
import NoticeInfo from "../../components/club/NoticeInfo";
import { clubService } from "../../api/services/clubService";
import { recruitmentService } from "../../api/services/recruitmentService";
import { useClubImage } from "../../hooks/useClubImage";

const CentralClubEdit = ({ clubType = "central" }) => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [club, setClub] = useState(null);
  const [activeRecruitment, setActiveRecruitment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // 🔧 URL 쿼리 파라미터에서 이전 탭 정보를 읽어와서 초기 탭으로 설정
  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("fromTab");
    return tab && ["intro", "recruit", "notice"].includes(tab) ? tab : "intro";
  };
  const [activeTab, setActiveTab] = useState(getInitialTab);

  const [hasFetchedData, setHasFetchedData] = useState(false);
  const [hasRecruitments, setHasRecruitments] = useState(true); // 🔧 모집공고 존재 여부

  // 🔧 WYSIWYG 에디터에서 getProcessedContent 함수를 받을 ref들
  const getProcessedContentRef = useRef(null); // 동아리 소개용
  const getRecruitmentProcessedContentRef = useRef(null); // 모집공고용

  // 동아리 이미지 로딩을 위한 훅
  const {
    imageUrl,
    loading: imageLoading,
    error: imageError,
  } = useClubImage(club?.profileImageName);

  // 편집 가능한 동아리 필드들의 상태
  const [clubFormData, setClubFormData] = useState({
    name: "",
    memberCount: 0,
    location: "",
    contactInfo: "",
    description: "", // 상세 소개 (WYSIWYG로 편집)
  });

  // 편집 가능한 모집공고 필드들의 상태
  const [recruitmentFormData, setRecruitmentFormData] = useState({
    title: "",
    content: "",
    recruitCount: 0,
    startDate: "",
    endDate: "",
    status: "RECRUITING",
    contactInfo: "",
  });

  // 🔧 동아리 타입에 따른 경로 생성 함수
  const getClubPath = (path) => {
    const basePath =
      clubType === "department" ? "/club/department" : "/club/central";
    return `${basePath}${path}`;
  };

  // 날짜를 input[type="date"] 형식으로 변환
  function formatDateForInput(dateString) {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 10); // YYYY-MM-DD
    } catch (error) {
      console.error("날짜 포맷 오류:", error);
      return "";
    }
  }

  // input 형식의 날짜를 ISO 문자열로 변환
  function formatDateForAPI(inputDate) {
    if (!inputDate) return null;
    try {
      // 날짜만 선택했으므로 시간은 00:00:00으로 설정
      return new Date(inputDate + "T00:00:00").toISOString();
    } catch (error) {
      console.error("API 날짜 포맷 오류:", error);
      return null;
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // 🔧 동아리 정보를 먼저 모집공고로 시도하고, 실패하면 동아리 API로 fallback
  const fetchClubAndRecruitmentData = useCallback(async () => {
    if (hasFetchedData) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasFetchedData(true);

      console.log(`🔍 편집용 동아리 모집공고 조회 시도: ${clubId}`);

      try {
        // 1단계: 모집공고 API로 동아리 정보 조회 시도
        const response = await recruitmentService.getClubRecruitments(clubId);
        const recruitmentData = response.data || response || [];

        console.log("✅ 편집용 모집공고 데이터:", recruitmentData);

        if (recruitmentData.length > 0) {
          // 모집공고가 있는 경우 - 기존 로직
          const clubData = recruitmentData[0].club;
          setClub(clubData);
          setClubFormData({
            name: clubData.name || "",
            memberCount: clubData.memberCount || 0,
            location: clubData.location || "",
            contactInfo: clubData.contactInfo || "",
            description: clubData.description || "",
          });

          // 모집공고 목록 설정
          setHasRecruitments(true);

          // 활성 모집공고 찾기 (RECRUITING 상태 우선, 없으면 첫 번째)
          const activeRecruitment =
            recruitmentData.find((r) => r.status === "RECRUITING") ||
            recruitmentData[0];
          setActiveRecruitment(activeRecruitment);

          // 모집공고 폼 데이터 설정
          setRecruitmentFormData({
            title: activeRecruitment?.title || "",
            content: activeRecruitment?.content || "",
            recruitCount: activeRecruitment?.recruitCount || 0,
            startDate: formatDateForInput(activeRecruitment?.startDate),
            endDate: formatDateForInput(activeRecruitment?.endDate),
            status: activeRecruitment?.status || "RECRUITING",
            contactInfo: activeRecruitment?.contactInfo || "",
          });

          console.log("✅ 편집용 동아리 정보 (모집공고 포함):", clubData);
          console.log("✅ 편집용 활성 모집공고:", activeRecruitment);
        } else {
          // 🔧 모집공고는 없지만 API 호출은 성공한 경우
          throw new Error("NO_RECRUITMENTS");
        }
      } catch (recruitmentError) {
        // 2단계: 모집공고 조회 실패 시 동아리 정보만 조회
        console.log(
          "📝 편집용 모집공고 조회 실패, 동아리 정보만 조회:",
          recruitmentError.message
        );

        const clubResponse = await clubService.getClubDetail(clubId);
        const clubData = clubResponse.data || clubResponse;

        setClub(clubData);
        setClubFormData({
          name: clubData.name || "",
          memberCount: clubData.memberCount || 0,
          location: clubData.location || "",
          contactInfo: clubData.contactInfo || "",
          description: clubData.description || "",
        });

        // 모집공고는 빈 배열로 설정
        setActiveRecruitment(null);
        setHasRecruitments(false);

        console.log("✅ 편집용 동아리 정보 (모집공고 없음):", clubData);
      }
    } catch (err) {
      console.error("❌ 편집용 데이터 조회 실패:", err);
      setError(err.message || "데이터를 불러오는 중 오류가 발생했습니다.");
      setHasFetchedData(false);
    } finally {
      setLoading(false);
    }
  }, [clubId, hasFetchedData]);

  useEffect(() => {
    if (!clubId) {
      setError("동아리 ID가 없습니다.");
      setLoading(false);
      return;
    }

    fetchClubAndRecruitmentData();
  }, [fetchClubAndRecruitmentData]);

  // clubId 변경시 상태 리셋
  useEffect(() => {
    setHasFetchedData(false);
    setClub(null);
    setActiveRecruitment(null);
    setError(null);
    setHasRecruitments(true);
  }, [clubId]);

  const handleClubInputChange = (field, value) => {
    setClubFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRecruitmentInputChange = (field, value) => {
    setRecruitmentFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 🔧 동아리 소개 에디터로부터 getProcessedContent 함수를 받는 콜백
  const handleGetProcessedContent = (getProcessedContentFn) => {
    getProcessedContentRef.current = getProcessedContentFn;
  };

  // 🔧 모집공고 에디터로부터 getProcessedContent 함수를 받는 콜백
  const handleGetRecruitmentProcessedContent = (getProcessedContentFn) => {
    getRecruitmentProcessedContentRef.current = getProcessedContentFn;
  };

  // 🔧 저장 시 현재 탭에 따라 다른 저장 함수 호출
  const handleSave = async () => {
    if (activeTab === "intro") {
      await handleClubSave();
    } else {
      await handleRecruitmentSave();
    }
  };

  // 🔧 동아리 정보 저장
  const handleClubSave = async () => {
    setSaving(true);
    try {
      console.log("💾 동아리 정보 업데이트 시작:", clubFormData);

      // 🔧 WYSIWYG 에디터에서 처리된 콘텐츠 가져오기 (Base64 이미지 → S3 변환)
      let processedDescription = clubFormData.description;

      if (getProcessedContentRef.current) {
        console.log("🖼️ 동아리 소개 이미지 S3 업로드 처리 중...");
        processedDescription = await getProcessedContentRef.current();
        console.log("✅ 동아리 소개 이미지 처리 완료");
      }

      // API 요청 형식에 맞게 데이터 변환
      const updateData = {
        name: clubFormData.name,
        type: club.type,
        category: club.category,
        description: processedDescription, // 🔧 처리된 설명 사용
        memberCount: clubFormData.memberCount,
        location: clubFormData.location,
        contactInfo: clubFormData.contactInfo,
        profileImageName: club.profileImageName,
      };

      console.log("📤 서버로 전송할 동아리 데이터:", updateData);

      // API 호출로 동아리 정보 업데이트
      await clubService.updateClub(clubId, updateData);

      console.log("✅ 동아리 정보 업데이트 성공");
      alert("동아리 정보가 성공적으로 업데이트되었습니다.");

      // 🔧 상세 페이지로 돌아갈 때, 원래 탭 정보를 쿼리 파라미터로 전달
      const fromTab = new URLSearchParams(location.search).get("fromTab");
      navigate(getClubPath(`/${clubId}?tab=${fromTab || "intro"}`));
    } catch (err) {
      console.error("❌ 동아리 정보 업데이트 실패:", err);
      setError(err.message || "동아리 정보 업데이트에 실패했습니다.");
      alert("오류가 발생했습니다: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // 🔧 모집공고 저장 (기존 수정 또는 신규 생성)
  const handleRecruitmentSave = async () => {
    setSaving(true);
    try {
      console.log("💾 모집공고 정보 업데이트/생성 시작:", recruitmentFormData);

      // 🔧 WYSIWYG 에디터에서 처리된 콘텐츠 가져오기 (Base64 이미지 → S3 변환)
      let processedContent = recruitmentFormData.content;

      if (getRecruitmentProcessedContentRef.current) {
        console.log("🖼️ 모집공고 이미지 S3 업로드 처리 중...");
        processedContent = await getRecruitmentProcessedContentRef.current();
        console.log("✅ 모집공고 이미지 처리 완료");
      }

      // API 요청 형식에 맞게 데이터 변환
      const requestData = {
        title: recruitmentFormData.title,
        content: processedContent, // 🔧 처리된 설명 사용
        recruitCount: recruitmentFormData.recruitCount,
        startDate: formatDateForAPI(recruitmentFormData.startDate),
        endDate: formatDateForAPI(recruitmentFormData.endDate),
        status: recruitmentFormData.status,
        contactInfo: recruitmentFormData.contactInfo,
      };

      console.log("📤 서버로 전송할 모집공고 데이터:", requestData);

      if (hasRecruitments && activeRecruitment?.id) {
        // 🔧 기존 모집공고 수정
        console.log("✏️ 기존 모집공고 수정:", activeRecruitment.id);
        await recruitmentService.updateRecruitment(
          activeRecruitment.id,
          requestData
        );
        console.log("✅ 모집공고 수정 성공");
      } else {
        // 🔧 새 모집공고 생성
        console.log("➕ 새 모집공고 생성 for clubId:", clubId);
        const response = await recruitmentService.createRecruitmentForClub(
          clubId,
          requestData
        );
        console.log("✅ 모집공고 생성 성공:", response);

        // 생성 후 상태 업데이트
        setHasRecruitments(true);
        setActiveRecruitment(response.data || response);
      }

      console.log("✅ 모집공고 업데이트 완료");
      alert("모집공고가 성공적으로 업데이트되었습니다.");

      // 🔧 상세 페이지로 돌아갈 때, 원래 탭 정보를 쿼리 파라미터로 전달
      const fromTab = new URLSearchParams(location.search).get("fromTab");
      navigate(getClubPath(`/${clubId}?tab=${fromTab || "recruit"}`));
    } catch (err) {
      console.error("❌ 모집공고 업데이트 실패:", err);
      setError(err.message || "모집공고 업데이트에 실패했습니다.");
      alert("오류가 발생했습니다: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // 🔧 취소 시에도 원래 탭 정보를 가지고 상세 페이지로 돌아감
    const fromTab = new URLSearchParams(location.search).get("fromTab");
    navigate(getClubPath(`/${clubId}?tab=${fromTab || "intro"}`));
  };

  // 🔧 공지사항 생성 후 데이터 새로 가져오기
  const handleNoticeCreated = useCallback(() => {
    console.log("🔄 공지사항 생성 완료 - 상세 페이지로 이동");
    // 공지사항 생성 후 상세 페이지로 이동
    navigate(getClubPath(`/${clubId}`));
  }, [clubId, navigate, getClubPath]);

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
              동아리 정보를 불러오는 중...
            </CustomText>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 에러 상태
  if (error || !club) {
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
              {error || "동아리를 찾을 수 없습니다"}
            </CustomText>
            <button
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={() => navigate(getClubPath(""))}
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
      {/* 🔧 스크롤바로 인한 레이아웃 변화 방지 */}
      <style jsx global>{`
        html {
          overflow-y: scroll;
        }
      `}</style>

      <div className="relative z-10">
        <TopNavigator />
      </div>

      {/* 헤더 영역 */}
      <div className="w-full bg-white border-b">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
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
            <div>
              <CustomText
                font="pretendard-700"
                className="text-2xl mb-2"
                style={{ color: colors.black }}
              >
                동아리 정보 편집
              </CustomText>
              <CustomText
                font="pretendard-500"
                className="text-base"
                style={{ color: colors.darkGray }}
              >
                {club.name} 정보를 수정하세요
              </CustomText>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow flex justify-center">
        <div className="max-w-screen-lg w-full pb-24 sm:px-6 lg:px-8">
          <div className="px-4">
            {/* 🔧 탭 추가 - 모집공고가 없으면 신입모집 탭 비활성화 */}
            <ClubTabs activeTab={activeTab} onTabChange={handleTabChange} />

            <div className="mt-8">
              {/* 🔧 탭에 따른 편집 컴포넌트 렌더링 */}
              {activeTab === "intro" && (
                <ClubIntroEdit
                  clubFormData={clubFormData}
                  onInputChange={handleClubInputChange}
                  clubId={clubId}
                  onGetProcessedContent={handleGetProcessedContent}
                />
              )}

              {activeTab === "recruit" && (
                <RecruitmentEdit
                  recruitmentFormData={recruitmentFormData}
                  onInputChange={handleRecruitmentInputChange}
                  clubId={clubId}
                  onGetProcessedContent={handleGetRecruitmentProcessedContent}
                />
              )}

              {activeTab === "notice" && (
                <NoticeInfo
                  clubId={clubId}
                  onNoticeCreated={handleNoticeCreated}
                />
              )}

              {/* 🔧 공통 저장/취소 버튼 - 동아리 소개 탭이거나 신입모집 탭(모집공고 작성/수정 가능)일 때 표시 */}
              {(activeTab === "intro" ||
                activeTab === "recruit" ||
                activeTab === "notice") && (
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={saving}
                  >
                    취소
                  </button>
                  {/* 공지사항 탭에서는 저장 버튼 숨김 (NoticeInfo 컴포넌트 내부에 있음) */}
                  {(activeTab === "intro" || activeTab === "recruit") && (
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          저장 중...
                        </>
                      ) : activeTab === "recruit" && !hasRecruitments ? (
                        "모집공고 생성"
                      ) : (
                        "저장"
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CentralClubEdit;
