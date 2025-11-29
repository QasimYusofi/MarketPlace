"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Loading from "@/components/ui/Loading";

import {
  User,
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  Edit3,
  CheckCircle,
  Upload,
  Image as ImageIcon,
  Loader2,
  Store,
  Briefcase,
  FileText,
  Home,
  Navigation,
  X,
} from "lucide-react";

// لیست استان‌های ایران
const iranianProvinces = [
  "تهران",
  "خراسان رضوی",
  "اصفهان",
  "فارس",
  "خوزستان",
  "آذربایجان شرقی",
  "مازندران",
  "آذربایجان غربی",
  "کرمان",
  "گیلان",
  "سیستان و بلوچستان",
  "هرمزگان",
  "قزوین",
  "کردستان",
  "بوشهر",
  "لرستان",
  "قم",
  "یزد",
  "اردبیل",
  "مرکزی",
  "همدان",
  "کهگیلویه و بویراحمد",
  "زنجان",
  "ایلام",
  "چهارمحال و بختیاری",
  "سمنان",
  "گلستان",
  "خراسان شمالی",
  "خراسان جنوبی",
  "البرز",
];

const BASE_API = `${process.env.NEXT_PUBLIC_API_URL}`;

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("store");
  const [uploadingImageType, setUploadingImageType] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [storeLogoPreview, setStoreLogoPreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
    trigger,
  } = useForm();

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user) {
      resetFormWithUserData();
      updateImagePreviews();
    }
  }, [activeTab, user]);

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  };

  const fetchUserData = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error("No authentication token found");
        setIsLoading(false);
        return;
      }

      console.log("🔄 Fetching store owner data...");
      const response = await fetch(`${BASE_API}/store-owners/me/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const userData = await response.json();
      console.log("✅ Store owner data:", userData);

      setUser(userData);
      resetFormWithUserData(userData);
      updateImagePreviews(userData);
    } catch (error) {
      console.error("💥 Error fetching user:", error);
      toast.error("خطا در دریافت اطلاعات کاربر");
    } finally {
      setIsLoading(false);
    }
  };

  const updateImagePreviews = (userData = null) => {
    const data = userData || user;
    if (!data) return;

    console.log("🖼️ Updating image previews...");

    // Profile image - using has_profile_image and profile_image_info
    if (data.has_profile_image && data.profile_image_info) {
      const profileUrl = getImageUrl(data.profile_image_info);
      console.log("🖼️ Profile image URL:", profileUrl ? "Generated" : "Null");
      setProfileImagePreview(profileUrl);
    } else {
      setProfileImagePreview(null);
    }

    // Store logo - using has_store_logo and store_logo_info
    if (data.has_store_logo && data.store_logo_info) {
      const logoUrl = getImageUrl(data.store_logo_info);
      console.log("🖼️ Store logo URL:", logoUrl ? "Generated" : "Null");
      setStoreLogoPreview(logoUrl);
    } else {
      setStoreLogoPreview(null);
    }
  };

  const resetFormWithUserData = (userData = null) => {
    const data = userData || user;
    if (!data) return;

    const formData = {
      // Personal Information - using your exact API field names
      first_name: data.first_name || "",
      last_name: data.last_name || "",
      phone: data.phone || "",
      email: data.email || "",
      seller_address: data.seller_address || "",
      seller_bio: data.seller_bio || "",
      seller_license_id: data.seller_license_id || "",
      post_code: data.post_code || "",
      city: data.city || "",
      birthday: data.birthday
        ? new Date(data.birthday).toISOString().split("T")[0]
        : "",

      // Store Information
      store_name: data.store_name || "",
      store_description: data.store_description || "",
      store_domain: data.store_domain || "",
      store_type: data.store_type || "single-vendor",
      store_established_at: data.store_established_at
        ? new Date(data.store_established_at).toISOString().split("T")[0]
        : "",
    };

    reset(formData);
  };

  // Improved getImageUrl function for Django API
  const getImageUrl = (imageInfo) => {
    if (!imageInfo) {
      console.log("🖼️ No image info provided");
      return null;
    }

    try {
      console.log("🖼️ Processing image info:", imageInfo);

      // If image URL is provided directly by Django
      if (imageInfo.url) {
        // Handle relative URLs by prepending base API URL if needed
        if (imageInfo.url.startsWith("/")) {
          return `${BASE_API}${imageInfo.url}`;
        }
        return imageInfo.url;
      }

      // If we have filename and using Django media URLs
      if (imageInfo.filename) {
        return `${BASE_API}${imageInfo.filename}`;
      }

      // If it's a simple image field URL
      if (typeof imageInfo === "string" && imageInfo.startsWith("http")) {
        return imageInfo;
      }

      // If it's a base64 data URL
      if (typeof imageInfo === "string" && imageInfo.startsWith("data:")) {
        return imageInfo;
      }

      console.warn("🖼️ Unknown image info format:", imageInfo);
      return null;
    } catch (error) {
      console.error("❌ Error creating image URL:", error);
      return null;
    }
  };

  const onSubmit = async (formData) => {
    const isValid = await trigger();
    if (!isValid) {
      toast.error("لطفا اطلاعات فرم را به درستی تکمیل کنید");
      return;
    }

    setIsUpdating(true);
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("لطفا ابتدا وارد شوید");
        return;
      }

      console.log("🔄 Updating user data:", formData);

      // Prepare data for Django API - using exact field names from your API
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        seller_address: formData.seller_address,
        seller_bio: formData.seller_bio,
        seller_license_id: formData.seller_license_id,
        post_code: formData.post_code,
        city: formData.city,
        birthday: formData.birthday,
        store_name: formData.store_name,
        store_description: formData.store_description,
        store_domain: formData.store_domain,
        store_type: formData.store_type,
        store_established_at: formData.store_established_at,
      };

      // Remove empty values
      Object.keys(updateData).forEach((key) => {
        if (
          updateData[key] === null ||
          updateData[key] === undefined ||
          updateData[key] === ""
        ) {
          delete updateData[key];
        }
      });

      const response = await fetch(`${BASE_API}/store-owners/me/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("✅ Update result:", result);

      setUser(result);
      setIsEditing(false);
      toast.success("✅ پروفایل با موفقیت به‌روزرسانی شد");
    } catch (error) {
      console.error("💥 Update error:", error);
      toast.error(error.message || "خطا در به‌روزرسانی پروفایل");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageUpload = async (event, imageType = "profile") => {
    const file = event.target.files[0];
    if (!file) return;

    console.log("📁 Selected file:", {
      name: file.name,
      type: file.type,
      size: file.size,
      imageType: imageType,
    });

    // Client-side validation
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم فایل نباید بیشتر از ۵ مگابایت باشد");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("فایل باید یک تصویر باشد");
      return;
    }

    // Create temporary preview
    const previewUrl = URL.createObjectURL(file);
    if (imageType === "profile") {
      setProfileImagePreview(previewUrl);
    } else {
      setStoreLogoPreview(previewUrl);
    }

    setIsUploading(true);
    setUploadingImageType(imageType);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("لطفا ابتدا وارد شوید");
      }

      const formData = new FormData();
      formData.append(imageType === "profile" ? "profile_image" : "logo", file);

      console.log("🔄 Starting image upload...");

      const endpoint =
        imageType === "profile"
          ? `${BASE_API}/store-owners/me/upload-profile-image/`
          : `${BASE_API}/store-owners/me/upload-store-logo/`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log("📡 Upload response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `Upload failed with status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("📦 Upload result:", result);

      // Update user state with new data
      setUser(result);

      // Update previews with the actual saved image
      if (imageType === "profile") {
        const newProfileUrl = getImageUrl(result.profile_image_info);
        setProfileImagePreview(newProfileUrl);
      } else {
        const newLogoUrl = getImageUrl(result.store_logo_info);
        setStoreLogoPreview(newLogoUrl);
      }

      toast.success(
        `✅ ${
          imageType === "profile" ? "تصویر پروفایل" : "لوگوی فروشگاه"
        } با موفقیت آپلود شد`
      );
    } catch (error) {
      console.error("💥 Upload error:", error);
      toast.error(`خطا در آپلود: ${error.message}`);

      // Revert preview on error
      if (imageType === "profile") {
        setProfileImagePreview(
          user?.profile_image_info ? getImageUrl(user.profile_image_info) : null
        );
      } else {
        setStoreLogoPreview(
          user?.store_logo_info ? getImageUrl(user.store_logo_info) : null
        );
      }
    } finally {
      setIsUploading(false);
      setUploadingImageType(null);
      event.target.value = "";
    }
  };

  const removeImage = async (imageType = "profile") => {
    if (
      !confirm(
        `آیا از حذف ${
          imageType === "profile" ? "تصویر پروفایل" : "لوگوی فروشگاه"
        } اطمینان دارید؟`
      )
    ) {
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("لطفا ابتدا وارد شوید");
      }

      const endpoint =
        imageType === "profile"
          ? `${BASE_API}/store-owners/me/remove-profile-image/`
          : `${BASE_API}/store-owners/me/remove-store-logo/`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `Delete failed with status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("✅ Remove image result:", result);

      setUser(result);
      if (imageType === "profile") {
        setProfileImagePreview(null);
      } else {
        setStoreLogoPreview(null);
      }

      toast.success(
        `✅ ${
          imageType === "profile" ? "تصویر پروفایل" : "لوگوی فروشگاه"
        } با موفقیت حذف شد`
      );
    } catch (error) {
      console.error("💥 Remove image error:", error);
      toast.error(error.message || "خطا در حذف تصویر");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "ثبت نشده";
    try {
      return new Date(dateString).toLocaleDateString("fa-IR");
    } catch {
      return "نامعتبر";
    }
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return "";
    return (
      `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
      user.full_name ||
      "کاربر"
    );
  };

  if (isLoading) {
    return <Loading fullScreen={true} />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">
            خطا در بارگذاری اطلاعات کاربر
          </div>
          <button
            onClick={fetchUserData}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">پروفایل فروشگاه</h1>
            <p className="text-blue-100 mt-2">مدیریت اطلاعات شخصی و فروشگاه</p>
          </div>
          <div className="bg-white/20 p-3 rounded-xl">
            <Store className="w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="text-center">
              {/* Profile Avatar with Upload */}
              <div className="relative inline-block mb-4 group">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg mx-auto overflow-hidden">
                  {profileImagePreview ? (
                    <img
                      src={profileImagePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("❌ Profile image failed to load");
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-full h-full items-center justify-center ${
                      profileImagePreview ? "hidden" : "flex"
                    }`}
                  >
                    <User className="w-16 h-16 text-white" />
                  </div>
                </div>

                {/* Upload/Remove Buttons */}
                {isEditing && (
                  <div className="absolute bottom-2 right-2 flex space-x-2 space-x-reverse">
                    <label className="bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors border border-gray-200">
                      {isUploading && uploadingImageType === "profile" ? (
                        <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 text-gray-600" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "profile")}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>

                    {profileImagePreview && (
                      <button
                        onClick={() => removeImage("profile")}
                        className="bg-red-500 p-2 rounded-full shadow-lg cursor-pointer hover:bg-red-600 transition-colors text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* Online Status */}
                <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>

              <h2 className="text-xl font-bold text-gray-900">
                {getUserDisplayName()}
              </h2>
              <p className="text-gray-600 text-sm mt-1">{user.phone}</p>
              {user.email && (
                <p className="text-gray-600 text-sm">{user.email}</p>
              )}

              {/* Verification Badge */}
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm mt-3 ${
                  user.seller_status === "approved"
                    ? "bg-green-50 text-green-700"
                    : "bg-yellow-50 text-yellow-700"
                }`}
              >
                <CheckCircle className="w-4 h-4 ml-1" />
                {user.seller_status === "approved"
                  ? "تایید شده"
                  : "در انتظار تایید"}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {user.active_products_count || 0}
                </div>
                <div className="text-xs text-gray-500">محصولات فعال</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {user.total_sales || 0}
                </div>
                <div className="text-xs text-gray-500">فروش کل</div>
              </div>
            </div>
          </div>

          {/* Store Info Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Store className="w-5 h-5 ml-2 text-gray-600" />
              اطلاعات فروشگاه
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">نام فروشگاه:</span>
                <span className="text-sm text-gray-900 font-medium">
                  {user.store_name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">شهر:</span>
                <span className="text-sm text-gray-900">{user.city}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">نوع:</span>
                <span className="text-sm text-gray-900">
                  {user.store_type === "multi-vendor"
                    ? "چند فروشنده"
                    : "تک فروشنده"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">تاریخ عضویت:</span>
                <span className="text-sm text-gray-900">
                  {formatDate(user.seller_join_date)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Edit Forms */}
        <div className="lg:col-span-3">
          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("store")}
                  className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-200 ${
                    activeTab === "store"
                      ? "bg-blue-50 text-blue-600 border-b-2 border-blue-500"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Store className="w-5 h-5 inline ml-2" />
                  اطلاعات فروشگاه
                </button>
                <button
                  onClick={() => setActiveTab("personal")}
                  className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-200 ${
                    activeTab === "personal"
                      ? "bg-blue-50 text-blue-600 border-b-2 border-blue-500"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <User className="w-5 h-5 inline ml-2" />
                  اطلاعات شخصی
                </button>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              {activeTab === "store" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Store Logo Upload */}
                  <div className="md:col-span-2 space-y-4">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <ImageIcon className="w-4 h-4 ml-2 text-gray-500" />
                      لوگوی فروشگاه
                    </label>
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                        {storeLogoPreview ? (
                          <img
                            src={storeLogoPreview}
                            alt="Store Logo"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error("❌ Store logo failed to load");
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-full h-full items-center justify-center ${
                            storeLogoPreview ? "hidden" : "flex"
                          }`}
                        >
                          <Store className="w-8 h-8 text-gray-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        {isEditing ? (
                          <div className="flex space-x-3 space-x-reverse gap-3">
                            <label className="flex-1 cursor-pointer">
                              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-400 transition-colors bg-gray-50 hover:bg-blue-50">
                                {isUploading &&
                                uploadingImageType === "logo" ? (
                                  <div className="flex items-center justify-center space-x-2 space-x-reverse text-blue-600">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">
                                      در حال آپلود...
                                    </span>
                                  </div>
                                ) : (
                                  <div className="text-gray-600">
                                    <Upload className="w-6 h-6 mx-auto mb-1" />
                                    <p className="text-xs">
                                      تغییر لوگوی فروشگاه
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      حداکثر ۵ مگابایت
                                    </p>
                                  </div>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, "logo")}
                                  disabled={isUploading}
                                  className="hidden"
                                />
                              </div>
                            </label>
                            {storeLogoPreview && (
                              <button
                                type="button"
                                onClick={() => removeImage("logo")}
                                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center space-x-2 space-x-reverse"
                              >
                                <X className="w-4 h-4" />
                                <span className="text-sm">حذف</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            برای تغییر لوگو، حالت ویرایش را فعال کنید
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Store Name */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Store className="w-4 h-4 ml-2 text-gray-500" />
                      نام فروشگاه *
                    </label>
                    <input
                      type="text"
                      {...register("store_name", {
                        required: "نام فروشگاه الزامی است",
                      })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                    />
                    {errors.store_name && (
                      <p className="text-red-500 text-sm">
                        {errors.store_name.message}
                      </p>
                    )}
                  </div>

                  {/* Store Type */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Briefcase className="w-4 h-4 ml-2 text-gray-500" />
                      نوع فروشگاه
                    </label>
                    <select
                      {...register("store_type")}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                    >
                      <option value="single-vendor">تک فروشنده</option>
                      <option value="multi-vendor">چند فروشنده</option>
                    </select>
                  </div>

                  {/* Store Established At */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Calendar className="w-4 h-4 ml-2 text-gray-500" />
                      تاریخ تاسیس
                    </label>
                    <input
                      type="date"
                      {...register("store_established_at")}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                    />
                  </div>

                  {/* Store Description */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <FileText className="w-4 h-4 ml-2 text-gray-500" />
                      توضیحات فروشگاه
                    </label>
                    <textarea
                      {...register("store_description")}
                      disabled={!isEditing}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 resize-none"
                      placeholder="در مورد فروشگاه و محصولات خود توضیح دهید..."
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <User className="w-4 h-4 ml-2 text-gray-500" />
                      نام *
                    </label>
                    <input
                      type="text"
                      {...register("first_name", {
                        required: "نام الزامی است",
                      })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                    />
                    {errors.first_name && (
                      <p className="text-red-500 text-sm">
                        {errors.first_name.message}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <User className="w-4 h-4 ml-2 text-gray-500" />
                      نام خانوادگی *
                    </label>
                    <input
                      type="text"
                      {...register("last_name", {
                        required: "نام خانوادگی الزامی است",
                      })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                    />
                    {errors.last_name && (
                      <p className="text-red-500 text-sm">
                        {errors.last_name.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Phone className="w-4 h-4 ml-2 text-gray-500" />
                      شماره تماس
                    </label>
                    <input
                      type="tel"
                      value={user.phone || ""}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500">
                      شماره تماس قابل تغییر نیست
                    </p>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Mail className="w-4 h-4 ml-2 text-gray-500" />
                      ایمیل
                    </label>
                    <input
                      type="email"
                      {...register("email", {
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "ایمیل معتبر نیست",
                        },
                      })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <MapPin className="w-4 h-4 ml-2 text-gray-500" />
                      شهر
                    </label>
                    <input
                      type="text"
                      {...register("city")}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                    />
                  </div>

                  {/* Birthday */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Calendar className="w-4 h-4 ml-2 text-gray-500" />
                      تاریخ تولد
                    </label>
                    <input
                      type="date"
                      {...register("birthday")}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                    />
                  </div>

                  {/* Seller Bio */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <FileText className="w-4 h-4 ml-2 text-gray-500" />
                      بیوگرافی
                    </label>
                    <textarea
                      {...register("seller_bio")}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 resize-none"
                      placeholder="درباره خود و تجربه کاریتان بنویسید..."
                    />
                  </div>

                  {/* Seller Address */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Home className="w-4 h-4 ml-2 text-gray-500" />
                      آدرس
                    </label>
                    <textarea
                      {...register("seller_address")}
                      disabled={!isEditing}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 resize-none"
                      placeholder="آدرس خود را وارد کنید..."
                    />
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          resetFormWithUserData();
                          // Reset image previews
                          updateImagePreviews();
                        }}
                        className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-xl hover:bg-gray-50"
                      >
                        انصراف
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsEditing(!isEditing)}
                      className={`px-6 py-3 rounded-xl transition-all duration-200 ${
                        isEditing
                          ? "bg-gray-500 text-white hover:bg-gray-600"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      <Edit3 className="w-4 h-4 inline ml-2" />
                      {isEditing ? "لغو ویرایش" : "ویرایش اطلاعات"}
                    </button>
                  </div>

                  {isEditing && (
                    <button
                      type="submit"
                      disabled={isUpdating || !isDirty}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 space-x-reverse"
                    >
                      {isUpdating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      <span>
                        {isUpdating ? "در حال ذخیره..." : "ذخیره تغییرات"}
                      </span>
                    </button>
                  )}
                </div>

                {isEditing && !isDirty && (
                  <p className="text-center text-gray-500 text-sm mt-3">
                    هیچ تغییری اعمال نکرده‌اید
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
