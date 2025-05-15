import React from 'react';
import TopNavigator from '../../utils/navigate/TopNavigator';
import Footer from '../../utils/footer/BottomFooter'
import { ClubCardGrid } from '../../components/cards/ClubCard';
import sampleClubs from '../../constants/clubs';

const CentralClub = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white-50">
      <div className="relative z-10">
        <TopNavigator />
      </div>
      {/* 메인 컨텐츠 */}
      <main className="flex-grow flex justify-center">
        <div className="max-w-7xl w-full py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <ClubCardGrid clubs={sampleClubs} />
          </div>
        </div>
      </main>
      <Footer/>
    </div>
  );
};

export default CentralClub;