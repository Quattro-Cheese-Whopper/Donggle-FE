import React from "react";
import { Link } from "react-router-dom";
import CustomText from "../CustomText";
import KakaoIcon from "../../assets/카카오톡.png";
import InstagramIcon from "../../assets/인스타.png";
import colors from "../../constants/colors";

const BottomFooter = () => {
    return (
        <footer className="w-full bg-white border-t border-gray-200 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                    <div className="flex flex-col sm:flex-row items-center mb-2 sm:mb-0">
                        <CustomText
                            font="pretendard-400"
                            className="text-sm"
                            style={{ color: colors.black }}
                        >
                            address
                        </CustomText>
                        <CustomText
                            font="pretendard-400"
                            className="mx-1 hidden sm:block text-sm"
                            style={{ color: colors.darkGray }}
                        >
                            : 광주광역시 북구 용봉로 77 전남대학교 제1학생회관 203
                        </CustomText>
                        
                        <CustomText
                            font="pretendard-400"
                            className="mx-3 hidden sm:block"
                            style={{ color: colors.darkGray }}
                        >
                            |
                        </CustomText>
                        <CustomText
                            font="pretendard-400"
                            className="text-sm"
                            style={{ color: colors.black }}
                        >
                            e-mail 
                        </CustomText>
                        <CustomText
                            font="pretendard-400"
                            className="mx-1 hidden sm:block text-sm"
                            style={{ color: colors.darkGray }}
                        >
                            : jnu2025@nanal@gmail.com 
                        </CustomText>
                    </div>

                    <div className="flex space-x-2">
                        <a
                            href="https://pf.kakao.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-transform hover:scale-110"
                        >
                            <img className="h-6 w-6" src={KakaoIcon} alt="카카오톡" />
                        </a>
                        <a
                            href="https://www.instagram.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-transform hover:scale-110"
                        >
                            <img className="h-6 w-6" src={InstagramIcon} alt="인스타그램" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default BottomFooter;