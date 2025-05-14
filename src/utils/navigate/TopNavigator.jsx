import React from "react";
import { Link, useLocation } from "react-router-dom";
import CustomText from "../CustomText";
import Logo from "../../assets/전남대 로고.svg";
import colors from "../../constants/colors";

const TopNavigator = () => {
    const location = useLocation();

    // 현재 경로와 비교하여 활성 메뉴 확인
    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <nav className="w-full bg-white shadow-xl">
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
                                to="/central"
                                className={`px-3 h-full flex items-center relative`}
                            >
                                <CustomText
                                    font={isActive("/central") ? "pretendard-700" : "pretendard-500"}
                                    className="text-sm"
                                    style={{ color: isActive("/central") ? colors.primary : colors.darkGray }}
                                >
                                    중앙 동아리
                                </CustomText>

                                {isActive("/central") && (
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
                                to="/department"
                                className={`px-3 h-full flex items-center relative`}
                            >
                                <CustomText
                                    font={isActive("/department") ? "pretendard-700" : "pretendard-500"}
                                    className="text-sm"
                                    style={{ color: isActive("/department") ? colors.primary : colors.darkGray }}
                                >
                                    학과 동아리
                                </CustomText>

                                {isActive("/department") && (
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
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default TopNavigator;
