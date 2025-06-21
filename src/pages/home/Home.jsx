import React, { useEffect, useState } from "react";
import TopNavigator from "../../utils/navigate/TopNavigator";
import Footer from "../../utils/footer/BottomFooter";
import JnuImage from "../../assets/전남대 풍경.png";
import { HorizontalClubCarousel } from "../../components/cards/ClubCard";
import { NoticeGrid } from "../../components/notice/Notice";
import { clubService } from "../../api/services/clubService";
import { announceService } from "../../api/services/announceService";
import { transformClubsCategories } from "../../utils/categoryMapper";
import CustomText from "../../utils/CustomText";
import colors from "../../constants/colors";

const Home = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 공지사항 상태 추가
  const [generalNotices, setGeneralNotices] = useState([]);
  const [clubNotices, setClubNotices] = useState([]);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const [noticesError, setNoticesError] = useState(null);

  // 중앙동아리 데이터 가져오기
  useEffect(() => {
    const fetchCentralClubs = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🏠 홈페이지에서 중앙동아리 목록 조회");

        const response = await clubService.getClubsByType("CENTRAL");
        const rawClubsData = response.data || response.content || response;

        // 카테고리 변환 적용
        const transformedClubs = transformClubsCategories(rawClubsData);

        console.log("✅ 홈페이지 중앙동아리 목록:", transformedClubs);

        // 최대 12개 동아리만 표시 (캐러셀에서 4페이지)
        setClubs(transformedClubs.slice(0, 12));
      } catch (err) {
        console.error("❌ 홈페이지 중앙동아리 조회 실패:", err);
        setError(err.message);
        setClubs([]); // 에러시 빈 배열
      } finally {
        setLoading(false);
      }
    };

    fetchCentralClubs();
  }, []);

  // 공지사항 데이터 가져오기
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setNoticesLoading(true);
        setNoticesError(null);

        console.log("📢 홈페이지에서 공지사항 조회 시작");

        // 일반 공지사항과 동아리 공지사항을 병렬로 조회
        const [generalResponse, clubResponse] = await Promise.all([
          announceService.getRecentAnnouncesByType("GENERAL"),
          announceService.getRecentAnnouncesByType("CLUB"),
        ]);

        // 응답 데이터 처리
        const generalData = generalResponse.data || generalResponse || [];
        const clubData = clubResponse.data || clubResponse || [];

        console.log("✅ 일반 공지사항 조회 성공:", generalData);
        console.log("✅ 동아리 공지사항 조회 성공:", clubData);

        setGeneralNotices(generalData);
        setClubNotices(clubData);
      } catch (err) {
        console.error("❌ 홈페이지 공지사항 조회 실패:", err);
        setNoticesError(err.message);
        setGeneralNotices([]);
        setClubNotices([]);
      } finally {
        setNoticesLoading(false);
      }
    };

    fetchNotices();
  }, []);

  // 공지사항 데이터를 컴포넌트에서 사용할 형태로 변환
  const formatNoticesForDisplay = (notices) => {
    if (!notices || !Array.isArray(notices)) {
      return [];
    }

    return notices.map((notice) => ({
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

  const leftNotice = {
    title: "총동연 공지사항",
    moreLink: "#",
    items: formatNoticesForDisplay(generalNotices),
  };

  const rightNotice = {
    title: "동아리 공지사항",
    moreLink: "#",
    items: formatNoticesForDisplay(clubNotices),
  };

  // 공지사항 섹션 렌더링
  const renderNoticeSection = () => {
    if (noticesLoading) {
      return (
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
      );
    }

    if (noticesError) {
      return (
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
      );
    }

    // 에러가 없으면 항상 NoticeGrid를 렌더링
    // 각 보드에서 개별적으로 빈 상태를 처리
    return <NoticeGrid leftNotice={leftNotice} rightNotice={rightNotice} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="relative z-10">
        <TopNavigator />
      </div>
      <div className="w-full" style={{ marginTop: "-4px" }}>
        <img
          src={JnuImage}
          className="w-full object-cover"
          style={{
            height: "300px", // 비율 유지
          }}
          alt="전남대학교 풍경"
        />
      </div>

      {/* 메인 컨텐츠 */}
      <main className="flex-grow flex justify-center">
        <div className="max-w-7xl w-full py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* 동아리 캐러셀 섹션 */}
            <div className="mb-8">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <CustomText
                      font="pretendard-500"
                      className="text-base"
                      style={{ color: colors.darkGray }}
                    >
                      동아리 정보를 불러오는 중...
                    </CustomText>
                  </div>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <CustomText
                      font="pretendard-600"
                      className="text-lg mb-2"
                      style={{ color: colors.black }}
                    >
                      동아리 정보를 불러올 수 없습니다
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
              ) : clubs.length > 0 ? (
                <HorizontalClubCarousel clubs={clubs} clubType="central" />
              ) : (
                <div className="flex justify-center items-center py-12">
                  <CustomText
                    font="pretendard-500"
                    className="text-lg"
                    style={{ color: colors.darkGray }}
                  >
                    등록된 동아리가 없습니다
                  </CustomText>
                </div>
              )}
            </div>

            {/* 공지사항 섹션 */}
            <div className="mt-16 mb-12">{renderNoticeSection()}</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
