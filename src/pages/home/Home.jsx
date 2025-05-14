import React from 'react';
import TopNavigator from '../../utils/navigate/TopNavigator';
import Footer from '../../utils/footer/BottomFooter'
import JnuImage from '../../assets/전남대 풍경.png';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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
      <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <p className="text-xl text-gray-500">전남대학교 동아리 홈페이지 컨텐츠</p>
          </div>
        </div>
      </main>
      <Footer/>
    </div>
  );
};

export default Home;