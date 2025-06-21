import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import TopNavigator from "../utils/navigate/TopNavigator";
import Footer from "../utils/footer/BottomFooter";
import CustomText from "../utils/CustomText";
import colors from "../constants/colors";
import { announceService } from "../api/services/announceService";
import { useAuth } from "../hooks/useAuth";
import S3HtmlRenderer from "../components/editor/S3HtmlRenderer";

const AnnounceList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [announces, setAnnounces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  const navigate = useNavigate();

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

  // URL 파라미터에서 타입과 동아리 ID 가져오기 (기본값: GENERAL)
  const type = searchParams.get("type") || "GENERAL";
  const clubId = searchParams.get("clubId");

  // 🔧 내 동아리 정보 조회 (동아리별 공지사항 조회인 경우)
  const fetchMyClubsOnce = useCallback(async () => {
    if (clubId && type === "CLUB" && isLoggedIn && myClubs.length === 0) {
      try {
        console.log("🏢 동아리 공지사항 목록에서 내 동아리 정보 조회");
        await fetchMyClubs();
      } catch (error) {
        console.warn("⚠️ 내 동아리 정보 조회 실패:", error.message);
      }
    }
  }, [clubId, type, isLoggedIn, myClubs.length, fetchMyClubs]);

  // 공지사항 목록 조회
  const fetchAnnounces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        `📢 ${type} 타입 공지사항 목록 조회 시작 (페이지: ${currentPage})`
      );

      let response;

      if (clubId && type === "CLUB") {
        // 동아리별 공지사항 목록 조회
        response = await announceService.getAnnouncesByClub(clubId, {
          page: currentPage,
          size: pageSize,
          sort: ["createdAt,desc"],
        });
      } else {
        // 타입별 공지사항 목록 조회
        response = await announceService.getAnnouncesByType(type, {
          page: currentPage,
          size: pageSize,
          sort: ["createdAt,desc"],
        });
      }

      const data = response.data || response;
      const content = data.content || [];
      const totalPagesCount = data.totalPages || 0;
      const totalElementsCount = data.totalElements || 0;

      console.log(`✅ ${type} 타입 공지사항 목록 조회 성공:`, {
        content: content.length,
        totalPages: totalPagesCount,
        totalElements: totalElementsCount,
      });

      setAnnounces(content);
      setTotalPages(totalPagesCount);
      setTotalElements(totalElementsCount);
    } catch (err) {
      console.error(`❌ ${type} 타입 공지사항 목록 조회 실패:`, err);
      setError(err.message || "공지사항을 불러오는 중 오류가 발생했습니다.");
      setAnnounces([]);
    } finally {
      setLoading(false);
    }
  }, [type, clubId, currentPage, pageSize]);

  // 타입 변경 시 페이지 리셋
  const handleTypeChange = (newType) => {
    setSearchParams({ type: newType });
    setCurrentPage(0);
  };

  // 페이지 변경
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // 공지사항 클릭 핸들러
  const handleAnnounceClick = (announceId) => {
    navigate(`/announces/${announceId}`);
  };

  // 공지사항 작성 페이지로 이동
  const handleCreateAnnounce = () => {
    if (clubId && type === "CLUB") {
      // 동아리별 공지사항 작성 페이지로 이동
      navigate(`/announces/create?clubId=${clubId}`);
    } else {
      // 일반 공지사항 작성 페이지로 이동
      navigate("/announces/create");
    }
  };

  // 내 사용자 정보 조회
  useEffect(() => {
    if (isLoggedIn && !user) {
      fetchCurrentUser();
    }
  }, [isLoggedIn, user, fetchCurrentUser]);

  // 🔧 내 동아리 정보 조회 (동아리별 공지사항 조회인 경우)
  useEffect(() => {
    fetchMyClubsOnce();
  }, [fetchMyClubsOnce]);

  // 데이터 조회
  useEffect(() => {
    fetchAnnounces();
  }, [fetchAnnounces]);

  // 타입 변경 시 데이터 리셋
  useEffect(() => {
    setCurrentPage(0);
  }, [type]);

  // 🔧 동아리 관리자 권한 확인 (동아리별 공지사항 조회인 경우)
  const canCreateClubAnnounce =
    clubId &&
    type === "CLUB" &&
    isLoggedIn &&
    myClubs.length > 0 &&
    isMyClub(parseInt(clubId));

  // 페이지네이션 컴포넌트
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const startPage = Math.max(0, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);

    // 이전 페이지 버튼
    if (currentPage > 0) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-l-lg hover:bg-gray-50 transition-colors"
        >
          이전
        </button>
      );
    }

    // 페이지 번호들
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm border-t border-b border-gray-300 ${
            i === currentPage
              ? "bg-blue-500 text-white border-blue-500"
              : "hover:bg-gray-50 transition-colors"
          }`}
        >
          {i + 1}
        </button>
      );
    }

    // 다음 페이지 버튼
    if (currentPage < totalPages - 1) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-r-lg hover:bg-gray-50 transition-colors"
        >
          다음
        </button>
      );
    }

    return (
      <div className="flex justify-center mt-8">
        <div className="flex">{pages}</div>
      </div>
    );
  };

  // 로딩 상태
  if (loading && announces.length === 0) {
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

  return (
    <div className="min-h-screen flex flex-col bg-white-50">
      <div className="relative z-10">
        <TopNavigator />
      </div>

      <main className="flex-grow flex justify-center">
        <div className="max-w-screen-lg w-full py-6 sm:px-6 lg:px-8">
          <div className="px-4">
            {/* 헤더 */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <CustomText
                  font="pretendard-700"
                  className="text-3xl"
                  style={{ color: colors.black }}
                >
                  {clubId && type === "CLUB" ? "동아리 공지사항" : "공지사항"}
                </CustomText>

                {/* 🔧 관리자 권한일 때 공지사항 작성 버튼 */}
                {/* 일반 공지사항: ADMIN 권한 */}
                {/* 동아리 공지사항: 해당 동아리 관리자 권한 */}
                {(isAdmin() && type === "GENERAL") || canCreateClubAnnounce ? (
                  <button
                    onClick={handleCreateAnnounce}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    공지사항 작성
                  </button>
                ) : null}
              </div>

              {/* 타입 필터 - 동아리별 조회가 아닐 때만 표시 */}
              {!clubId && (
                <div className="flex space-x-4 mb-6">
                  <button
                    onClick={() => handleTypeChange("GENERAL")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      type === "GENERAL"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    총동연 공지사항
                  </button>
                  <button
                    onClick={() => handleTypeChange("CLUB")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      type === "CLUB"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    동아리 공지사항
                  </button>
                </div>
              )}

              {/* 결과 개수 */}
              <CustomText
                font="pretendard-500"
                className="text-sm"
                style={{ color: colors.darkGray }}
              >
                총 {totalElements}개의 공지사항
              </CustomText>
            </div>

            {/* 에러 상태 */}
            {error && (
              <div className="flex justify-center items-center py-12">
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
                    className="text-lg mb-2"
                    style={{ color: colors.black }}
                  >
                    공지사항을 불러올 수 없습니다
                  </CustomText>
                  <CustomText
                    font="pretendard-400"
                    className="text-sm"
                    style={{ color: colors.darkGray }}
                  >
                    {error}
                  </CustomText>
                </div>
              </div>
            )}

            {/* 공지사항 목록 */}
            {!error && (
              <div className="space-y-4">
                {announces.length > 0 ? (
                  announces.map((announce) => (
                    <div
                      key={announce.id}
                      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleAnnounceClick(announce.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <CustomText
                            font="pretendard-600"
                            className="text-lg mb-2"
                            style={{ color: colors.black }}
                          >
                            {announce.title}
                          </CustomText>
                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span>
                              작성자: {announce.authorName || "알 수 없음"}
                            </span>
                            {announce.clubName && (
                              <span>동아리: {announce.clubName}</span>
                            )}
                            <span>
                              {announce.createdAt
                                ? new Date(announce.createdAt)
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
                        {announce.pinned && (
                          <div className="ml-4">
                            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                              고정
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 공지사항 내용 미리보기 */}
                      {announce.content && (
                        <div className="mt-3">
                          <div className="prose prose-sm max-w-none text-gray-600 line-clamp-3">
                            <S3HtmlRenderer
                              htmlContent={announce.content}
                              className="prose prose-sm max-w-none text-gray-600"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 mx-auto">
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
                        className="text-lg mb-1"
                        style={{ color: colors.darkGray }}
                      >
                        공지사항이 없습니다
                      </CustomText>
                      <CustomText
                        font="pretendard-400"
                        className="text-sm"
                        style={{ color: colors.mediumGray }}
                      >
                        새로운 공지사항을 기다려주세요
                      </CustomText>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 페이지네이션 */}
            <Pagination />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AnnounceList;
