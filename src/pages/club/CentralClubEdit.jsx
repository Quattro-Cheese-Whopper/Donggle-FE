import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopNavigator from '../../utils/navigate/TopNavigator';
import Footer from '../../utils/footer/BottomFooter';
import CustomText from '../../utils/CustomText';
import colors from '../../constants/colors';
import WYSIWYGEditor from '../../components/editor/WYSIWYGEditor';
import { clubService } from '../../api/services/clubService';
import { useClubImage } from '../../hooks/useClubImage';

const CentralClubEdit = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [hasFetchedClub, setHasFetchedClub] = useState(false);
  
  // 🔧 WYSIWYG 에디터에서 getProcessedContent 함수를 받을 ref
  const getProcessedContentRef = useRef(null);
  
  // 동아리 이미지 로딩을 위한 훅
  const { imageUrl, loading: imageLoading, error: imageError } = useClubImage(club?.profileImageName);
  
  // 편집 가능한 필드들의 상태
  const [formData, setFormData] = useState({
    name: '',
    memberCount: 0,
    location: '',
    contactInfo: '',
    description: '' // 상세 소개 (WYSIWYG로 편집)
  });

  // API를 통해 동아리 상세 정보 가져오기
  const fetchClubDetail = useCallback(async () => {
    if (!clubId || hasFetchedClub) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasFetchedClub(true);
      
      console.log(`🔍 편집용 동아리 상세 정보 조회: ${clubId}`);
      
      const response = await clubService.getClubDetail(clubId);
      const clubData = response.data || response;
      
      console.log('✅ 편집용 동아리 상세 정보:', clubData);
      
      if (clubData) {
        setClub(clubData);
        setFormData({
          name: clubData.name || '',
          memberCount: clubData.memberCount || 0,
          location: clubData.location || '',
          contactInfo: clubData.contactInfo || '',
          description: clubData.description || ''
        });
      } else {
        setError('동아리 정보를 찾을 수 없습니다.');
      }
    } catch (err) {
      console.error('❌ 편집용 동아리 상세 정보 조회 실패:', err);
      setError(err.message || '동아리 정보를 불러오는 중 오류가 발생했습니다.');
      setHasFetchedClub(false);
    } finally {
      setLoading(false);
    }
  }, [clubId, hasFetchedClub]);

  useEffect(() => {
    if (!clubId) {
      setError('동아리 ID가 없습니다.');
      setLoading(false);
      return;
    }

    fetchClubDetail();
  }, [fetchClubDetail]);

  // clubId 변경시 상태 리셋
  useEffect(() => {
    setHasFetchedClub(false);
    setClub(null);
    setError(null);
  }, [clubId]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 🔧 에디터로부터 getProcessedContent 함수를 받는 콜백
  const handleGetProcessedContent = (getProcessedContentFn) => {
    getProcessedContentRef.current = getProcessedContentFn;
  };

  // 🔧 저장 시 이미지 처리 포함
  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('💾 동아리 정보 업데이트 시작:', formData);
      
      // 🔧 WYSIWYG 에디터에서 처리된 콘텐츠 가져오기 (Base64 이미지 → S3 변환)
      let processedDescription = formData.description;
      
      if (getProcessedContentRef.current) {
        console.log('🖼️ 에디터 이미지 S3 업로드 처리 중...');
        processedDescription = await getProcessedContentRef.current();
        console.log('✅ 이미지 처리 완료');
      }
      
      // API 요청 형식에 맞게 데이터 변환
      const updateData = {
        name: formData.name,
        type: club.type,
        category: club.category,
        description: processedDescription, // 🔧 처리된 설명 사용
        memberCount: formData.memberCount,
        location: formData.location,
        contactInfo: formData.contactInfo,
        profileImageName: club.profileImageName
      };
      
      console.log('📤 서버로 전송할 데이터:', updateData);
      
      // API 호출로 동아리 정보 업데이트
      await clubService.updateClub(clubId, updateData);
      
      console.log('✅ 동아리 정보 업데이트 성공');
      
      // 성공 후 상세 페이지로 돌아가기
      navigate(`/club/central/${clubId}`);
      
    } catch (error) {
      console.error('❌ 동아리 정보 업데이트 실패:', error);
      setSaving(false);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCancel = () => {
    navigate(`/club/central/${clubId}`);
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
              {/* 동아리 이미지 렌더링 */}
              {imageLoading ? (
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : imageError || !imageUrl ? (
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              ) : (
                <img 
                  src={imageUrl} 
                  alt={`${club.name} 로고`} 
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
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
                {club.name} 정보를 수정하세요
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
                    type="number"
                    value={formData.memberCount}
                    onChange={(e) => handleInputChange('memberCount', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    동아리방
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 정보전산원 3층"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    관련 링크
                  </label>
                  <input
                    type="url"
                    value={formData.contactInfo}
                    onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            {/* 🔧 상세 소개 WYSIWYG 에디터 - clubId 전달 */}
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
                  content={formData.description}
                  onChange={(content) => handleInputChange('description', content)}
                  placeholder="동아리에 대한 상세한 소개를 작성해주세요..."
                  clubId={clubId} // 🔧 동아리 ID 전달
                  onGetProcessedContent={handleGetProcessedContent} // 🔧 콜백 함수 전달
                />
              </div>
            </div>

            {/* 저장/취소 버튼 */}
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
                className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    저장 중...
                  </>
                ) : (
                  '저장'
                )}
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