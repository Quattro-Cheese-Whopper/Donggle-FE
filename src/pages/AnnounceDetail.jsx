import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopNavigator from "../utils/navigate/TopNavigator";
import Footer from "../utils/footer/BottomFooter";
import CustomText from "../utils/CustomText";
import colors from "../constants/colors";
import { announceService } from "../api/services/announceService";
import { clubService } from "../api/services/clubService";
import { useClubImage } from "../hooks/useClubImage";
import S3HtmlRenderer from "../components/editor/S3HtmlRenderer";

const AnnounceDetail = () => {
  const { announceId } = useParams();
  const navigate = useNavigate();
  const [announce, setAnnounce] = useState(null);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 동아리 이미지 훅
  const {
    imageUrl,
    loading: imageLoading,
    error: imageError,
  } = useClubImage(club?.profileImageName);

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

      console.log(`📢 공지사항 ${announceId} 상세 조회 시작`);

      const response = await announceService.getAnnounce(announceId);
      const announceData = response.data || response;

      console.log(`✅ 공지사항 ${announceId} 상세 조회 성공:`, announceData);

      setAnnounce(announceData);

      // 동아리 공지사항인 경우 동아리 정보도 조회
      if (announceData.type === "CLUB" && announceData.clubId) {
        try {
          console.log(`🏢 동아리 ${announceData.clubId} 정보 조회 시작`);
          const clubResponse = await clubService.getClubDetail(
            announceData.clubId
          );
          const clubData = clubResponse.data || clubResponse;
          console.log(
            `✅ 동아리 ${announceData.clubId} 정보 조회 성공:`,
            clubData
          );
          setClub(clubData);
        } catch (clubError) {
          console.warn(`⚠️ 동아리 정보 조회 실패:`, clubError);
          // 동아리 정보 조회 실패는 전체 에러로 처리하지 않음
        }
      }
    } catch (err) {
      console.error(`❌ 공지사항 ${announceId} 상세 조회 실패:`, err);
      setError(err.message || "공지사항을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 뒤로 가기
  const handleGoBack = () => {
    navigate(-1);
  };

  // 목록으로 가기
  const handleGoToList = () => {
    const type = announce?.type || "GENERAL";
    navigate(`/announces?type=${type}`);
  };

  // 동아리 상세 페이지로 이동
  const handleClubClick = () => {
    if (club) {
      const clubType = club.type === "CENTRAL" ? "central" : "department";
      navigate(`/club/${clubType}/${club.id}`);
    }
  };

  // 데이터 조회
  useEffect(() => {
    fetchAnnounceDetail();
  }, [announceId]);

  // 동아리 프로필 카드 컴포넌트
  const ClubProfileCard = () => {
    if (!club || announce?.type !== "CLUB") return null;

    return (
      <div
        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleClubClick}
      >
        <div className="flex items-center space-x-4">
          {/* 좌측: 이미지와 동아리명 */}
          <div className="flex-shrink-0">
            {imageLoading ? (
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : imageError || !imageUrl ? (
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
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
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
          </div>

          {/* 우측: 동아리 정보와 상세보기 */}
          <div className="flex-1 min-w-0">
            <CustomText
              font="pretendard-600"
              className="text-base mb-1 truncate"
              style={{ color: colors.black }}
            >
              {club.name}
            </CustomText>
            <CustomText
              font="pretendard-500"
              className="text-sm mb-1"
              style={{ color: colors.darkGray }}
            >
              {club.type === "CENTRAL"
                ? "중앙동아리"
                : club.department || club.type}
            </CustomText>
            <CustomText
              font="pretendard-500"
              className="text-sm mb-2"
              style={{ color: colors.darkGray }}
            >
              {club.category}
            </CustomText>

            {/* 동아리 상세보기 버튼 */}
            <div className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
              <span className="text-xs font-medium mr-1">동아리 상세보기</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 6L15 12L9 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
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
              className="text-lg mb-4"
              style={{ color: colors.black }}
            >
              {error || "공지사항을 찾을 수 없습니다"}
            </CustomText>
            <div className="flex justify-center space-x-4">
              <button
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                onClick={handleGoBack}
              >
                뒤로 가기
              </button>
              <button
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                onClick={handleGoToList}
              >
                목록으로
              </button>
            </div>
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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleGoBack}
                    className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19 12H5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 19L5 12L12 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="ml-2">뒤로</span>
                  </button>
                  <button
                    onClick={handleGoToList}
                    className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 6L15 12L9 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="ml-2">목록</span>
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  {announce.pinned && (
                    <span className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded-full">
                      고정
                    </span>
                  )}
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                    {announce.type === "GENERAL" ? "일반" : "동아리"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8">
                {/* 좌측: 제목 및 메타데이터 */}
                <div className="flex-1">
                  <CustomText
                    font="pretendard-700"
                    className="text-3xl mb-4"
                    style={{ color: colors.black }}
                  >
                    {announce.title}
                  </CustomText>
                  <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-6 gap-y-2">
                    <span>작성자: {announce.authorName || "알 수 없음"}</span>
                    {announce.clubName && (
                      <span>동아리: {announce.clubName}</span>
                    )}
                    <span>
                      작성일:{" "}
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
                    {announce.updatedAt &&
                      announce.updatedAt !== announce.createdAt && (
                        <span>
                          수정일:{" "}
                          {new Date(announce.updatedAt)
                            .toLocaleDateString("ko-KR", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                            .replace(/\./g, ".")}
                        </span>
                      )}
                  </div>
                </div>

                {/* 우측: 동아리 프로필 카드 */}
                {announce.type === "CLUB" && (
                  <div className="lg:w-80 flex-shrink-0 w-full">
                    <ClubProfileCard />
                  </div>
                )}
              </div>
            </div>

            {/* 공지사항 내용 */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 mt-8">
              {announce.content ? (
                <div className="prose prose-lg max-w-none leading-relaxed">
                  <S3HtmlRenderer
                    htmlContent={announce.content}
                    className="prose prose-lg max-w-none leading-relaxed"
                  />
                </div>
              ) : (
                <div className="text-center py-12">
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
                    공지사항 내용이 없습니다
                  </CustomText>
                  <CustomText
                    font="pretendard-400"
                    className="text-sm"
                    style={{ color: colors.mediumGray }}
                  >
                    작성된 내용이 없습니다
                  </CustomText>
                </div>
              )}
            </div>

            {/* 하단 네비게이션 */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleGoBack}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 12H5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 19L5 12L12 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="ml-2">이전</span>
              </button>
              <button
                onClick={handleGoToList}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <span className="mr-2">목록으로</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 6L15 12L9 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AnnounceDetail;
