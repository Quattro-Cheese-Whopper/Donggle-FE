import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import TopNavigator from "../../utils/navigate/TopNavigator";
import Footer from "../../utils/footer/BottomFooter";
import CustomText from "../../utils/CustomText";
import colors from "../../constants/colors";
import ClubTabs from "../tabs/ClubTabs";
import { ClubInfoBoard } from "../info/ClubInfo";
import { RecruitmentInfoBoard } from "../info/RecruitmentInfo";
import { NoticeBoard } from "../notice/Notice";
import S3HtmlRenderer from "../editor/S3HtmlRenderer";
import { useAuth } from "../../hooks/useAuth";
import { useClubImage } from "../../hooks/useClubImage";
import { recruitmentService } from "../../api/services/recruitmentService";
import { clubService } from "../../api/services/clubService";
import { announceService } from "../../api/services/announceService";

const ClubDetail = ({ clubType = "central" }) => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [club, setClub] = useState(null);
  const [activeRecruitment, setActiveRecruitment] = useState(null);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("intro");
  const [hasFetchedData, setHasFetchedData] = useState(false);
  const [hasFetchedMyClubs, setHasFetchedMyClubs] = useState(false);
  const [hasRecruitments, setHasRecruitments] = useState(true);
  const [noticesLoading, setNoticesLoading] = useState(false);
  const [noticesError, setNoticesError] = useState(null);

  const { isLoggedIn, isMyClub, fetchMyClubs, myClubs } = useAuth();

  const {
    imageUrl,
    loading: imageLoading,
    error: imageError,
  } = useClubImage(club?.profileImageName);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // 편집 페이지로 이동 (동적 URL 생성)
  const handleEditClick = () => {
    const editPath = clubType === "central" ? "central" : "department";
    navigate(`/club/${editPath}/${clubId}/edit`);
  };

  // 공지사항 데이터 가져오기
  const fetchNotices = useCallback(async () => {
    if (!clubId) return;

    try {
      setNoticesLoading(true);
      setNoticesError(null);

      console.log(`📢 동아리 ${clubId} 공지사항 조회 시작`);

      const response = await announceService.getRecentAnnouncesByClub(clubId);
      const noticesData = response.data || response || [];

      console.log(`✅ 동아리 ${clubId} 공지사항 조회 성공:`, noticesData);

      setNotices(noticesData);
    } catch (err) {
      console.error(`❌ 동아리 ${clubId} 공지사항 조회 실패:`, err);
      setNoticesError(err.message);
      setNotices([]);
    } finally {
      setNoticesLoading(false);
    }
  }, [clubId]);

  // 공지사항 탭이 활성화될 때 공지사항 데이터 가져오기
  useEffect(() => {
    if (activeTab === "notice" && clubId) {
      fetchNotices();
    }
  }, [activeTab, clubId, fetchNotices]);

  // 🔧 동아리 정보를 먼저 모집공고로 시도하고, 실패하면 동아리 API로 fallback
  const fetchClubAndRecruitmentData = useCallback(async () => {
    if (hasFetchedData) {
      console.log(`⏭️ 이미 데이터를 가져왔음, 스킵`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasFetchedData(true);

      console.log(`🔍 동아리 모집공고 조회 시도: ${clubId}`);

      try {
        // 1단계: 모집공고 API로 동아리 정보 조회 시도
        const response = await recruitmentService.getClubRecruitments(clubId);
        const recruitmentData = response.data || response || [];

        console.log("✅ 모집공고 데이터:", recruitmentData);

        if (recruitmentData.length > 0) {
          // 모집공고가 있는 경우 - 기존 로직
          const clubData = recruitmentData[0].club;
          setClub(clubData);
          setHasRecruitments(true);

          // 활성 모집공고 찾기 (RECRUITING 상태 우선, 없으면 첫 번째)
          const activeRecruitment =
            recruitmentData.find((r) => r.status === "RECRUITING") ||
            recruitmentData[0];
          setActiveRecruitment(activeRecruitment);

          console.log("✅ 동아리 정보 (모집공고 포함):", clubData);
          console.log("✅ 활성 모집공고:", activeRecruitment);
        } else {
          // 🔧 모집공고는 없지만 API 호출은 성공한 경우
          throw new Error("NO_RECRUITMENTS");
        }
      } catch (recruitmentError) {
        // 2단계: 모집공고 조회 실패 시 동아리 정보만 조회
        console.log(
          "📝 모집공고 조회 실패, 동아리 정보만 조회:",
          recruitmentError.message
        );

        const clubResponse = await clubService.getClubDetail(clubId);
        const clubData = clubResponse.data || clubResponse;

        setClub(clubData);
        setHasRecruitments(false);
        setActiveRecruitment(null);

        console.log("✅ 동아리 정보 (모집공고 없음):", clubData);
      }
    } catch (err) {
      console.error("❌ 동아리 정보 조회 실패:", err);
      setError(err.message || "동아리 정보를 불러오는 중 오류가 발생했습니다.");
      setHasFetchedData(false);
    } finally {
      setLoading(false);
    }
  }, [clubId, hasFetchedData, location.pathname]);

  // 내 동아리 정보 조회
  const fetchMyClubsOnce = useCallback(async () => {
    if (hasFetchedMyClubs || !isLoggedIn || myClubs.length > 0) {
      return;
    }

    try {
      console.log("🏢 동아리 상세 페이지에서 내 동아리 정보 조회");
      setHasFetchedMyClubs(true);

      await fetchMyClubs();
    } catch (error) {
      console.warn(
        "⚠️ 내 동아리 정보 조회 실패 (토큰 만료 가능성):",
        error.message
      );
      setHasFetchedMyClubs(false);
    }
  }, [isLoggedIn, myClubs.length, fetchMyClubs, hasFetchedMyClubs]);

  // 데이터 가져오기
  useEffect(() => {
    if (!clubId) {
      setError("동아리 ID가 없습니다.");
      setLoading(false);
      return;
    }

    fetchClubAndRecruitmentData();
  }, [clubId, fetchClubAndRecruitmentData]);

  // 내 동아리 정보 조회
  useEffect(() => {
    fetchMyClubsOnce();
  }, [fetchMyClubsOnce]);

  // clubId 변경시 상태 리셋
  useEffect(() => {
    setHasFetchedData(false);
    setClub(null);
    setActiveRecruitment(null);
    setNotices([]);
    setError(null);
    setHasRecruitments(true);
  }, [clubId]);

  // 🔧 편집 페이지에서 돌아왔을 때 데이터 새로 가져오기
  useEffect(() => {
    // 편집 페이지에서 돌아왔는지 확인 (URL에 /edit이 없고, 이전에 데이터를 가져온 상태)
    if (hasFetchedData && !location.pathname.includes("/edit")) {
      console.log("🔄 편집 후 돌아옴 - 데이터 새로 가져오기");
      setHasFetchedData(false);
    }
  }, [location.pathname, hasFetchedData]);

  const handleGoBack = () => {
    navigate(-1);
  };

  // 🔧 내가 관리하는 동아리인지 확인
  const canEdit = isLoggedIn && isMyClub(parseInt(clubId));

  // 공지사항 데이터를 컴포넌트에서 사용할 형태로 변환
  const formatNoticesForDisplay = (notices) => {
    if (!notices || !Array.isArray(notices)) {
      return [];
    }

    return notices.map((notice) => ({
      id: notice.id,
      title: notice.title || "제목 없음",
      date: notice.createdAt
        ? new Date(notice.createdAt)
            .toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
            .replace(/\./g, ".")
        : "날짜 없음",
    }));
  };

  // 공지사항 클릭 핸들러
  const handleNoticeClick = (announceId) => {
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
              onClick={handleGoBack}
            >
              뒤로 가기
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

      <div className="w-full bg-white">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-6">
                {/* 동아리 이미지 렌더링 */}
                {imageLoading ? (
                  <div className="w-28 h-28 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : imageError || !imageUrl ? (
                  <div className="w-28 h-28 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-400"
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
                    className="w-28 h-28 object-cover rounded-lg"
                  />
                )}
              </div>
              <div>
                <CustomText
                  font="pretendard-700"
                  className="text-2xl mb-2"
                  style={{ color: colors.black }}
                >
                  {club.name}
                </CustomText>
                <CustomText
                  font="pretendard-500"
                  className="text-base mb-1"
                  style={{ color: colors.darkGray }}
                >
                  {club.type === "CENTRAL"
                    ? "중앙동아리"
                    : club.department || club.type}
                </CustomText>
                <CustomText
                  font="pretendard-500"
                  className="text-base"
                  style={{ color: colors.darkGray }}
                >
                  {club.category}
                </CustomText>

                {/* 🔧 활성 모집공고가 있으면 모집 상태 표시, 없으면 표시 안함 */}
                {hasRecruitments && activeRecruitment && (
                  <div className="my-2">
                    <div
                      className="px-3 py-1 rounded-lg inline-block"
                      style={{
                        backgroundColor:
                          activeRecruitment.status === "RECRUITING"
                            ? colors.primary
                            : activeRecruitment.status === "ALWAYS_RECRUITING"
                            ? colors.lightBlue
                            : colors.lightGray,
                      }}
                    >
                      <CustomText
                        font="pretendard-400"
                        className="text-xs"
                        style={{
                          color:
                            activeRecruitment.status === "COMPLETED"
                              ? colors.mediumGray
                              : colors.white,
                          margin: 0,
                        }}
                      >
                        {activeRecruitment.status === "RECRUITING"
                          ? "모집중"
                          : activeRecruitment.status === "ALWAYS_RECRUITING"
                          ? "상시모집"
                          : "모집종료"}
                      </CustomText>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow flex justify-center">
        <div className="max-w-screen-lg w-full pb-24 sm:px-6 lg:px-8">
          <div className="px-4">
            <ClubTabs activeTab={activeTab} onTabChange={handleTabChange} />
            <div className="mt-8">
              <CustomText
                font="pretendard-700"
                className="text-xl mb-4"
                style={{ color: colors.black }}
              >
                {activeTab === "intro"
                  ? "동아리 정보"
                  : activeTab === "recruit"
                  ? "모집 요강"
                  : "공지사항"}
              </CustomText>

              {/* 탭에 따른 내용 표시 */}
              {activeTab === "intro" && (
                <>
                  {/* 🔧 탭에 따른 정보 보드 표시 */}
                  <ClubInfoBoard club={club} style="introduce" />

                  {/* 동아리 소개 */}
                  {club.description ? (
                    <div className="mt-6">
                      <CustomText
                        font="pretendard-700"
                        className="text-lg mb-4"
                        style={{ color: colors.black }}
                      >
                        동아리 소개
                      </CustomText>
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <S3HtmlRenderer
                          htmlContent={club.description}
                          className="prose prose-lg max-w-none leading-relaxed"
                        />
                      </div>
                    </div>
                  ) : (
                    // 🔧 동아리 소개가 없는 경우
                    <div className="mt-6">
                      <CustomText
                        font="pretendard-700"
                        className="text-lg mb-4"
                        style={{ color: colors.black }}
                      >
                        동아리 소개
                      </CustomText>
                      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                        <CustomText
                          font="pretendard-500"
                          className="text-base"
                          style={{ color: colors.darkGray }}
                        >
                          동아리 소개가 작성되지 않았습니다.
                        </CustomText>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === "recruit" && (
                <>
                  {/* 🔧 탭에 따른 정보 보드 표시 */}
                  {hasRecruitments ? (
                    <RecruitmentInfoBoard recruitment={activeRecruitment} />
                  ) : (
                    <div className="rounded-lg border border-gray-200 bg-white py-8 px-7 text-center">
                      <CustomText
                        font="pretendard-500"
                        className="text-base"
                        style={{ color: colors.darkGray }}
                      >
                        현재 진행 중인 모집공고가 작성되지 않았습니다.
                      </CustomText>
                    </div>
                  )}

                  {/* 모집 상세 정보 */}
                  {hasRecruitments && activeRecruitment ? (
                    <div className="mt-6">
                      <CustomText
                        font="pretendard-700"
                        className="text-lg mb-4"
                        style={{ color: colors.black }}
                      >
                        모집 상세 정보
                      </CustomText>
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        {activeRecruitment.content ? (
                          <S3HtmlRenderer
                            htmlContent={activeRecruitment.content}
                            className="prose prose-lg max-w-none leading-relaxed"
                          />
                        ) : (
                          <CustomText
                            font="pretendard-500"
                            className="text-base text-center"
                            style={{ color: colors.darkGray }}
                          >
                            모집 상세 정보가 작성되지 않았습니다.
                          </CustomText>
                        )}
                      </div>
                    </div>
                  ) : (
                    // 🔧 모집공고가 없는 경우
                    <div className="mt-6">
                      <CustomText
                        font="pretendard-700"
                        className="text-lg mb-4"
                        style={{ color: colors.black }}
                      >
                        모집 상세 정보
                      </CustomText>
                      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                        <CustomText
                          font="pretendard-500"
                          className="text-base"
                          style={{ color: colors.darkGray }}
                        >
                          모집 상세 정보가 작성되지 않았습니다.
                        </CustomText>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === "notice" && (
                <>
                  {/* 공지사항 로딩 상태 */}
                  {noticesLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="text-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <CustomText
                          font="pretendard-500"
                          className="text-sm"
                          style={{ color: colors.darkGray }}
                        >
                          공지사항을 불러오는 중...
                        </CustomText>
                      </div>
                    </div>
                  ) : noticesError ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 2L2 7L12 12L22 7L12 2Z"
                              stroke="#EF4444"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M2 17L12 22L22 17"
                              stroke="#EF4444"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M2 12L12 17L22 12"
                              stroke="#EF4444"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <CustomText
                          font="pretendard-600"
                          className="text-base mb-1"
                          style={{ color: colors.black }}
                        >
                          공지사항을 불러올 수 없습니다
                        </CustomText>
                        <CustomText
                          font="pretendard-400"
                          className="text-sm"
                          style={{ color: colors.darkGray }}
                        >
                          {noticesError}
                        </CustomText>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* 공지사항 목록 */}
                      <NoticeBoard
                        title="동아리 공지사항"
                        notices={formatNoticesForDisplay(notices)}
                        moreLink={`/announces?type=CLUB&clubId=${clubId}`}
                        type="club"
                        onNoticeClick={handleNoticeClick}
                      />

                      {/* 최근 공지사항 상세 섹션 */}
                      {notices && notices.length > 0 && (
                        <div className="mt-8">
                          <CustomText
                            font="pretendard-700"
                            className="text-lg mb-4"
                            style={{ color: colors.black }}
                          >
                            최근 공지사항
                          </CustomText>
                          <div
                            className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all duration-200"
                            onClick={() => handleNoticeClick(notices[0].id)}
                          >
                            <div className="mb-4">
                              <CustomText
                                font="pretendard-600"
                                className="text-xl mb-2"
                                style={{ color: colors.black }}
                              >
                                {notices[0].title}
                              </CustomText>
                              <div className="flex items-center text-sm text-gray-500 mb-3">
                                <span className="mr-4">
                                  작성자:{" "}
                                  {notices[0].authorName || "알 수 없음"}
                                </span>
                                <span>
                                  {notices[0].createdAt
                                    ? new Date(notices[0].createdAt)
                                        .toLocaleDateString("ko-KR", {
                                          year: "numeric",
                                          month: "2-digit",
                                          day: "2-digit",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })
                                        .replace(/\./g, ".")
                                    : "날짜 없음"}
                                </span>
                              </div>
                            </div>
                            <div className="prose prose-lg max-w-none leading-relaxed">
                              {notices[0].content ? (
                                <S3HtmlRenderer
                                  htmlContent={notices[0].content}
                                  className="prose prose-lg max-w-none leading-relaxed"
                                />
                              ) : (
                                <CustomText
                                  font="pretendard-400"
                                  className="text-base"
                                  style={{ color: colors.darkGray }}
                                >
                                  공지사항 내용이 없습니다.
                                </CustomText>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 🔧 조건부 플로팅 편집 버튼 - 내가 관리하는 동아리인 경우에만 표시 */}
      {canEdit && (
        <button
          onClick={handleEditClick}
          className="fixed bottom-16 w-14 h-14 bg-green-700 text-white rounded-full shadow-lg hover:bg-green-800 hover:shadow-xl transition-all duration-200 z-50 flex items-center justify-center group"
          style={{
            right: `max(24px, calc((100vw - 896px) / 2 + 24px))`,
          }}
          title="동아리 정보 편집"
        >
          <svg
            className="w-6 h-6 transform group-hover:scale-110 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>

          {/* 호버시 나타나는 툴팁 */}
          <div className="absolute bottom-16 right-0 bg-gray-800 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            편집하기
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        </button>
      )}

      <Footer />
    </div>
  );
};

export default ClubDetail;
