import React from 'react';
import TopNavigator from '../../utils/navigate/TopNavigator';
import Footer from '../../utils/footer/BottomFooter'
import JnuImage from '../../assets/전남대 풍경.png';
import { HorizontalClubCarousel } from '../../components/cards/ClubCard';
import sampleClubs from '../../constants/clubs';
import { leftNotice, rightNotice } from '../../constants/notices';
import { NoticeGrid } from '../../components/notice/Notice';

const Home = () => {
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
        />
      </div>
      {/* 메인 컨텐츠 */}
      <main className="flex-grow flex justify-center">
        <div className="max-w-7xl w-full py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <HorizontalClubCarousel clubs={sampleClubs} />
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