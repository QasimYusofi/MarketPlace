// app/user/dashboard/security/page.js
"use client";

import { useState } from "react";
import { Lock, Key, Shield, Eye, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";

const BASE_API = process.env.NEXT_PUBLIC_API_URL;

export default function SecurityPage() {
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password) {
        toast.error("لطفا تمام فیلدها را پر کنید");
        setLoading(false);
        return;
      }

      if (passwordForm.new_password.length < 6) {
        toast.error("رمز عبور باید حداقل ۶ کاراکتر باشد");
        setLoading(false);
        return;
      }

      if (passwordForm.new_password !== passwordForm.confirm_password) {
        toast.error("رمز عبور و تکرار آن مطابقت ندارند");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("accessToken");
      
      // API call to change password
      // await fetch(`${BASE_API}/users/change-password/`, {
      //   method: "POST",
      //   headers: {
      //     "Authorization": `Bearer ${token}`,
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     current_password: passwordForm.current_password,
      //     new_password: passwordForm.new_password,
      //   }),
      // });

      // Mock success
      setTimeout(() => {
        toast.success("رمز عبور با موفقیت تغییر کرد");
        setPasswordForm({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
      }, 1000);

    } catch (error) {
      console.error("Password change error:", error);
      toast.error("خطا در تغییر رمز عبور");
    } finally {
      setLoading(false);
    }
  };

  const securityFeatures = [
    {
      title: "ایمیل تأیید شده",
      description: "ایمیل شما با موفقیت تأیید شده است",
      status: "active",
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    },
    {
      title: "شماره تماس تأیید شده",
      description: "شماره تماس شما با موفقیت تأیید شده است",
      status: "active",
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    },
    {
      title: "رمز عبور قوی",
      description: "رمز عبور شما از امنیت مناسبی برخوردار است",
      status: "active",
      icon: <Shield className="w-5 h-5 text-blue-500" />,
    },
    {
      title: "احراز هویت دو مرحله‌ای",
      description: "برای امنیت بیشتر فعال کنید",
      status: "inactive",
      icon: <Key className="w-5 h-5 text-gray-400" />,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">امنیت حساب</h1>
        <p className="text-gray-600 mt-1">مدیریت امنیت و رمز عبور حساب کاربری</p>
      </div>

      {/* Security Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Shield className="w-6 h-6 text-gray-400 ml-2" />
          <h2 className="text-lg font-semibold text-gray-900">وضعیت امنیتی</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {securityFeatures.map((feature, index) => (
            <div
              key={index}
              className="flex items-center p-4 border border-gray-200 rounded-lg"
            >
              <div className="ml-3">
                {feature.icon}
              </div>
              <div className="mr-3">
                <p className="font-medium text-gray-900">{feature.title}</p>
                <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
              </div>
              <div className="mr-auto">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  feature.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {feature.status === "active" ? "فعال" : "غیرفعال"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">نکته امنیتی:</span> برای حفظ امنیت حساب خود، هر چند وقت یک بار رمز عبور خود را تغییر دهید و از احراز هویت دو مرحله‌ای استفاده کنید.
          </p>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Lock className="w-6 h-6 text-gray-400 ml-2" />
          <h2 className="text-lg font-semibold text-gray-900">تغییر رمز عبور</h2>
        </div>
        
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رمز عبور فعلی
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                name="current_password"
                value={passwordForm.current_password}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                placeholder="رمز عبور فعلی خود را وارد کنید"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رمز عبور جدید
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="new_password"
                value={passwordForm.new_password}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                placeholder="رمز عبور جدید خود را وارد کنید"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">رمز عبور باید حداقل ۶ کاراکتر باشد</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تکرار رمز عبور جدید
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                value={passwordForm.confirm_password}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                placeholder="رمز عبور جدید را تکرار کنید"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                  در حال تغییر رمز عبور...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 ml-2" />
                  تغییر رمز عبور
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Security Sessions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">نشست‌های فعال</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Chrome - Windows</p>
              <p className="text-sm text-gray-500 mt-1">
                تهران، ایران • آخرین فعالیت: ۵ دقیقه پیش
              </p>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                فعلی
              </span>
              <button className="text-red-600 hover:text-red-700 text-sm">
                خاتمه نشست
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Safari - iPhone</p>
              <p className="text-sm text-gray-500 mt-1">
                تهران، ایران • آخرین فعالیت: ۲ روز پیش
              </p>
            </div>
            <button className="text-red-600 hover:text-red-700 text-sm">
              خاتمه نشست
            </button>
          </div>
        </div>

        <div className="mt-6">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            خاتمه همه نشست‌های دیگر
          </button>
        </div>
      </div>
    </div>
  );
}