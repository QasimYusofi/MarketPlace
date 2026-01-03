// app/user-login/page.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import {
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUser,
  FaGoogle,
  FaTwitter,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa";

const BASE_API_LOGIN_USER = `${process.env.NEXT_PUBLIC_API_URL}/auth/token/`;

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (!formData.phone || !formData.password) {
      toast.error("لطفا شماره تماس و رمز عبور را وارد کنید", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#fef2f2",
          color: "#dc2626",
          border: "1px solid #fecaca",
          padding: "16px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
        },
      });
      setIsSubmitting(false);
      return;
    }

    // Validate phone format
    const phoneRegex = /^09\d{9}$/;
    const cleanPhone = formData.phone.replace(/\s/g, "");

    if (!phoneRegex.test(cleanPhone)) {
      toast.error("فرمت شماره تماس نامعتبر است", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#fef2f2",
          color: "#dc2626",
          border: "1px solid #fecaca",
          padding: "16px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
        },
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(BASE_API_LOGIN_USER, {
        phone: cleanPhone,
        password: formData.password,
      });
      console.log(response);

      if (response.status === 200) {
        toast.success("ورود موفقیت آمیز! در حال انتقال...", {
          duration: 3000,
          position: "top-center",
          style: {
            background: "#f0fdf4",
            color: "#16a34a",
            border: "1px solid #bbf7d0",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
          },
        });

        // Store token and user data
        if (response.data.access) {
          localStorage.setItem("accessToken", response.data.access);
        }

        // Update last login
        const redirectData = localStorage.getItem("redirectAfterLogin");
        setTimeout(() => {
          if (redirectData) {
            const { path } = JSON.parse(redirectData);
            localStorage.removeItem("redirectAfterLogin");
            router.push(path);
          } else {
            router.push("/");
          }
        }, 2000);
      }
    } catch (error) {
      console.log(error);
      let errorMessage = "شماره تماس یا رمز عبور اشتباه است";

      if (axios.isAxiosError(error)) {
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.request) {
          errorMessage = "خطا در ارتباط با سرور";
        }
      }

      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#fef2f2",
          color: "#dc2626",
          border: "1px solid #fecaca",
          padding: "16px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterRedirect = () => {
    router.push("/auth/user-register");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // const handleForgotPassword = () => {
  //   router.push("/forgot-password");
  // };

  const handleForgotPassword = () => {
    toast.success("لینک بازیابی رمز عبور به شماره شما ارسال شد", {
      duration: 4000,
      position: "top-center",
    });
  };

  const handleSocialLogin = (provider) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } bg-blue-400 text-white px-4 py-2 rounded-lg shadow-lg`}
        >
          ورود با {provider} در حال توسعه است...
        </div>
      ),
      {
        duration: 3000,
        position: "top-center",
      }
    );
  };

  return (
    <>
      <Toaster
        toastOptions={{
          style: {
            fontFamily: "var(--font-vazirmatn), sans-serif",
            direction: "rtl",
          },
        }}
      />

      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-vazirmatn"
        dir="rtl"
      >
        <div className="max-w-lg w-full">
          {/* Combined Card with Header Background */}
          <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
            {/* Header Section with Background */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-8 px-6 text-center text-white">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <FaUser className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">ورود به حساب کاربری</h2>
              <p className="text-blue-100 text-sm">
                خوش آمدید! لطفا اطلاعات حساب خود را وارد کنید
              </p>
            </div>

            {/* Login Form */}
            <div className="py-6 px-6 sm:px-8">
              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Phone Field */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    شماره تماس
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FaPhone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="appearance-none block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-right"
                      placeholder="0912xxxxxxx"
                      dir="ltr"
                      maxLength={11}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    شماره تماس باید با 09 شروع شود و 11 رقم باشد
                  </p>
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    رمز عبور
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FaLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="appearance-none block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-right"
                      placeholder="رمز عبور خود را وارد کنید"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <FaEyeSlash className="h-5 w-5" />
                      ) : (
                        <FaEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {/* Password Actions */}
                  <div className="flex justify-between items-center mt-2">
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="text-xs text-gray-500 hover:text-blue-600 transition-colors duration-200 flex items-center"
                    >
                      {showPassword ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
                    </button>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs text-blue-600 hover:text-blue-500 transition-colors duration-200"
                    >
                      رمز عبور خود را فراموش کرده اید؟
                    </button>
                  </div>
                </div>

                {/* Remember Me & Options */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="remember-me"
                      className="mr-2 block text-sm text-gray-900"
                    >
                      مرا به خاطر بسپار
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                      isSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transform hover:-translate-y-0.5"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                        در حال ورود...
                      </>
                    ) : (
                      <>
                        <FaSignInAlt className="ml-2" />
                        ورود به حساب کاربری
                      </>
                    )}
                  </button>
                </div>

                {/* Social Login Divider */}
                <div className="pt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        یا ورود با
                      </span>
                    </div>
                  </div>

                  {/* Social Login Buttons */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleSocialLogin("Google")}
                      className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
                    >
                      <FaGoogle className="text-red-500 ml-2" />
                      <span>گوگل</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSocialLogin("Twitter")}
                      className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
                    >
                      <FaTwitter className="text-blue-400 ml-2" />
                      <span>توییتر</span>
                    </button>
                  </div>
                </div>

                {/* Register Link */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">
                    حساب کاربری ندارید؟
                  </p>
                  <button
                    type="button"
                    onClick={handleRegisterRedirect}
                    className="w-full inline-flex justify-center items-center py-3 px-4 border-2 border-blue-100 hover:border-blue-300 rounded-xl text-blue-600 hover:text-blue-700 font-medium transition-all duration-200 hover:shadow-md bg-blue-50 hover:bg-blue-100"
                  >
                    <FaUserPlus className="ml-2 h-5 w-5" />
                    ایجاد حساب کاربری جدید
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              با ورود به حساب، با{" "}
              <button className="text-blue-600 hover:text-blue-500">
                شرایط استفاده
              </button>{" "}
              و{" "}
              <button className="text-blue-600 hover:text-blue-500">
                حریم خصوصی
              </button>{" "}
              موافقت می‌کنید
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
