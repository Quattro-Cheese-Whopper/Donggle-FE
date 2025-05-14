import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CustomText from "../../utils/CustomText";
import BottomFooter from "../../utils/footer/BottomFooter";
import colors from "../../constants/colors";
import eyeClose from "../../assets/icons/eye-close.svg";
import eyeOpen from "../../assets/icons/eye-open.svg";

const SignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isFormValid, setIsFormValid] = useState(false);

    // 모든 필드가 채워졌는지 확인하고 isFormValid 상태 업데이트
    useEffect(() => {
        setIsFormValid(email !== "" && password !== "");
    }, [email, password]);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        // 에러 메시지 초기화
        setErrorMessage("");
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        // 에러 메시지 초기화
        setErrorMessage("");
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 유효성 검사 (예시)
        if (!email || !password) {
            setErrorMessage("이메일과 비밀번호를 입력해주세요.");
            return;
        }

        // 로그인 로직 구현 (실제로는 API 호출 등이 필요)
        console.log("로그인 시도:", email, password);
        // 여기에 로그인 API 호출 및 처리 로직 추가
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <div className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-lg w-full space-y-8">
                    {/* 로그인 헤더 */}
                    <div className="text-center">
                        <CustomText
                            font="pretendard-700"
                            className="text-4xl"
                            style={{ color: colors.black }}
                        >
                            로그인
                        </CustomText>
                    </div>

                    {/* 로그인 폼 */}
                    <form className="space-y-14" onSubmit={handleSubmit}>
                        <div className="mt-24 space-y-4">
                            {/* 이메일 입력 필드 */}
                            <div>
                                <CustomText
                                    font="pretendard-600"
                                    className="block text-sm mb-1.5"
                                    style={{ color: colors.darkGray }}
                                >
                                    이메일
                                </CustomText>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={handleEmailChange}
                                    placeholder="전남대학교 이메일을 입력해주세요"
                                    className="appearance-none relative block w-full px-3.5 py-3.5 border border-gray-200 placeholder-gray-200 text-gray-600 rounded-xl focus:outline-none focus:ring-green-500 focus:border-green-500"
                                />
                            </div>

                            {/* 비밀번호 입력 필드 */}
                            <div className="relative">
                                <CustomText
                                    font="pretendard-600"
                                    className="block text-sm mb-1.5"
                                    style={{ color: colors.darkGray }}
                                >
                                    비밀번호
                                </CustomText>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={handlePasswordChange}
                                        placeholder="비밀번호를 입력해주세요"
                                        className="appearance-none relative block w-full px-3.5 py-3.5 border border-gray-200 placeholder-gray-200 text-gray-600 rounded-xl focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute inset-y-0 right-0 pr-5 flex items-center"
                                    >
                                        <img className="h-6 w-6" 
                                            src={showPassword ? eyeClose : eyeOpen}
                                            alt={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 에러 메시지 표시 */}
                        {errorMessage && (
                            <div className="text-center">
                                <CustomText
                                    font="pretendard-400"
                                    className="text-sm"
                                    style={{ color: colors.red }}
                                >
                                    {errorMessage}
                                </CustomText>
                            </div>
                        )}

                        {/* 로그인 버튼 */}
                        <div>
                            <button
                                type="submit"
                                className={`group relative w-full flex justify-center py-3.5 px-3.5 border border-transparent rounded-xl focus:outline-none transition-colors duration-300`}
                                style={{ 
                                    backgroundColor: isFormValid ? colors.secondary : colors.lightGray
                                }}
                            >
                                <CustomText
                                    font="pretendard-700"
                                    className="text-xl"
                                    style={{ 
                                        color: isFormValid ? colors.white : colors.darkGray 
                                    }}
                                >
                                    로그인
                                </CustomText>
                            </button>
                            <div className="text-center mt-8">
                                <CustomText
                                    font="pretendard-500"
                                    className="text-sm"
                                    style={{ color: colors.darkGray }}
                                >
                                    동아리 관계자 이신가요?
                                    <Link
                                        to="/signup"
                                        className="ml-1 inline-block"
                                    >
                                        <CustomText
                                            font="pretendard-700"
                                            style={{
                                                color: colors.primary,
                                            }}
                                        >
                                            회원가입하기
                                        </CustomText>
                                    </Link>
                                </CustomText>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <div className="mt-auto">
                <BottomFooter />
            </div>
        </div>
    );
};

export default SignIn;