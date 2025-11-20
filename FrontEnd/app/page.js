"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaSignInAlt,
  FaInfoCircle,
  FaSignOutAlt,
} from "react-icons/fa";

const BASE_API = `${process.env.NEXT_PUBLIC_API_URL}`;

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = () => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      setIsLoggedIn(true);
    }
  };

  const fetchUserInfo = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");

      // Replace with your actual API endpoint
      const response = await fetch(`${BASE_API}/store-owners/me/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const responseUser = await fetch(`${BASE_API}/users/me/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok || responseUser.ok) {
        console.log(response);
        console.log(responseUser);
        const userInfo = await responseUser.json();
        const userInfo2 = await response.json();
        if (userInfo.phone) {
          setUserData(userInfo);
        } else {
          setUserData(userInfo2);
        }
        console.log(userData);
        localStorage.setItem("user", JSON.stringify(userInfo));

        // Show success message
        alert("اطلاعات کاربر با موفقیت دریافت شد!");
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      alert("خطا در دریافت اطلاعات کاربر");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserData(null);
    router.push("/");
  };

  const handleLogin = () => {
    router.push("/auth/user-login");
  };
  const handleStoreLogin = () => {
    router.push("/auth/owner-login");
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 font-vazirmatn"
      dir="rtl"
    >
      {/* Header Navigation */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
        {isLoggedIn ? (
          <div className="flex gap-4">
            <button
              onClick={fetchUserInfo}
              disabled={isLoading}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <FaInfoCircle className="w-4 h-4" />
              )}
              <span>دریافت اطلاعات کاربر</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              <FaSignOutAlt className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>
        ) : (
          <div className="gap-8 flex justify-center items-center">
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              <FaSignInAlt className="w-4 h-4" />
              <span>ورود به حساب کاربری</span>
            </button>

            <button
              onClick={handleStoreLogin}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              <FaSignInAlt className="w-4 h-4" />
              <span>ورود به حساب فروشگاه</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20 max-w-md w-full">
        {/* Welcome Message */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg mx-auto mb-4">
            <FaUser className="w-8 h-8" />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isLoggedIn ? "خوش آمدید!" : "به فروشگاه آنلاین خوش آمدید"}
          </h1>

          <p className="text-gray-600 leading-relaxed">
            {isLoggedIn
              ? "از امکانات حساب کاربری خود لذت ببرید"
              : "این صفحه اصلی برنامه فروشگاه آنلاین ما می‌باشد"}
          </p>
        </div>

        {/* User Information Display */}
        {isLoggedIn && userData && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-right">
            <h3 className="font-semibold text-blue-800 mb-2">اطلاعات کاربر:</h3>
            <div className="space-y-1 text-sm text-gray-700">
              {userData.phone && (
                <p>
                  <span className="font-medium">شماره تماس:</span>{" "}
                  {userData.phone}
                </p>
              )}
              {userData.first_name && (
                <p>
                  <span className="font-medium">نام:</span>{" "}
                  {userData.first_name}
                </p>
              )}
              {userData.last_name && (
                <p>
                  <span className="font-medium">نام خانوادگی:</span>{" "}
                  {userData.last_name}
                </p>
              )}
              {userData.email && (
                <p>
                  <span className="font-medium">ایمیل:</span> {userData.email}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Additional Info for Logged-in Users */}
        {isLoggedIn && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-100 border border-green-200 rounded-xl p-4">
            <h3 className="font-semibold text-green-800 mb-2">
              امکانات حساب کاربری
            </h3>
            <ul className="text-sm text-gray-700 space-y-1 text-right">
              <li>• مشاهده و مدیریت پروفایل</li>
              <li>• پیگیری سفارش‌ها</li>
              <li>• مدیریت آدرس‌ها</li>
              <li>• لیست علاقه‌مندی‌ها</li>
            </ul>
          </div>
        )}

        {/* Call to Action for Non-Logged-in Users */}
        {!isLoggedIn && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-100 border border-amber-200 rounded-xl p-4 mt-4">
            <h3 className="font-semibold text-amber-800 mb-2">
              برای دسترسی به امکانات بیشتر
            </h3>
            <p className="text-sm text-gray-700">
              وارد حساب کاربری خود شوید یا یک حساب جدید ایجاد کنید
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-center">
        <p className="text-sm text-gray-500">
          © 2024 فروشگاه آنلاین. تمامی حقوق محفوظ است.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
