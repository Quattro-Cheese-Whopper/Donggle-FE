import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Markdown from 'markdown-to-jsx';
import TopNavigator from '../../utils/navigate/TopNavigator';
import Footer from '../../utils/footer/BottomFooter';
import CustomText from '../../utils/CustomText';
import colors from '../../constants/colors';
import ClubTabs from '../../components/tabs/ClubTabs';
import { ClubInfoBoard } from '../../components/info/ClubInfo';
import { useAuth } from '../../hooks/useAuth';
import { useClubImage } from '../../hooks/useClubImage';
import { clubService } from '../../api/services/clubService';

const CentralClubDetail = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('intro');
  const [hasFetchedClub, setHasFetchedClub] = useState(false);
  const [hasFetchedMyClubs, setHasFetchedMyClubs] = useState(false);

  const { isLoggedIn, isMyClub, fetchMyClubs, myClubs } = useAuth();
  
  // 동아리 이미지 로딩을 위한 훅 (club이 로드된 후에 사용)
  const { imageUrl, loading: imageLoading, error: imageError } = useClubImage(club?.profileImageName);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // 편집 페이지로 이동
  const handleEditClick = () => {
    navigate(`/club/central/${clubId}/edit`);
  };

  // AbortController를 사용한 중복 방지
  const fetchClubDetail = useCallback(async (abortController) => {
    if (hasFetchedClub) {
      console.log(`⏭️ 이미 동아리 정보를 가져왔음, 스킵`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasFetchedClub(true);
      
      console.log(`🔍 동아리 상세 정보 조회: ${clubId}`);
      
      const response = await clubService.getClubDetail(clubId);
      
      // 요청이 취소되었는지 확인
      if (abortController.signal.aborted) {
        console.log('🚫 요청이 취소됨');
        return;
      }
      
      const clubData = response.data || response;
      
      console.log('✅ 동아리 상세 정보:', clubData);
      
      if (clubData) {
        setClub(clubData);
      } else {
        setError('동아리 정보를 찾을 수 없습니다.');
      }
    } catch (err) {
      if (abortController.signal.aborted) {
        console.log('🚫 요청이 취소됨 (에러)');
        return;
      }
      
      console.error('❌ 동아리 상세 정보 조회 실패:', err);
      setError(err.message || '동아리 정보를 불러오는 중 오류가 발생했습니다.');
      setHasFetchedClub(false); // 에러 발생시 재시도 가능하게
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [clubId, hasFetchedClub]);

  // 내 동아리 정보 조회
  const fetchMyClubsOnce = useCallback(async () => {
    if (hasFetchedMyClubs || !isLoggedIn || myClubs.length > 0) {
      return;
    }

    try {
      console.log('🏢 동아리 상세 페이지에서 내 동아리 정보 조회');
      setHasFetchedMyClubs(true);
      
      await fetchMyClubs();
    } catch (error) {
      console.warn('⚠️ 내 동아리 정보 조회 실패 (토큰 만료 가능성):', error.message);
      setHasFetchedMyClubs(false); // 실패시 다시 시도할 수 있도록
    }
  }, [isLoggedIn, myClubs.length, fetchMyClubs, hasFetchedMyClubs]);

  // 동아리 상세 정보 가져오기
  useEffect(() => {
    if (!clubId) {
      setError('동아리 ID가 없습니다.');
      setLoading(false);
      return;
    }

    const abortController = new AbortController();
    fetchClubDetail(abortController);

    return () => {
      abortController.abort();
    };
  }, [clubId, fetchClubDetail]);

  // 내 동아리 정보 조회
  useEffect(() => {
    fetchMyClubsOnce();
  }, [fetchMyClubsOnce]);

  // clubId 변경시 상태 리셋
  useEffect(() => {
    setHasFetchedClub(false);
    setClub(null);
    setError(null);
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
                {/* 동아리 이미지 렌더링 */}
                {imageLoading ? (
                  <div className="w-28 h-28 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : imageError || !imageUrl ? (
                  <div className="w-28 h-28 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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
                  {club.type === 'CENTRAL' ? '중앙동아리' : club.department || club.type}
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
              
              {/* 동아리 소개 표시 (마크다운 렌더링) */}
              {activeTab === 'intro' && club.description && (
                <div className="mt-6">
                  <CustomText 
                    font="pretendard-700"
                    className="text-lg mb-4"
                    style={{ color: colors.black }}
                  >
                    동아리 소개
                  </CustomText>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="prose prose-lg max-w-none leading-relaxed">
                      <Markdown
                        options={{
                          overrides: {
                            h1: {
                              props: {
                                className: 'text-2xl font-bold mb-4 mt-8',
                                style: { color: colors.black }
                              }
                            },
                            h2: {
                              props: {
                                className: 'text-xl font-bold mb-3 mt-6',
                                style: { color: colors.black }
                              }
                            },
                            h3: {
                              props: {
                                className: 'text-lg font-semibold mb-2 mt-4',
                                style: { color: colors.black }
                              }
                            },
                            p: {
                              props: {
                                className: 'mb-4 leading-relaxed',
                                style: { color: colors.black }
                              }
                            },
                            strong: {
                              props: {
                                className: 'font-semibold'
                              }
                            },
                            em: {
                              props: {
                                className: 'italic'
                              }
                            },
                            code: {
                              props: {
                                className: 'bg-gray-100 px-2 py-1 rounded text-sm font-mono'
                              }
                            },
                            blockquote: {
                              props: {
                                className: 'border-l-4 border-gray-300 pl-4 my-4 italic',
                                style: { color: colors.darkGray }
                              }
                            },
                            ul: {
                              props: {
                                className: 'list-disc list-inside mb-4 space-y-1'
                              }
                            },
                            ol: {
                              props: {
                                className: 'list-decimal list-inside mb-4 space-y-1'
                              }
                            },
                            li: {
                              props: {
                                className: 'leading-relaxed',
                                style: { color: colors.black }
                              }
                            },
                            a: {
                              props: {
                                className: 'text-blue-600 hover:text-blue-800 underline',
                                target: '_blank',
                                rel: 'noopener noreferrer'
                              }
                            }
                          }
                        }}
                      >
                        {club.description}
                      </Markdown>
                    </div>
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