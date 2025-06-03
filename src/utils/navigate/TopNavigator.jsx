import React from "react";
import { Link, useLocation } from "react-router-dom";
import CustomText from "../CustomText";
import Logo from "../../assets/전남대 로고.svg";
import colors from "../../constants/colors";
import { useAuth } from "../../hooks/useAuth"; // 추가

const TopNavigator = () => {
    const location = useLocation();
    const { isLoggedIn, logout } = useAuth(); // 추가

    // 현재 경로와 비교하여 활성 메뉴 확인
    const isActive = (path) => {
        return location.pathname === path;
    };

    // 로그아웃 핸들러
    const handleLogout = async () => {
        try {
            await logout();
            // 로그아웃 후 홈으로 이동
            window.location.href = '/home';
        } catch (error) {
            console.error('로그아웃 실패:', error);
        }
    };

    return (
        <nav className="w-full bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* 로고 및 메인 네비게이션 */}
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="flex mx-1 items-center">
                                <img className="h-8 w-8" src={Logo} />
                                <CustomText
                                    font="chnam"
                                    className="ml-3 text-xl"
                                    style={{ color: colors.primary }}
                                >
                                    전남대학교 동아리
                                </CustomText>
                            </Link>
                        </div>
                    </div>

                    {/* 메인 메뉴 아이템들 */}
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        <div className="flex space-x-4 h-full items-center">
                            <Link
                                to="/home"
                                className={`px-3 h-full flex items-center relative
                                }`}
                            >
                                <CustomText
                                    font={isActive("/home") ? "pretendard-700" : "pretendard-500"}
                                    className="text-sm"
                                    style={{ color: isActive("/home") ? colors.primary : colors.darkGray }}
                                >
                                    홈
                                </CustomText>

                                {isActive("/home") && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: 0,
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            width: "35px",
                                            height: "5px",
                                            flexShrink: 0,
                                            borderRadius: "10px 10px 0px 0px",
                                            background: colors.primary
                                        }}
                                    />
                                )}
                            </Link>

                            <Link
                                to="/club/central"
                                className={`px-3 h-full flex items-center relative`}
                            >
                                <CustomText
                                    font={isActive("/club/central") ? "pretendard-700" : "pretendard-500"}
                                    className="text-sm"
                                    style={{ color: isActive("/club/central") ? colors.primary : colors.darkGray }}
                                >
                                    중앙 동아리
                                </CustomText>

                                {isActive("/club/central") && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: 0,
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            width: "35px",
                                            height: "5px",
                                            flexShrink: 0,
                                            borderRadius: "10px 10px 0px 0px",
                                            background: colors.primary
                                        }}
                                    />
                                )}
                            </Link>

                            <Link
                                to="/club/department"
                                className={`px-3 h-full flex items-center relative`}
                            >
                                <CustomText
                                    font={isActive("/club/department") ? "pretendard-700" : "pretendard-500"}
                                    className="text-sm"
                                    style={{ color: isActive("/club/department") ? colors.primary : colors.darkGray }}
                                >
                                    학과 동아리
                                </CustomText>

                                {isActive("/club/department") && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: 0,
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            width: "35px",
                                            height: "5px",
                                            flexShrink: 0,
                                            borderRadius: "10px 10px 0px 0px",
                                            background: colors.primary
                                        }}
                                    />
                                )}
                            </Link>

                            {/* 🔧 로그인 상태에 따른 메뉴 변경 */}
                            {isLoggedIn ? (
                                // 로그인된 경우: 프로필 드롭다운 또는 로그아웃 버튼
                                <div className="relative">
                                    <button
                                        onClick={handleLogout}
                                        className="px-3 h-full flex items-center relative"
                                    >
                                        <CustomText
                                            font="pretendard-500"
                                            className="text-sm"
                                            style={{ color: colors.primary }}
                                        >
                                            로그아웃
                                        </CustomText>
                                    </button>
                                </div>
                            ) : (
                                // 로그인되지 않은 경우: 로그인 링크
                                <Link
                                    to="/signin"
                                    className={`px-3 h-full flex items-center relative`}
                                >
                                    <CustomText
                                        font={isActive("/signin") ? "pretendard-700" : "pretendard-500"}
                                        className="text-sm"
                                        style={{ color: colors.primary }}
                                    >
                                        로그인
                                    </CustomText>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default TopNavigator;