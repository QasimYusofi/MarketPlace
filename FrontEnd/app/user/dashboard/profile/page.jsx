// app/user/dashboard/profile/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit,
  Shield,
  CheckCircle,
  XCircle,
  Upload,
  Camera,
  Star,
  Package,
  CreditCard,
  Award,
  Bell,
  Globe,
  Lock,
} from "lucide-react";
import { toast } from "react-hot-toast";

const BASE_API = process.env.NEXT_PUBLIC_API_URL;

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch(`${BASE_API}/users/me/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setIsVerified(data.is_verified || data.email_verified);

        // If profile image exists in API response
        if (data.profile_image) {
          setProfileImage(data.profile_image);
        }
      } else {
        throw new Error("Failed to fetch profile");
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      toast.error("خطا در دریافت اطلاعات پروفایل");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("فرمت فایل باید JPG، PNG یا GIF باشد");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      toast.error("حجم فایل نباید بیشتر از ۵ مگابایت باشد");
      return;
    }

    setUploadingImage(true);
    const token = localStorage.getItem("accessToken");

    try {
      const formData = new FormData();
      formData.append("profile_image", file);

      const response = await fetch(`${BASE_API}/users/upload-profile-image/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setProfileImage(URL.createObjectURL(file)); // Show preview
        toast.success("تصویر پروفایل با موفقیت آپلود شد");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("خطا در آپلود تصویر");
    } finally {
      setUploadingImage(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "ثبت نشده";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fa-IR");
    } catch {
      return "نامعتبر";
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return "ثبت نشده";
    // Format: 0912 345 6789
    return phone.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");
  };

  const getInitials = (firstName, lastName) => {
    const firstChar = firstName ? firstName.charAt(0) : "";
    const lastChar = lastName ? lastName.charAt(0) : "";
    return (firstChar + lastChar).toUpperCase() || "ک";
  };

  const handleResendVerification = () => {
    toast.success("لینک تأیید به ایمیل شما ارسال شد");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">پروفایل کاربری</h1>
          <p className="text-gray-600 mt-1">مشاهده و مدیریت اطلاعات شخصی شما</p>
        </div>
        <div className="flex space-x-3 space-x-reverse mt-4 md:mt-0">
          <Link
            href="/user/dashboard/profile/edit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Edit className="w-4 h-4 ml-2" />
            ویرایش پروفایل
          </Link>
          <Link
            href="/user/dashboard/security"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <Shield className="w-4 h-4 ml-2" />
            امنیت حساب
          </Link>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 overflow-hidden">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
                    {getInitials(user?.first_name, user?.last_name)}
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <label className="absolute bottom-0 left-0 bg-white text-blue-600 p-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
                {uploadingImage ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </label>
            </div>

            {/* User Info */}
            <div>
              <h2 className="text-2xl font-bold">
                {user?.first_name || "کاربر"} {user?.last_name || ""}
              </h2>
              <p className="text-blue-100 mt-1">{user?.email || user?.phone}</p>
              <div className="flex items-center mt-3 space-x-3 space-x-reverse">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  عضو از {formatDate(user?.date_joined)}
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm flex items-center">
                  <Star className="w-3 h-3 ml-1" />
                  امتیاز کاربر: ۴.۸
                </span>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div
            className={`mt-6 md:mt-0 px-4 py-2 rounded-lg ${
              isVerified ? "bg-green-500/30" : "bg-yellow-500/30"
            }`}
          >
            <div className="flex items-center">
              {isVerified ? (
                <CheckCircle className="w-5 h-5 ml-2" />
              ) : (
                <XCircle className="w-5 h-5 ml-2" />
              )}
              <div>
                <p className="font-medium">
                  {isVerified
                    ? "حساب کاربری تایید شده"
                    : "حساب کاربری تایید نشده"}
                </p>
                {!isVerified && (
                  <button
                    onClick={handleResendVerification}
                    className="text-sm underline mt-1 hover:text-white/80"
                  >
                    ارسال مجدد لینک تأیید
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 ml-2" />
                اطلاعات شخصی
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField
                  icon={<User className="w-4 h-4" />}
                  label="نام"
                  value={user?.first_name || "ثبت نشده"}
                />
                <InfoField
                  icon={<User className="w-4 h-4" />}
                  label="نام خانوادگی"
                  value={user?.last_name || "ثبت نشده"}
                />
                <InfoField
                  icon={<Mail className="w-4 h-4" />}
                  label="آدرس ایمیل"
                  value={user?.email || "ثبت نشده"}
                  verified={user?.email_verified}
                />
                <InfoField
                  icon={<Phone className="w-4 h-4" />}
                  label="شماره تماس"
                  value={formatPhoneNumber(user?.phone)}
                  verified={user?.phone_verified}
                />
                <InfoField
                  icon={<Calendar className="w-4 h-4" />}
                  label="تاریخ تولد"
                  value={formatDate(user?.birthday)}
                />
                <InfoField
                  icon={<MapPin className="w-4 h-4" />}
                  label="شهر"
                  value={user?.city || "ثبت نشده"}
                />
              </div>

              {/* Additional Information */}
              {user?.post_code && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <InfoField
                    icon={<MapPin className="w-4 h-4" />}
                    label="کد پستی"
                    value={user.post_code}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                فعالیت اخیر
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <ActivityItem
                  icon={<Package className="w-5 h-5 text-blue-500" />}
                  title="سفارش جدید"
                  description="سفارش #ORD-12345 با موفقیت ثبت شد"
                  time="۲ ساعت پیش"
                />
                <ActivityItem
                  icon={<CheckCircle className="w-5 h-5 text-green-500" />}
                  title="تأیید ایمیل"
                  description="آدرس ایمیل شما تأیید شد"
                  time="۱ روز پیش"
                />
                <ActivityItem
                  icon={<CreditCard className="w-5 h-5 text-purple-500" />}
                  title="روش پرداخت"
                  description="کارت بانکی جدید اضافه شد"
                  time="۳ روز پیش"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Quick Actions */}
        <div className="space-y-6">
          {/* Account Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              آمار حساب
            </h3>
            <div className="space-y-4">
              <StatItem
                icon={<Package className="w-5 h-5" />}
                label="کل سفارشات"
                value="۱۲"
                color="text-blue-600"
              />
              <StatItem
                icon={<CheckCircle className="w-5 h-5" />}
                label="تحویل شده"
                value="۱۰"
                color="text-green-600"
              />
              <StatItem
                icon={<Star className="w-5 h-5" />}
                label="نظرات ثبت شده"
                value="۸"
                color="text-yellow-600"
              />
              <StatItem
                icon={<Award className="w-5 h-5" />}
                label="امتیاز کل"
                value="۲۴۵"
                color="text-purple-600"
              />
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">مبلغ کل خریدها</span>
                <span className="text-xl font-bold text-gray-900">
                  ۲,۵۰۰,۰۰۰ تومان
                </span>
              </div>
            </div>
          </div>

          {/* Quick Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              تنظیمات سریع
            </h3>
            <div className="space-y-3">
              <QuickSettingLink
                href="/user/dashboard/notifications"
                icon={<Bell className="w-5 h-5" />}
                label="اعلان‌ها"
              />
              <QuickSettingLink
                href="/user/dashboard/settings"
                icon={<Globe className="w-5 h-5" />}
                label="تنظیمات حساب"
              />
              <QuickSettingLink
                href="/user/dashboard/security"
                icon={<Lock className="w-5 h-5" />}
                label="امنیت و رمز عبور"
              />
              <QuickSettingLink
                href="/user/dashboard/addresses"
                icon={<MapPin className="w-5 h-5" />}
                label="آدرس‌ها"
              />
            </div>
          </div>

          {/* Membership Status */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">وضعیت عضویت</h3>
              <Award className="w-6 h-6" />
            </div>
            <p className="text-sm opacity-90">کاربر عادی</p>
            <div className="mt-4">
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: "65%" }}
                ></div>
              </div>
              <p className="text-xs mt-2 opacity-80">
                ۶۵٪ تا ارتقاء به سطح نقره‌ای
              </p>
            </div>
            <button className="w-full mt-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm">
              مشاهده سطوح عضویت
            </button>
          </div>
        </div>
      </div>

      {/* Account Preferences */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">ترجیحات حساب</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PreferenceItem
              title="اعلان‌های ایمیلی"
              status="فعال"
              statusColor="green"
            />
            <PreferenceItem
              title="اعلان‌های پیامکی"
              status="فعال"
              statusColor="green"
            />
            <PreferenceItem
              title="خبرنامه"
              status="غیرفعال"
              statusColor="gray"
            />
            <PreferenceItem
              title="حریم خصوصی پروفایل"
              status="عمومی"
              statusColor="blue"
            />
            <PreferenceItem title="زبان" status="فارسی" statusColor="blue" />
            <PreferenceItem
              title="واحد پول"
              status="تومان"
              statusColor="blue"
            />
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100">
            <Link
              href="/user/dashboard/settings"
              className="text-blue-600 hover:text-blue-700 flex items-center"
            >
              مدیریت تمام تنظیمات
              <Edit className="w-4 h-4 mr-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function InfoField({ icon, label, value, verified = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-2 flex items-center">
        {icon}
        <span className="mr-2">{label}</span>
        {verified && <CheckCircle className="w-4 h-4 text-green-500" />}
      </label>
      <p className="text-gray-900">{value}</p>
    </div>
  );
}

function ActivityItem({ icon, title, description, time }) {
  return (
    <div className="flex items-start space-x-3 space-x-reverse">
      <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <span className="text-xs text-gray-500 whitespace-nowrap">{time}</span>
    </div>
  );
}

function StatItem({ icon, label, value, color }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg bg-gray-50 ${color}`}>{icon}</div>
        <span className="mr-3 text-gray-600">{label}</span>
      </div>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}

function QuickSettingLink({ href, icon, label }) {
  return (
    <Link
      href={href}
      className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
    >
      <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
        {icon}
      </div>
      <span className="flex-1 mr-3">{label}</span>
      <svg
        className="w-4 h-4 text-gray-400 transform group-hover:translate-x-1 transition-transform"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </Link>
  );
}

function PreferenceItem({ title, status, statusColor }) {
  const colorClasses = {
    green: "bg-green-100 text-green-800",
    blue: "bg-blue-100 text-blue-800",
    gray: "bg-gray-100 text-gray-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
  };

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
      <span className="text-gray-900">{title}</span>
      <span
        className={`px-3 py-1 rounded-full text-sm ${
          colorClasses[statusColor] || colorClasses.gray
        }`}
      >
        {status}
      </span>
    </div>
  );
}
