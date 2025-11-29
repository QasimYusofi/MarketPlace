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
  Star,
  ShoppingBag,
  DollarSign,
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

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("لطفا ابتدا وارد شوید");
        return;
      }

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

      const result = await response.json();
      console.log("📦 Store owner data:", result);

      setUser(result);
      resetFormWithUserData(result);
      updateImagePreviews(result);
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

    // Profile image
    if (data.profile_image_info) {
      const profileUrl = getImageUrl(data.profile_image_info);
      console.log("🖼️ Profile image URL:", profileUrl ? "Generated" : "Null");
      setProfileImagePreview(profileUrl);
    } else {
      setProfileImagePreview(null);
    }

    // Store logo
    if (data.store_logo_info) {
      const logoUrl = getImageUrl(data.store_logo_info);
      console.log("🖼️ Store logo URL:", logoUrl ? "Generated" : "Null");
      setStoreLogoPreview(logoUrl);
    } else {
      setStoreLogoPreview(null);
    }
  };

  // Updated getImageUrl function for Django API
  const getImageUrl = (imageInfo) => {
    if (!imageInfo) {
      console.log("🖼️ No image info provided");
      return null;
    }

    try {
      console.log("🖼️ Processing image info:", imageInfo);

      // If image URL is provided directly
      if (imageInfo.url) {
        return imageInfo.url;
      }

      // If we have base64 data
      if (imageInfo.data) {
        const base64 = imageInfo.data;
        const contentType = imageInfo.content_type || "image/jpeg";
        return `data:${contentType};base64,${base64}`;
      }

      console.warn("🖼️ Unknown image info format:", imageInfo);
      return null;
    } catch (error) {
      console.error("❌ Error creating image URL:", error);
      return null;
    }
  };

  const resetFormWithUserData = (userData = null) => {
    const data = userData || user;
    if (!data) return;

    const formData = {
      // Personal Information - using actual API field names
      first_name: data.first_name || "",
      last_name: data.last_name || "",
      phone: data.phone || "",
      email: data.email || "",
      seller_address: data.seller_address || "",
      seller_bio: data.seller_bio || "",
      seller_license_id: data.seller_license_id || "",
      post_code: data.post_code || "",
      city: data.city || "",

      // Store Information - using actual API field names
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

  const onSubmit = async (data) => {
    const isValid = await trigger();
    if (!isValid) {
      toast.error("لطفا اطلاعات فرم را به درستی تکمیل کنید");
      return;
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem("accessToken");
      const updateData =
        activeTab === "personal"
          ? {
              first_name: data.first_name,
              last_name: data.last_name,
              phone: data.phone,
              email: data.email,
              seller_address: data.seller_address,
              seller_bio: data.seller_bio,
              seller_license_id: data.seller_license_id,
              post_code: data.post_code,
              city: data.city,
            }
          : {
              store_name: data.store_name,
              store_description: data.store_description,
              store_domain: data.store_domain,
              store_type: data.store_type,
              store_established_at: data.store_established_at || null,
            };

      console.log("🔄 Updating store owner data:", updateData);

      const response = await fetch(`${BASE_API}/store-owners/me/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Update result:", result);

      setUser(result);
      setIsEditing(false);
      toast.success("✅ پروفایل با موفقیت به‌روزرسانی شد");
    } catch (error) {
      console.error("💥 Update error:", error);
      toast.error("خطا در به‌روزرسانی پروفایل");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageUpload = async (event, imageType = "profile") => {
    const file = event.target.files[0];
    if (!file) return;

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
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("image", file);
      formData.append("image_type", imageType);

      const response = await fetch(
        `${BASE_API}/store-owners/me/upload-image/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (result) {
        setUser(result);
        toast.success(
          `✅ ${
            imageType === "profile" ? "تصویر پروفایل" : "لوگوی فروشگاه"
          } با موفقیت آپلود شد`
        );
        await fetchUserData();
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("💥 Upload error:", error);
      toast.error("خطا در آپلود تصویر");

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
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${BASE_API}/store-owners/me/remove-image/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ image_type: imageType }),
        }
      );

      if (!response.ok) {
        throw new Error(`Remove failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (result) {
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
      }
    } catch (error) {
      console.error("💥 Remove image error:", error);
      toast.error("خطا در حذف تصویر");
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

  // Get store rating display
  const getStoreRating = () => {
    if (!user?.store_rating) return "بدون امتیاز";
    return `${user.store_rating.average || 0} (${
      user.store_rating.count || 0
    } نظر)`;
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
                      }}
                    />
                  ) : (
                    <User className="w-16 h-16 text-white" />
                  )}
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
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {user.total_revenue || "0"}
                </div>
                <div className="text-xs text-gray-500">درآمد (ریال)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center">
                  <Star className="w-4 h-4 ml-1 fill-current" />
                  {user.store_rating?.average || 0}
                </div>
                <div className="text-xs text-gray-500">امتیاز فروشگاه</div>
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
                <span className="text-sm text-gray-600">امتیاز:</span>
                <span className="text-sm text-gray-900">
                  {getStoreRating()}
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
                            }}
                          />
                        ) : (
                          <Store className="w-8 h-8 text-gray-400" />
                        )}
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

                  {/* Store Domain */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Navigation className="w-4 h-4 ml-2 text-gray-500" />
                      دامنه فروشگاه
                    </label>
                    <input
                      type="text"
                      {...register("store_domain")}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                      placeholder="example.com"
                    />
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
                      شماره تماس *
                    </label>
                    <input
                      type="tel"
                      {...register("phone", {
                        required: "شماره تماس الزامی است",
                        pattern: {
                          value: /^09\d{9}$/,
                          message: "شماره تماس معتبر نیست",
                        },
                      })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm">
                        {errors.phone.message}
                      </p>
                    )}
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

                  {/* Postal Code */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Navigation className="w-4 h-4 ml-2 text-gray-500" />
                      کد پستی
                    </label>
                    <input
                      type="text"
                      {...register("post_code", {
                        pattern: {
                          value: /^\d{10}$/,
                          message: "کد پستی باید ۱۰ رقم باشد",
                        },
                      })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                      placeholder="۱۰ رقم"
                    />
                    {errors.post_code && (
                      <p className="text-red-500 text-sm">
                        {errors.post_code.message}
                      </p>
                    )}
                  </div>

                  {/* Seller License ID */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Briefcase className="w-4 h-4 ml-2 text-gray-500" />
                      شماره پروانه کسب
                    </label>
                    <input
                      type="text"
                      {...register("seller_license_id")}
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
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 resize-none"
                      placeholder="آدرس کامل..."
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
