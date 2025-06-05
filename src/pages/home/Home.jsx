import React, { useEffect, useState } from 'react';
import TopNavigator from '../../utils/navigate/TopNavigator';
import Footer from '../../utils/footer/BottomFooter'
import JnuImage from '../../assets/전남대 풍경.png';
import { HorizontalClubCarousel } from '../../components/cards/ClubCard';
import { leftNotice, rightNotice } from '../../constants/notices';
import { NoticeGrid } from '../../components/notice/Notice';
import { clubService } from '../../api/services/clubService';
import { transformClubsCategories } from '../../utils/categoryMapper';
import CustomText from '../../utils/CustomText';
import colors from '../../constants/colors';

const Home = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 중앙동아리 데이터 가져오기
  useEffect(() => {
    const fetchCentralClubs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🏠 홈페이지에서 중앙동아리 목록 조회');
        
        const response = await clubService.getClubsByType('CENTRAL');
        const rawClubsData = response.data || response.content || response;
        
        // 카테고리 변환 적용
        const transformedClubs = transformClubsCategories(rawClubsData);
        
        console.log('✅ 홈페이지 중앙동아리 목록:', transformedClubs);
        
        // 최대 12개 동아리만 표시 (캐러셀에서 4페이지)
        setClubs(transformedClubs.slice(0, 12));
        
      } catch (err) {
        console.error('❌ 홈페이지 중앙동아리 조회 실패:', err);
        setError(err.message);
        setClubs([]); // 에러시 빈 배열
      } finally {
        setLoading(false);
      }
    };

    fetchCentralClubs();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="relative z-10">
        <TopNavigator />
      </div>
      <div className="w-full" style={{ marginTop: '-4px' }}>
        <img 
          src={JnuImage} 
          className="w-full object-cover"
          style={{ 
            height: '300px' // 비율 유지
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
                <HorizontalClubCarousel clubs={clubs} />
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
            <div className="mt-16 mb-12">
              <NoticeGrid 
                leftNotice={leftNotice} 
                rightNotice={rightNotice} 
              />
            </div>
          </div>
        </div>
      </main>
      <Footer/>
    </div>
  );
};

export default Home;