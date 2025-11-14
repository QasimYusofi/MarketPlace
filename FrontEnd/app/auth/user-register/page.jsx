// app/user-register/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import {
  FaUser,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUserPlus,
  FaSignInAlt,
  FaIdCard,
} from "react-icons/fa";

export default function CustomerRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateField = (fieldName, value) => {
    let fieldErrors = "";

    switch (fieldName) {
      case "firstName":
        if (!value.trim()) fieldErrors = "نام الزامی است";
        else if (value.trim().length < 2)
          fieldErrors = "نام باید حداقل ۲ حرف باشد";
        break;
      case "lastName":
        if (!value.trim()) fieldErrors = "نام خانوادگی الزامی است";
        else if (value.trim().length < 2)
          fieldErrors = "نام خانوادگی باید حداقل ۲ حرف باشد";
        break;
      case "phone":
        if (!value.trim()) fieldErrors = "شماره تماس الزامی است";
        else if (!/^09\d{9}$/.test(value.replace(/\s/g, "")))
          fieldErrors = "شماره تماس باید با 09 شروع شود و 11 رقم باشد";
        break;
      case "password":
        if (!value) fieldErrors = "رمز عبور الزامی است";
        else if (value.length < 6)
          fieldErrors = "رمز عبور باید حداقل ۶ حرف باشد";
        break;
      case "confirmPassword":
        if (!value) fieldErrors = "تکرار رمز عبور الزامی است";
        else if (value !== formData.password)
          fieldErrors = "رمز عبور و تکرار آن مطابقت ندارند";
        break;
      default:
        break;
    }

    return fieldErrors;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate only required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "phone",
      "password",
      "confirmPassword",
    ];
    const newErrors = {};

    requiredFields.forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);

    // Check if there are any errors in required fields
    const hasErrors = Object.values(newErrors).some((error) => error !== "");

    if (hasErrors) {
      toast.error("لطفا فیلدهای الزامی را تکمیل کنید", {
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

    // Prepare data for API
    const submitData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone: formData.phone,
      password: formData.password,
      email: `user${Date.now()}@example.com`, // Dummy email
      //   password_confirmation: formData.confirmPassword,
    };

    try {
      // API call using Axios - changed endpoint to customer registration
      const response = await axios.post(
        "http://127.0.0.1:8000/api/users/",
        submitData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      console.log(response);
      if (response.status === 201) {
        toast.success(
          "ثبت نام با موفقیت انجام شد! در حال انتقال به صفحه ورود...",
          {
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
          }
        );

        localStorage.setItem("ID", response.data.id);
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          phone: "",
          password: "",
          confirmPassword: "",
        });

        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push("/auth/user-login");
        }, 2000);
      } else {
        throw new Error(response.data.message || "خطا در ثبت نام");
      }
    } catch (error) {
      console.error("Registration error:", error);

      let errorMessage = "خطا در ثبت نام. لطفا مجدد تلاش کنید";

      if (axios.isAxiosError(error)) {
        if (error.response) {
          errorMessage = error.response.data.message || "خطا در سرور";
        } else if (error.request) {
          errorMessage = "خطا در ارتباط با سرور";
        }
      }

      toast.error(errorMessage, {
        duration: 5000,
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

  const handleLoginRedirect = () => {
    router.push("/auth/user-login");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <>
      {/* Toast Container */}
      <Toaster
        toastOptions={{
          className: "",
          style: {
            fontFamily: "var(--font-vazirmatn), sans-serif",
            direction: "rtl",
          },
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <FaUserPlus className="w-8 h-8" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            ثبت نام مشتری
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            اطلاعات شخصی خود را وارد کنید
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
          <div className="bg-white py-8 px-6 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaUser className="ml-2" />
                  اطلاعات شخصی
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      نام*
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <FaUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        value={formData.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`appearance-none block w-full pl-10 pr-12 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-right ${
                          errors.firstName
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        placeholder="نام"
                        dir="rtl"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center justify-end">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      نام خانوادگی*
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <FaIdCard className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        value={formData.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`appearance-none block w-full pl-10 pr-12 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-right ${
                          errors.lastName
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        placeholder="نام خانوادگی"
                        dir="rtl"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center justify-end">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    شماره تماس*
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
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`appearance-none block w-full pl-10 pr-12 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-right ${
                        errors.phone
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      placeholder="0912xxxxxxx"
                      dir="ltr"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center justify-end">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaLock className="ml-2" />
                  اطلاعات امنیتی
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      رمز عبور*
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <FaLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`appearance-none block w-full pl-10 pr-12 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-right ${
                          errors.password
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        placeholder="حداقل ۶ کاراکتر"
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
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600 flex items-center justify-end">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      تکرار رمز عبور*
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <FaLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`appearance-none block w-full pl-10 pr-12 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-right ${
                          errors.confirmPassword
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        placeholder="تکرار رمز عبور"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        {showConfirmPassword ? (
                          <FaEyeSlash className="h-5 w-5" />
                        ) : (
                          <FaEye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600 flex items-center justify-end">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
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
                      در حال ثبت نام...
                    </>
                  ) : (
                    <>
                      <FaUserPlus className="ml-2" />
                      ثبت نام مشتری
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Login Redirect */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    قبلاً حساب دارید؟
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleLoginRedirect}
                  className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md"
                >
                  <FaSignInAlt className="ml-2" />
                  ورود به حساب کاربری
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
