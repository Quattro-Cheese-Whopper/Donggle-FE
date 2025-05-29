import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopNavigator from '../../utils/navigate/TopNavigator';
import Footer from '../../utils/footer/BottomFooter';
import CustomText from '../../utils/CustomText';
import colors from '../../constants/colors';
import sampleCentralClubs from '../../constants/clubs';
import ClubTabs from '../../components/tabs/ClubTabs';
import { ClubInfoBoard } from '../../components/info/ClubInfo';

const CentralClubDetail = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = parseInt(clubId);
    
    const foundClub = sampleCentralClubs.find(c => c.id === id);
    
    if (foundClub) {
      setClub(foundClub);
    }
    
    setLoading(false);
  }, [clubId]);

  // 뒤로 가기 핸들러 추가
  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white-50">
        <div className="relative z-10">
          <TopNavigator />
        </div>
        <main className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <CustomText 
              font="pretendard-600"
              className="text-lg"
              style={{ color: colors.darkGray }}
            >
              로딩 중...
            </CustomText>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!club) {
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
              동아리를 찾을 수 없습니다
            </CustomText>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
          <div className="flex items-center">
            <div className="mr-6">
              <img 
                src={club.icon} 
                alt={`${club.name} 로고`} 
                className="w-28 h-28 object-contain"
              />
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
                {club.department}
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
      
      <main className="flex-grow flex justify-center">
        <div className="max-w-screen-lg w-full pb-24 sm:px-6 lg:px-8">
          <div className="px-4">
            <ClubTabs clubId={clubId} />
            <div className="mt-8">
              <CustomText 
                font="pretendard-700"
                className="text-xl mb-4"
                style={{ color: colors.black }}
              >
                동아리 정보
              </CustomText>
              {/* 2열 구조의 ClubInfoBoard 적용 */}
              <ClubInfoBoard club={club} style="central" />
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CentralClubDetail;