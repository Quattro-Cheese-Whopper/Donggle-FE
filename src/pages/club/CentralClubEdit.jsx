import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopNavigator from '../../utils/navigate/TopNavigator';
import Footer from '../../utils/footer/BottomFooter';
import CustomText from '../../utils/CustomText';
import colors from '../../constants/colors';
import sampleCentralClubs from '../../constants/clubs';
import WYSIWYGEditor from '../../components/editor/WYSIWYGEditor';

const CentralClubEdit = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // 편집 가능한 필드들의 상태
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    memberCount: '',
    mainActivity: '',
    clubRoom: '',
    website: '',
    detailedDescription: '', // WYSIWYG로 편집할 상세 설명
    isRecruiting: true
  });

  useEffect(() => {
    const id = parseInt(clubId);
    const foundClub = sampleCentralClubs.find(c => c.id === id);
    
    if (foundClub) {
      setClub(foundClub);
      setFormData({
        name: foundClub.name || '',
        category: foundClub.category || '',
        description: foundClub.description || '',
        memberCount: foundClub.memberCount || '',
        mainActivity: foundClub.mainActivity || '',
        clubRoom: foundClub.clubRoom || '',
        website: foundClub.website || '',
        detailedDescription: foundClub.detailedDescription || '',
        isRecruiting: foundClub.isRecruiting || true
      });
    }
    
    setLoading(false);
  }, [clubId]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: API 호출로 동아리 정보 업데이트
      // await clubService.updateClub(clubId, formData);
      
      console.log('저장할 데이터:', formData);
      
      // 성공 후 상세 페이지로 돌아가기
      setTimeout(() => {
        setSaving(false);
        navigate(`/club/central/${clubId}`);
      }, 1000);
      
    } catch (error) {
      console.error('저장 실패:', error);
      setSaving(false);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCancel = () => {
    navigate(`/club/central/${clubId}`);
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
              onClick={() => navigate('/club/central')}
            >
              목록으로 돌아가기
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
      
      {/* 헤더 영역 */}
      <div className="w-full bg-white border-b">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <div className="mr-6">
              <img 
                src={club.icon} 
                alt={`${club.name} 로고`} 
                className="w-20 h-20 object-contain"
              />
            </div>
            <div>
              <CustomText 
                font="pretendard-700"
                className="text-2xl mb-2"
                style={{ color: colors.black }}
              >
                동아리 정보 편집
              </CustomText>
              <CustomText 
                font="pretendard-500"
                className="text-base"
                style={{ color: colors.darkGray }}
              >
                동아리 정보를 수정하세요
              </CustomText>
            </div>
          </div>
        </div>
      </div>
      
      <main className="flex-grow flex justify-center">
        <div className="max-w-screen-lg w-full pb-24 sm:px-6 lg:px-8">
          <div className="px-4 py-8">
            
            {/* 기본 정보 편집 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <CustomText 
                font="pretendard-700"
                className="text-lg mb-4"
                style={{ color: colors.black }}
              >
                기본 정보
              </CustomText>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    동아리명
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    인원수
                  </label>
                  <input
                    type="text"
                    value={formData.memberCount}
                    onChange={(e) => handleInputChange('memberCount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    동아리방
                  </label>
                  <input
                    type="text"
                    value={formData.clubRoom}
                    onChange={(e) => handleInputChange('clubRoom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    웹사이트/관련 링크
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://"
                  />
                </div>
                
              </div>
            </div>

            {/* 상세 설명 WYSIWYG 에디터 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <CustomText 
                font="pretendard-700"
                className="text-lg mb-4"
                style={{ color: colors.black }}
              >
                상세 소개
              </CustomText>
              
              <div className="mt-4">
                <WYSIWYGEditor
                  content={formData.detailedDescription}
                  onChange={(content) => handleInputChange('detailedDescription', content)}
                  placeholder="동아리에 대한 상세한 소개를 작성해주세요..."
                />
              </div>
              
            </div>

              {/* 저장/취소 버튼 - WYSIWYG 아래 오른쪽에 배치 */}
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={saving}
                >
                  취소
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50"
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
              </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CentralClubEdit;