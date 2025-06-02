import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import CustomText from "../../utils/CustomText";
import BottomFooter from "../../utils/footer/BottomFooter";
import colors from "../../constants/colors";
import eyeClose from "../../assets/icons/eye-close.svg";
import eyeOpen from "../../assets/icons/eye-open.svg";
import { useAuth } from "../../hooks/useAuth"; // 추가된 부분

const SignUp = () => {
    const [formData, setFormData] = useState({
        email: "",
        department: "",
        clubName: "",
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);
    const [successMessage, setSuccessMessage] = useState(""); // 추가된 부분

    const { signup, isLoading } = useAuth(); // 추가된 부분
    const navigate = useNavigate(); // 추가된 부분

    // 모든 필수 필드가 채워졌는지 확인하고 isFormValid 상태 업데이트
    useEffect(() => {
        const { email, department, clubName, password, confirmPassword } = formData;
        
        // 단순히 필드가 비어있지 않은지만 확인
        const allFieldsFilled = 
            email.trim() !== "" && 
            department.trim() !== "" && 
            clubName.trim() !== "" &&
            password.trim() !== "" && 
            confirmPassword.trim() !== "";
        
        console.log("All fields filled:", allFieldsFilled);
        setIsFormValid(allFieldsFilled);
    }, [formData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // 입력 시 해당 필드의 에러 메시지 초기화
        setErrors({ ...errors, [name]: "" });
        setSuccessMessage(""); // 추가된 부분
    };

    const togglePasswordVisibility = (field) => {
        if (field === 'password') {
            setShowPassword(!showPassword);
        } else if (field === 'confirmPassword') {
            setShowConfirmPassword(!showConfirmPassword);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // 이메일 검증
        if (!formData.email) {
            newErrors.email = "이메일 형식이 일치지 않습니다.";
        } else if (!formData.email.includes("@") || !formData.email.includes(".")) {
            newErrors.email = "이메일 형식이 일치지 않습니다.";
        }
        
        // 학번 검증
        if (!formData.department) {
            newErrors.department = "학번 형식이 일치지 않습니다.";
        }
        
        // 비밀번호 검증
        if (!formData.password) {
            newErrors.password = "비밀번호는 영문, 숫자, 특수 문자 포함 8자 이상이어야 합니다.";
        } else {
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
            if (!passwordRegex.test(formData.password)) {
                newErrors.password = "비밀번호는 영문, 숫자, 특수 문자 포함 8자 이상이어야 합니다.";
            }
        }
        
        // 비밀번호 확인 검증
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => { // async 추가
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        // 🔧 JWT 회원가입 로직 추가
        try {
            // API 형식에 맞게 데이터 변환
            const signupData = {
                email: formData.email,
                studentId: formData.department, // department를 studentId로 매핑
                name: formData.clubName, // clubName을 name으로 매핑
                password: formData.password
            };

            // 🔍 디버깅: 전송할 데이터 확인
            console.log('🚀 회원가입 요청 데이터:', signupData);

            await signup(signupData);
            setSuccessMessage("회원가입이 완료되었습니다. 로그인해주세요.");
            
            // 2초 후 로그인 페이지로 이동
            setTimeout(() => {
                navigate('/signin');
            }, 2000);
            
        } catch (error) {
            // 🔍 디버깅: 에러 상세 정보
            console.error('❌ 회원가입 에러:', error);
            console.error('❌ 에러 메시지:', error.message);
            
            // 에러 메시지에서 서버 응답 추출
            let errorMessage = "회원가입에 실패했습니다. 다시 시도해주세요.";
            
            if (error.message.includes('409')) {
                setErrors({ email: "이미 등록된 이메일입니다." });
                return;
            }
            
            if (error.message.includes('400')) {
                // 400 에러의 경우 서버에서 보낸 메시지 사용
                const bodyMatch = error.message.match(/body: (.+)$/);
                if (bodyMatch && bodyMatch[1] && bodyMatch[1] !== 'No body') {
                    try {
                        // JSON 파싱 시도
                        const errorData = JSON.parse(bodyMatch[1]);
                        errorMessage = errorData.message || errorData.error || "입력 정보를 확인해주세요.";
                    } catch (e) {
                        // JSON이 아니면 텍스트 그대로 사용
                        errorMessage = bodyMatch[1];
                    }
                } else {
                    errorMessage = "입력 정보를 확인해주세요.";
                }
                setErrors({ general: errorMessage });
                return;
            }
            
            if (error.message.includes('500')) {
                errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
            }
            
            setErrors({ general: errorMessage });
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <div className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-lg w-full space-y-8">
                    {/* 회원가입 헤더 */}
                    <div className="text-center py-10">
                        <CustomText
                            font="pretendard-700"
                            className="text-4xl"
                            style={{ color: colors.black }}
                        >
                            회원가입
                        </CustomText>
                    </div>

                    {/* 🔧 성공 메시지 표시 (추가된 부분) */}
                    {successMessage && (
                        <div className="text-center">
                            <CustomText
                                font="pretendard-600"
                                className="text-sm"
                                style={{ color: colors.primary }}
                            >
                                {successMessage}
                            </CustomText>
                        </div>
                    )}

                    {/* 🔧 일반 에러 메시지 표시 (추가된 부분) */}
                    {errors.general && (
                        <div className="text-center">
                            <CustomText
                                font="pretendard-400"
                                className="text-sm"
                                style={{ color: colors.red }}
                            >
                                {errors.general}
                            </CustomText>
                        </div>
                    )}

                    {/* 회원가입 폼 */}
                    <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {/* 이메일 입력 필드 */}
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <CustomText
                                        font="pretendard-600"
                                        className="text-sm"
                                        style={{ color: colors.darkGray }}
                                    >
                                        이메일
                                    </CustomText>
                                    {errors.email && (
                                        <CustomText
                                            font="pretendard-400"
                                            className="text-sm"
                                            style={{ color: colors.red }}
                                        >
                                            {errors.email}
                                        </CustomText>
                                    )}
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="전남대학교 이메일을 입력해주세요"
                                    className="appearance-none relative block w-full px-3.5 py-3.5 border border-gray-200 placeholder-gray-200 text-gray-600 rounded-xl focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    disabled={isLoading} // 추가된 부분
                                />
                            </div>

                            {/* 학번 입력 필드 */}
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <CustomText
                                        font="pretendard-600"
                                        className="text-sm"
                                        style={{ color: colors.darkGray }}
                                    >
                                        학번
                                    </CustomText>
                                    {errors.department && (
                                        <CustomText
                                            font="pretendard-400"
                                            className="text-sm"
                                            style={{ color: colors.red }}
                                        >
                                            {errors.department}
                                        </CustomText>
                                    )}
                                </div>
                                <input
                                    id="department"
                                    name="department"
                                    type="text"
                                    required
                                    value={formData.department}
                                    onChange={handleChange}
                                    placeholder="전남대학교 학번을 입력해주세요"
                                    className="appearance-none relative block w-full px-3.5 py-3.5 border border-gray-200 placeholder-gray-200 text-gray-600 rounded-xl focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    disabled={isLoading} // 추가된 부분
                                />
                            </div>
                            
                            {/* 동아리명 입력 필드 */}
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <CustomText
                                        font="pretendard-600"
                                        className="text-sm"
                                        style={{ color: colors.darkGray }}
                                    >
                                        동아리명
                                    </CustomText>
                                </div>
                                <input
                                    id="clubName"
                                    name="clubName"
                                    type="text"
                                    required
                                    value={formData.clubName}
                                    onChange={handleChange}
                                    placeholder="동아리명을 입력해주세요"
                                    className="appearance-none relative block w-full px-3.5 py-3.5 border border-gray-200 placeholder-gray-200 text-gray-600 rounded-xl focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    disabled={isLoading} // 추가된 부분
                                />
                            </div>

                            {/* 비밀번호 입력 필드 */}
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <CustomText
                                        font="pretendard-600"
                                        className="text-sm"
                                        style={{ color: colors.darkGray }}
                                    >
                                        비밀번호
                                    </CustomText>
                                    {errors.password && (
                                        <CustomText
                                            font="pretendard-400"
                                            className="text-sm"
                                            style={{ color: colors.red }}
                                        >
                                            {errors.password}
                                        </CustomText>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="비밀번호를 입력해주세요"
                                        className="appearance-none relative block w-full px-3.5 py-3.5 border border-gray-200 placeholder-gray-200 text-gray-600 rounded-xl focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        disabled={isLoading} // 추가된 부분
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('password')}
                                        className="absolute inset-y-0 right-0 pr-5 flex items-center"
                                        disabled={isLoading} // 추가된 부분
                                    >
                                        <img 
                                            className="h-6 w-6" 
                                            src={showPassword ? eyeClose : eyeOpen}
                                            alt={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"} 
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* 비밀번호 확인 입력 필드 */}
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <CustomText
                                        font="pretendard-600"
                                        className="text-sm"
                                        style={{ color: colors.darkGray }}
                                    >
                                        비밀번호 확인
                                    </CustomText>
                                    {errors.confirmPassword && (
                                        <CustomText
                                            font="pretendard-400"
                                            className="text-sm"
                                            style={{ color: colors.red }}
                                        >
                                            {errors.confirmPassword}
                                        </CustomText>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="비밀번호를 다시 한번 입력해주세요"
                                        className="appearance-none relative block w-full px-3.5 py-3.5 border border-gray-200 placeholder-gray-200 text-gray-600 rounded-xl focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        disabled={isLoading} // 추가된 부분
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('confirmPassword')}
                                        className="absolute inset-y-0 right-0 pr-5 flex items-center"
                                        disabled={isLoading} // 추가된 부분
                                    >
                                        <img 
                                            className="h-6 w-6" 
                                            src={showConfirmPassword ? eyeClose : eyeOpen}
                                            alt={showConfirmPassword ? "비밀번호 숨기기" : "비밀번호 보기"} 
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 회원가입 버튼 */}
                        <div className="pt-4 pb-10">
                            <button
                                type="submit"
                                disabled={!isFormValid || isLoading} // 수정된 부분
                                className={`group relative w-full flex justify-center py-3.5 px-3.5 border border-transparent rounded-xl focus:outline-none transition-colors duration-300`}
                                style={{ 
                                    backgroundColor: (isFormValid && !isLoading) ? colors.secondary : colors.lightGray // 수정된 부분
                                }}
                            >
                                <CustomText
                                    font="pretendard-700"
                                    className="text-xl"
                                    style={{ 
                                        color: (isFormValid && !isLoading) ? colors.white : colors.darkGray // 수정된 부분
                                    }}
                                >
                                    {isLoading ? '가입 중...' : '가입 신청'} {/* 수정된 부분 */}
                                </CustomText>
                            </button>
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

export default SignUp;