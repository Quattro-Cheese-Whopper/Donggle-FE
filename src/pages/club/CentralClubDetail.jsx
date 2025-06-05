import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopNavigator from '../../utils/navigate/TopNavigator';
import Footer from '../../utils/footer/BottomFooter';
import CustomText from '../../utils/CustomText';
import colors from '../../constants/colors';
import ClubTabs from '../../components/tabs/ClubTabs';
import { ClubInfoBoard } from '../../components/info/ClubInfo';
import { useAuth } from '../../hooks/useAuth';
import { clubService } from '../../api/services/clubService';

const CentralClubDetail = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('intro');

  const { isLoggedIn, isMyClub, fetchMyClubs, myClubs } = useAuth();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // 편집 페이지로 이동
  const handleEditClick = () => {
    navigate(`/club/central/${clubId}/edit`);
  };

  // 내 동아리 정보 조회 (로그인시 한 번만)
  useEffect(() => {
    if (isLoggedIn && myClubs.length === 0) {
      console.log('🏢 동아리 상세 페이지에서 내 동아리 정보 조회');
      fetchMyClubs();
    }
  }, [isLoggedIn]);

  // API를 통해 동아리 상세 정보 가져오기
  useEffect(() => {
    const fetchClubDetail = async () => {
      if (!clubId) {
        setError('동아리 ID가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔍 동아리 상세 정보 조회: ${clubId}`);
        
        const response = await clubService.getClubDetail(clubId);
        const clubData = response.data || response;
        
        console.log('✅ 동아리 상세 정보:', clubData);
        
        if (clubData) {
          setClub(clubData);
        } else {
          setError('동아리 정보를 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('❌ 동아리 상세 정보 조회 실패:', err);
        setError(err.message || '동아리 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchClubDetail();
  }, [clubId]);

  const handleGoBack = () => {
    navigate(-1);
  };

  // 🔧 내가 관리하는 동아리인지 확인
  const canEdit = isLoggedIn && isMyClub(parseInt(clubId));

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
              {error || '동아리를 찾을 수 없습니다'}
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
                {club.icon ? (
                  <img 
                    src={club.icon} 
                    alt={`${club.name} 로고`} 
                    className="w-28 h-28 object-contain"
                    onError={(e) => {
                      // 이미지 로드 실패시 기본 플레이스홀더 표시
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                {/* 기본 플레이스홀더 */}
                <div 
                  className="w-28 h-28 bg-gray-100 rounded-lg flex items-center justify-center"
                  style={{ display: club.icon ? 'none' : 'flex' }}
                >
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
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
                  className="text-base"
                  style={{ color: colors.darkGray }}
                >
                  {club.category}
                </CustomText>
                <div 
                  className="my-2 px-3 py-1 rounded-lg inline-block"
                  style={{ 
                    backgroundColor: club.isRecruiting ? colors.primary : colors.lightGray,
                  }}
                >
                  <CustomText 
                    font="pretendard-400"
                    className="text-xs"
                    style={{ 
                      color: club.isRecruiting ? colors.white : colors.mediumGray,
                      margin: 0,
                    }}
                  >
                    {club.isRecruiting ? '모집중' : '모집종료'}
                  </CustomText>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <main className="flex-grow flex justify-center">
        <div className="max-w-screen-lg w-full pb-24 sm:px-6 lg:px-8">
          <div className="px-4">
            <ClubTabs 
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
            <div className="mt-8">
              <CustomText 
                font="pretendard-700"
                className="text-xl mb-4"
                style={{ color: colors.black }}
              >
                {activeTab === 'intro' ? '동아리 정보' : '모집 요강'}
              </CustomText>
              <ClubInfoBoard club={club} 
                style={activeTab === 'intro' ? 'introduce' : 'recruit'} />
              
              {/* 상세 설명 표시 (intro 탭에서만) */}
              {activeTab === 'intro' && club.detailedDescription && (
                <div className="mt-6">
                  <CustomText 
                    font="pretendard-700"
                    className="text-lg mb-4"
                    style={{ color: colors.black }}
                  >
                    상세 소개
                  </CustomText>
                  <div 
                    className="bg-white rounded-lg border border-gray-200 p-6 prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: club.detailedDescription }}
                  />
                </div>
              )}
              
              {/* 기본 설명이 있는 경우 표시 */}
              {activeTab === 'intro' && !club.detailedDescription && club.description && (
                <div className="mt-6">
                  <CustomText 
                    font="pretendard-700"
                    className="text-lg mb-4"
                    style={{ color: colors.black }}
                  >
                    동아리 소개
                  </CustomText>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <CustomText 
                      font="pretendard-400"
                      className="text-base leading-relaxed"
                      style={{ color: colors.black }}
                    >
                      {club.description}
                    </CustomText>
                  </div>
                </div>
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
            right: `max(24px, calc((100vw - 896px) / 2 + 24px))`
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

export default CentralClubDetail;