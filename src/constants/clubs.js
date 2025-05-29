import econoLogo from '../assets/에코노 로고.png';
import cheongbulLogo from '../assets/청불 로고.png';

export const sampleCentralClubs = [
  {
    id: 1,
    icon: econoLogo,
    name: '에코노베이션',
    department: '학술분과',
    category: 'IT',
    isRecruiting: true,
    memberCount: '40+',
    mainActivity: '프로젝트 개발',
    clubRoom : '정보전산원 3층',
    website : 'https://econovation.kr/'
  },
  {
    id: 2,
    icon: cheongbulLogo,
    name: '청불',
    department: '문예분과',
    category: '영상',
    isRecruiting: false,
    memberCount: '50+',
    mainActivity: '영화 촬영',
    clubRoom : '1학생회관 204호',
    website : 'https://econovation.kr/'
  },
  {
    id: 3,
    icon: econoLogo,
    name: '에코노베이션',
    department: '봉사분과',
    category: 'IT',
    isRecruiting: true
  },
  {
    id: 4,
    icon: cheongbulLogo,
    name: '청불',
    department: '종교분과',
    category: '영상',
    isRecruiting: false
  },
  {
    id: 5,
    icon: cheongbulLogo,
    name: '청불',
    department: '체육분과',
    category: '영상',
    isRecruiting: false
  }
];

export default sampleCentralClubs;