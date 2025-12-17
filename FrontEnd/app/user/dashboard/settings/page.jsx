// app/user/dashboard/settings/page.js
"use client";

import { useState, useEffect } from "react";
import { Save, Bell, Globe, Eye, Mail, Smartphone } from "lucide-react";
import { toast } from "react-hot-toast";

const BASE_API = process.env.NEXT_PUBLIC_API_URL;

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    email_notifications: true,
    sms_notifications: true,
    push_notifications: true,
    newsletter: false,
    language: "fa",
    currency: "IRT",
    timezone: "Asia/Tehran",
    privacy_profile: "public",
    two_factor_auth: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const token = localStorage.getItem("accessToken");

    try {
      // API call to fetch user settings
      // const response = await fetch(`${BASE_API}/users/settings/`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });

      // Mock data for now
      setSettings({
        email_notifications: true,
        sms_notifications: true,
        push_notifications: true,
        newsletter: false,
        language: "fa",
        currency: "IRT",
        timezone: "Asia/Tehran",
        privacy_profile: "public",
        two_factor_auth: false,
      });
    } catch (error) {
      console.error("Settings fetch error:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");

      // API call to save settings
      // await fetch(`${BASE_API}/users/settings/`, {
      //   method: "PUT",
      //   headers: {
      //     "Authorization": `Bearer ${token}`,
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(settings),
      // });

      toast.success("تنظیمات با موفقیت ذخیره شد");
    } catch (error) {
      console.error("Settings save error:", error);
      toast.error("خطا در ذخیره تنظیمات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">تنظیمات حساب</h1>
        <p className="text-gray-600 mt-1">
          مدیریت تنظیمات و ترجیحات حساب کاربری
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <Bell className="w-6 h-6 text-gray-400 ml-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              تنظیمات اعلان‌ها
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">اعلان‌های ایمیلی</p>
                <p className="text-sm text-gray-500 mt-1">
                  دریافت ایمیل درباره سفارشات و پیشنهادات
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="email_notifications"
                  checked={settings.email_notifications}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">اعلان‌های پیامکی</p>
                <p className="text-sm text-gray-500 mt-1">
                  دریافت پیامک درباره وضعیت سفارشات
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="sms_notifications"
                  checked={settings.sms_notifications}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">اعلان‌های مرورگر</p>
                <p className="text-sm text-gray-500 mt-1">
                  دریافت اعلان در مرورگر درباره پیشنهادات
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="push_notifications"
                  checked={settings.push_notifications}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">خبرنامه ایمیلی</p>
                <p className="text-sm text-gray-500 mt-1">
                  دریافت آخرین اخبار و پیشنهادات ویژه
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="newsletter"
                  checked={settings.newsletter}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <Globe className="w-6 h-6 text-gray-400 ml-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              ترجیحات کاربری
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                زبان
              </label>
              <select
                name="language"
                value={settings.language}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="fa">فارسی</option>
                <option value="en">English</option>
                <option value="ar">العربیة</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                واحد پول
              </label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="IRT">تومان (IRT)</option>
                <option value="IRR">ریال (IRR)</option>
                <option value="USD">دلار (USD)</option>
                <option value="EUR">یورو (EUR)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                منطقه زمانی
              </label>
              <select
                name="timezone"
                value={settings.timezone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Asia/Tehran">تهران (GMT+3:30)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">نیویورک (EST)</option>
                <option value="Europe/London">لندن (GMT)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حریم خصوصی پروفایل
              </label>
              <select
                name="privacy_profile"
                value={settings.privacy_profile}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="public">عمومی</option>
                <option value="private">خصوصی</option>
                <option value="friends">فقط دوستان</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <Eye className="w-6 h-6 text-gray-400 ml-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              تنظیمات امنیتی
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  احراز هویت دو مرحله‌ای
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  افزایش امنیت حساب با کد ارسالی به ایمیل یا پیامک
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="two_factor_auth"
                  checked={settings.two_factor_auth}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 flex items-center">
                    <Mail className="w-4 h-4 ml-1 text-gray-400" />
                    تأیید ایمیل
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    ایمیل شما تأیید شده است
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  تأیید شده
                </span>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div>
                  <p className="font-medium text-gray-900 flex items-center">
                    <Smartphone className="w-4 h-4 ml-1 text-gray-400" />
                    تأیید شماره تماس
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    شماره تماس شما تأیید شده است
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  تأیید شده
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                در حال ذخیره...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 ml-2" />
                ذخیره تغییرات
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
