// app/user/dashboard/profile/edit/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Save,
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Camera,
  Upload,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import fa from "date-fns/locale/fa-IR";
import { format } from "date-fns-jalali";

registerLocale("fa", fa);

const BASE_API = process.env.NEXT_PUBLIC_API_URL;

const cities = [
  "تهران",
  "مشهد",
  "اصفهان",
  "شیراز",
  "تبریز",
  "کرج",
  "قم",
  "اهواز",
  "کرمانشاه",
  "ارومیه",
  "رشت",
  "زاهدان",
  "کرمان",
  "همدان",
  "یزد",
  "اردبیل",
  "بندرعباس",
  "اسلام‌شهر",
  "قدس",
  "خرم‌آباد",
  "ساری",
  "گرگان",
];

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    birthday: null,
    city: "",
    post_code: "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch(`${BASE_API}/users/me/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Convert birthday string to Date object
        let birthdayDate = null;
        if (data.birthday) {
          try {
            birthdayDate = new Date(data.birthday);
            // Check if date is valid
            if (isNaN(birthdayDate.getTime())) {
              birthdayDate = null;
            }
          } catch (error) {
            console.error("Error parsing birthday:", error);
            birthdayDate = null;
          }
        }

        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          phone: data.phone || "",
          birthday: birthdayDate,
          city: data.city || "",
          post_code: data.post_code || "",
          current_password: "",
          new_password: "",
          confirm_password: "",
        });

        if (data.profile_image) {
          setProfileImage(data.profile_image);
        }
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("User data fetch error:", error);
      toast.error("خطا در دریافت اطلاعات کاربر");
      router.push("/user/dashboard/profile");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Phone number formatting
    let formattedValue = value;
    if (name === "phone") {
      // Remove non-digits and format
      formattedValue = value.replace(/\D/g, "");
      if (formattedValue.length > 11) {
        formattedValue = formattedValue.slice(0, 11);
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue || value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      birthday: date,
    }));
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

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);

      toast.success("تصویر با موفقیت انتخاب شد");
    } catch (error) {
      console.error("Image selection error:", error);
      toast.error("خطا در انتخاب تصویر");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    toast.success("تصویر پروفایل حذف شد");
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.first_name.trim()) {
      newErrors.first_name = "نام الزامی است";
    } else if (formData.first_name.trim().length < 2) {
      newErrors.first_name = "نام باید حداقل ۲ حرف باشد";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "نام خانوادگی الزامی است";
    } else if (formData.last_name.trim().length < 2) {
      newErrors.last_name = "نام خانوادگی باید حداقل ۲ حرف باشد";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "فرمت ایمیل نامعتبر است";
    }

    if (!formData.phone) {
      newErrors.phone = "شماره تماس الزامی است";
    } else if (!/^09\d{9}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "شماره تماس باید با 09 شروع شود و 11 رقم باشد";
    }

    // Password validation (only if any password field is filled)
    const hasPasswordFields =
      formData.current_password ||
      formData.new_password ||
      formData.confirm_password;

    if (hasPasswordFields) {
      if (!formData.current_password) {
        newErrors.current_password = "رمز عبور فعلی الزامی است";
      }

      if (!formData.new_password) {
        newErrors.new_password = "رمز عبور جدید الزامی است";
      } else if (formData.new_password.length < 6) {
        newErrors.new_password = "رمز عبور باید حداقل ۶ کاراکتر باشد";
      }

      if (!formData.confirm_password) {
        newErrors.confirm_password = "تکرار رمز عبور الزامی است";
      } else if (formData.new_password !== formData.confirm_password) {
        newErrors.confirm_password = "رمز عبور و تکرار آن مطابقت ندارند";
      }
    }

    // Birthday validation (if provided)
    if (formData.birthday) {
      const today = new Date();
      const birthDate = new Date(formData.birthday);

      if (birthDate > today) {
        newErrors.birthday = "تاریخ تولد نمی‌تواند در آینده باشد";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("لطفا خطاهای فرم را بررسی کنید");
      return;
    }

    setSaving(true);
    const token = localStorage.getItem("accessToken");

    try {
      // Prepare data for API
      const submitData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email || null,
        phone: formData.phone,
        city: formData.city || null,
        post_code: formData.post_code || null,
      };

      // Add birthday if provided
      if (formData.birthday) {
        submitData.birthday = formData.birthday.toISOString().split("T")[0];
      }

      // Update profile
      const response = await fetch(`${BASE_API}/users/me/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "خطا در به‌روزرسانی پروفایل");
      }

      // Handle password change if provided
      if (formData.current_password && formData.new_password) {
        const passwordResponse = await fetch(
          `${BASE_API}/users/change-password/`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              current_password: formData.current_password,
              new_password: formData.new_password,
            }),
          }
        );

        if (!passwordResponse.ok) {
          const errorData = await passwordResponse.json();
          throw new Error(errorData.detail || "خطا در تغییر رمز عبور");
        }
      }

      // Handle image upload if new image selected
      if (profileImage && profileImage.startsWith("data:image")) {
        const imageFormData = new FormData();
        const blob = await (await fetch(profileImage)).blob();
        imageFormData.append("profile_image", blob, "profile.jpg");

        const imageResponse = await fetch(
          `${BASE_API}/users/upload-profile-image/`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: imageFormData,
          }
        );

        if (!imageResponse.ok) {
          console.warn("Image upload failed, but profile was updated");
        }
      }

      toast.success("پروفایل با موفقیت به‌روزرسانی شد");

      // Redirect back to profile page
      setTimeout(() => {
        router.push("/user/dashboard/profile");
      }, 1500);
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.message || "خطا در به‌روزرسانی پروفایل");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    const firstChar = formData.first_name ? formData.first_name.charAt(0) : "";
    const lastChar = formData.last_name ? formData.last_name.charAt(0) : "";
    return (firstChar + lastChar).toUpperCase() || "ک";
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Link
              href="/user/dashboard/profile"
              className="text-gray-500 hover:text-gray-700"
            >
              پروفایل
            </Link>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <h1 className="text-2xl font-bold text-gray-900">ویرایش پروفایل</h1>
          </div>
          <p className="text-gray-600 mt-1">
            اطلاعات شخصی خود را به‌روزرسانی کنید
          </p>
        </div>
        <Link
          href="/user/dashboard/profile"
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
        >
          <X className="w-4 h-4 ml-2" />
          انصراف
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            تصویر پروفایل
          </h2>

          <div className="flex flex-col md:flex-row md:items-center space-y-6 md:space-y-0 md:space-x-6 md:space-x-reverse">
            {/* Current Image */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-blue-600">
                    {getInitials()}
                  </div>
                )}
              </div>

              {/* Remove button */}
              {profileImage && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex-1">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    تصویر پروفایل شما به سایر کاربران نمایش داده می‌شود. بهترین
                    اندازه ۵۰۰x500 پیکسل است.
                  </p>
                </div>

                <div className="flex space-x-3 space-x-reverse">
                  <label className="flex-1">
                    <div className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3 group-hover:text-blue-500" />
                      <p className="text-sm text-gray-600 mb-1">
                        آپلود تصویر جدید
                      </p>
                      <p className="text-xs text-gray-500">
                        JPG, PNG یا GIF تا ۵MB
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </div>
                  </label>

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={!profileImage}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    حذف تصویر
                  </button>
                </div>

                {uploadingImage && (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">
                      در حال آپلود...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            اطلاعات شخصی
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <User className="w-4 h-4 ml-1" />
                نام <span className="text-red-500 mr-1">*</span>
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.first_name
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="نام"
                dir="rtl"
              />
              {errors.first_name && (
                <p className="mt-2 text-sm text-red-600">{errors.first_name}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <User className="w-4 h-4 ml-1" />
                نام خانوادگی <span className="text-red-500 mr-1">*</span>
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.last_name
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="نام خانوادگی"
                dir="rtl"
              />
              {errors.last_name && (
                <p className="mt-2 text-sm text-red-600">{errors.last_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Mail className="w-4 h-4 ml-1" />
                آدرس ایمیل
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.email
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="example@email.com"
                dir="ltr"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                برای دریافت اطلاعیه‌ها و بازیابی رمز عبور
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Phone className="w-4 h-4 ml-1" />
                شماره تماس <span className="text-red-500 mr-1">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.phone
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="09123456789"
                dir="ltr"
                maxLength="11"
              />
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Birthday */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 ml-1" />
                تاریخ تولد
              </label>
              <div className="relative">
                <DatePicker
                  selected={formData.birthday}
                  onChange={handleDateChange}
                  dateFormat="yyyy/MM/dd"
                  locale="fa"
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={50}
                  maxDate={new Date()}
                  placeholderText="انتخاب تاریخ"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.birthday
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  wrapperClassName="w-full"
                  calendarClassName="font-vazirmatn"
                />
              </div>
              {errors.birthday && (
                <p className="mt-2 text-sm text-red-600">{errors.birthday}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MapPin className="w-4 h-4 ml-1" />
                شهر
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors"
              >
                <option value="">انتخاب شهر</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Postal Code */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MapPin className="w-4 h-4 ml-1" />
                کد پستی
              </label>
              <input
                type="text"
                name="post_code"
                value={formData.post_code}
                onChange={handleChange}
                className="w-full md:w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors"
                placeholder="۱۰ رقمی"
                maxLength="10"
                dir="ltr"
              />
              <p className="text-xs text-gray-500 mt-1">
                برای سفارشات و ارسال پستی
              </p>
            </div>
          </div>
        </div>

        {/* Password Change (Optional) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            تغییر رمز عبور
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            برای تغییر رمز عبور، فیلدهای زیر را پر کنید. در غیر این صورت، خالی
            بگذارید.
          </p>

          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رمز عبور فعلی
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 transition-colors ${
                    errors.current_password
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="رمز عبور فعلی"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.current_password && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.current_password}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رمز عبور جدید
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 transition-colors ${
                    errors.new_password
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="رمز عبور جدید"
                />
              </div>
              {errors.new_password && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.new_password}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">حداقل ۶ کاراکتر</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تکرار رمز عبور جدید
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 transition-colors ${
                    errors.confirm_password
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="تکرار رمز عبور جدید"
                />
              </div>
              {errors.confirm_password && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.confirm_password}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={saving}
          >
            انصراف
          </button>

          <div className="flex space-x-3 space-x-reverse">
            <Link
              href="/user/dashboard/profile"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              لغو
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
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
        </div>
      </form>

      {/* Delete Account Section (Danger Zone) */}
      <div className="border border-red-200 rounded-xl p-6 bg-red-50">
        <h2 className="text-lg font-semibold text-red-900 mb-3">منطقه خطر</h2>
        <p className="text-red-700 mb-4">
          حذف حساب کاربری شما به معنای حذف تمام اطلاعات شما از سیستم است. این
          عمل غیرقابل بازگشت است.
        </p>
        <button
          type="button"
          onClick={() => {
            if (
              confirm(
                "آیا مطمئن هستید که می‌خواهید حساب کاربری خود را حذف کنید؟ این عمل غیرقابل بازگشت است."
              )
            ) {
              toast.success("درخواست حذف حساب ثبت شد");
            }
          }}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          حذف حساب کاربری
        </button>
      </div>
    </div>
  );
}
