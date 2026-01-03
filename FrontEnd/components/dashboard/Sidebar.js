"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  User,
  Store,
  Package,
  ShoppingBag,
  ShoppingCart,
  LogOut,
  Settings,
  HelpCircle,
  ChevronRight,
  Crown,
  BadgeCheck,
  Sparkles,
  Menu,
  X,
  Heart,
  HomeIcon,
} from "lucide-react";

const menuItems = [
  {
    id: "overview",
    label: "داشبورد",
    icon: LayoutDashboard,
    color: "text-blue-600",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "profile",
    label: "پروفایل من",
    icon: User,
    color: "text-emerald-600",
    gradient: "from-emerald-500 to-green-500",
  },
  {
    id: "products",
    label: "محصولات",
    icon: Package,
    color: "text-amber-600",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    id: "orders",
    label: "سفارشات",
    icon: ShoppingBag,
    color: "text-indigo-600",
    gradient: "from-indigo-500 to-blue-500",
  },
];

function ExitConfirmationModal({ isOpen, onClose, onConfirm, isLoggingOut }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full transform transition-all duration-300 scale-100 animate-slideUp border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg ml-6">
              <LogOut className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">خروج از سیستم</h3>
              <p className="text-gray-600 text-sm mt-1">
                آیا از خروج اطمینان دارید؟
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 space-x-reverse p-6 gap-6">
          <button
            onClick={onClose}
            disabled={isLoggingOut}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-all duration-200 font-semibold flex items-center justify-center"
          >
            <X className="h-4 w-4 ml-2" />
            انصراف
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoggingOut}
            className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-3 rounded-xl hover:from-rose-600 hover:to-pink-700 disabled:opacity-50 transition-all duration-200 font-semibold flex items-center justify-center shadow-lg"
          >
            {isLoggingOut ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                در حال خروج...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4 ml-2" />
                تایید و خروج
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ currentSection, user }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleNavigation = (section) => {
    router.push(`/dashboard${section === "overview" ? "" : `/${section}`}`);
    setIsMobileOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Get the token from localStorage
      const token = localStorage.getItem("accessToken");

      if (!token) {
        // If no token, just redirect to login
        console.log("No token found, redirecting to login...");
        router.push("/auth/login");
        toast.success("با موفقیت خارج شدید");
        return;
      }

      // First, clear local storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // Clear any session storage if used
      sessionStorage.clear();

      // Clear cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Try to call logout endpoint if available
      try {
        const BASE_API = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${BASE_API}/auth/logout/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.warn(
            "Logout endpoint failed, continuing with client-side logout"
          );
        }
      } catch (error) {
        console.warn("Logout endpoint error:", error);
        // Continue with client-side logout even if endpoint fails
      }

      // Redirect to login page
      toast.success("✅ با موفقیت خارج شدید");

      // Small delay to show success message
      setTimeout(() => {
        router.push("/");
        router.refresh(); // Refresh the page to clear any cached data
      }, 500);
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, clear local storage and redirect
      localStorage.clear();
      sessionStorage.clear();
      toast.error("⚠️ از سیستم خارج شدید");
      setTimeout(() => {
        router.push("/auth/login");
        router.refresh();
      }, 500);
    } finally {
      setIsLoggingOut(false);
      setShowExitModal(false);
    }
  };

  const getImageUrl = (imageInfo) => {
    if (!imageInfo) return null;

    try {
      console.log("🖼️ Processing image info in sidebar:", imageInfo);

      // If image URL is provided directly
      if (imageInfo.url) {
        const BASE_API = process.env.NEXT_PUBLIC_API_URL;
        // Handle relative URLs
        if (imageInfo.url.startsWith("/")) {
          // For media URLs
          if (imageInfo.url.startsWith("/media/")) {
            const djangoBaseUrl = BASE_API.replace("/api", "");
            return `${djangoBaseUrl}${imageInfo.url}`;
          }
          return `${BASE_API}${imageInfo.url}`;
        }
        return imageInfo.url;
      }

      // If it's a base64 string from your profile page API
      if (typeof imageInfo === "string" && imageInfo.startsWith("data:")) {
        return imageInfo;
      }

      // If we have filename
      if (imageInfo.filename) {
        return `${process.env.NEXT_PUBLIC_API_URL}${imageInfo.filename}`;
      }

      // Handle MongoDB Buffer data (old schema)
      if (imageInfo.data && Array.isArray(imageInfo.data)) {
        try {
          const base64 = Buffer.from(imageInfo.data).toString("base64");
          const contentType = imageInfo.contentType || "image/jpeg";
          return `data:${contentType};base64,${base64}`;
        } catch (error) {
          console.error("Error converting buffer to base64:", error);
          return null;
        }
      }

      return null;
    } catch (error) {
      console.error("❌ Error creating image URL:", error);
      return null;
    }
  };

  // Get profile image URL based on your API structure
  const getProfileImageUrl = () => {
    if (!user) return null;

    // Check different possible image data locations
    const imageSources = [
      user.profile_image_info, // From your profile API
      user.profileImageInfo, // Alternative camelCase
      user.sellerProfileImage, // Old schema
      user.profile_image, // Direct field
    ];

    for (const source of imageSources) {
      if (source) {
        const url = getImageUrl(source);
        if (url) return url;
      }
    }

    // Check if user has profile image boolean
    if (user.has_profile_image && user.profile_image_info) {
      return getImageUrl(user.profile_image_info);
    }

    return null;
  };

  const profileImageUrl = getProfileImageUrl();

  // Get user display name based on your schema
  const getUserDisplayName = () => {
    if (!user) return "کاربر";

    // Try different name fields
    const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    if (name) return name;

    return user.full_name || user.store_name || user.username || "کاربر";
  };

  // Get user contact info
  const getUserContactInfo = () => {
    if (!user) return "";
    return (
      user.email || user.phone || user.sellerEmail || user.sellerPhone || ""
    );
  };

  // Get user role based on your schema
  const getUserRole = () => {
    if (!user) return "کاربر";

    if (user.store_type === "multi-vendor") {
      return "مدیر سیستم";
    } else if (user.store_type === "single-vendor") {
      return "مالک فروشگاه";
    }

    return user.seller_status === "approved" ? "کاربر تایید شده" : "کاربر";
  };

  // Get user level based on store type and status
  const getUserLevel = () => {
    if (!user) return "سطح معمولی";

    if (user.store_type === "multi-vendor") {
      return "سطح طلایی";
    } else if (user.store_type === "single-vendor") {
      return "سطح نقره‌ای";
    }

    return "سطح معمولی";
  };

  // Check if user is approved
  const isUserApproved = () => {
    return (
      user?.seller_status === "approved" || user?.sellerStatus === "approved"
    );
  };

  // Check if user has multi-vendor store
  const isMultiVendor = () => {
    return (
      user?.store_type === "multi-vendor" || user?.storeType === "multi-vendor"
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-6 right-6 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-2xl shadow-2xl shadow-blue-500/25 hover:shadow-3xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 right-0
        bg-gradient-to-b from-white via-blue-50/20 to-purple-50/10
        border-l border-gray-200/60
        backdrop-blur-lg
        flex flex-col
        transition-all duration-500 ease-out
        z-50
        shadow-2xl shadow-blue-500/10
        ${isCollapsed ? "w-20" : "w-80"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        group
        hover:shadow-3xl hover:shadow-purple-500/20
      `}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden absolute top-6 left-6 p-2 text-gray-500 hover:text-gray-700 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -left-3 top-8 bg-white hover:bg-gray-50 p-2 rounded-xl border-2 border-gray-200 shadow-lg transition-all duration-300 z-10 transform hover:scale-110"
        >
          <ChevronRight
            className={`w-4 h-4 text-gray-600 transition-transform ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* User Profile */}
        <div className="p-6 border-b border-gray-200/60 bg-gradient-to-r from-white to-blue-50/30">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error("Profile image failed to load");
                      e.target.style.display = "none";
                      // Show fallback icon
                      const parent = e.target.parentElement;
                      if (parent) {
                        const fallback =
                          parent.querySelector(".profile-fallback");
                        if (fallback) fallback.style.display = "flex";
                      }
                    }}
                  />
                ) : null}
                <div
                  className={`w-full h-full items-center justify-center ${
                    profileImageUrl ? "hidden" : "flex"
                  } profile-fallback`}
                >
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              {isMultiVendor() && (
                <div className="absolute -top-1 -left-1 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center">
                  <Crown className="w-3 h-3 ml-1" />
                  PRO
                </div>
              )}
            </div>

            <div
              className={`flex-1 transition-all duration-500 ${
                isCollapsed
                  ? "opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100"
                  : "opacity-100 scale-100"
              }`}
            >
              <div className="flex items-center space-x-2 space-x-reverse mb-1 justify-center">
                <h3 className="font-bold text-gray-900 text-lg">
                  {getUserDisplayName()}
                </h3>
                {isUserApproved() && (
                  <BadgeCheck className="w-5 h-5 text-blue-500" />
                )}
              </div>
              <div className="flex items-center justify-center">
                <p className="text-gray-600 text-sm mb-2">
                  {getUserContactInfo()}
                </p>
              </div>
              {user?.store_name && (
                <div className="flex items-center justify-center mb-2">
                  <p className="text-blue-600 text-sm font-medium">
                    {user.store_name}
                  </p>
                </div>
              )}
              <div className="flex items-center space-x-3 space-x-reverse text-xs justify-center">
                <div className="flex items-center space-x-1 space-x-reverse">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-500">آنلاین</span>
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="flex items-center space-x-1 space-x-reverse text-amber-600">
                  <Sparkles className="w-3 h-3" />
                  <span>{getUserLevel()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-4 border-b border-gray-200/60">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="text-xl font-bold text-gray-900 mb-1">
                {user?.active_products_count || user?.activeProductsCount || 0}
              </div>
              <div className="text-xs text-gray-600 font-medium">
                محصولات فعال
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="text-xl font-bold text-gray-900 mb-1">
                {user?.total_sales || user?.totalSales || 0}
              </div>
              <div className="text-xs text-gray-600 font-medium">فروش کل</div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center space-x-3 space-x-reverse p-2 rounded-2xl transition-all duration-500 group/nav relative overflow-hidden ${
                  isActive
                    ? `bg-gradient-to-r ${item.gradient} shadow-2xl text-white`
                    : "bg-white/60 hover:bg-white border border-gray-200/60 hover:border-gray-300 shadow-sm hover:shadow-lg text-gray-700 hover:text-gray-900"
                } transform hover:scale-105`}
              >
                <div
                  className={`p-2 rounded-xl transition-all duration-500 ${
                    isActive
                      ? "bg-white/20"
                      : "bg-gray-100 group-hover/nav:bg-gray-200"
                  }`}
                >
                  <IconComponent
                    className={`w-6 h-6 transition-all duration-500 ${
                      isActive
                        ? "text-white scale-110"
                        : `${item.color} group-hover/nav:scale-110`
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0 text-right">
                  <div className="flex items-center justify-between mb-auto mr-2">
                    <span
                      className={`font-semibold transition-all duration-500 ${
                        isCollapsed
                          ? "opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0"
                          : "opacity-100 translate-x-0"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                </div>

                {isActive && (
                  <div className="absolute left-3 w-2 h-2 bg-white rounded-full animate-ping"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200/60 space-y-2 bg-gradient-to-t from-white/80 to-transparent">
          <button
            onClick={() => router.push("/")}
            className="w-full flex items-center space-x-3 space-x-reverse p-3 text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl transition-all duration-300 group/support"
          >
            <div className="p-2 rounded-lg bg-gray-100 group-hover/support:bg-gray-200">
              <HomeIcon className="w-5 h-5" />
            </div>
            <span
              className={`flex-1 text-right font-medium transition-all duration-500 ${
                isCollapsed
                  ? "opacity-0 group-hover:opacity-100"
                  : "opacity-100"
              }`}
            >
              صفحه اصلی
            </span>
          </button>

          <button
            onClick={() => router.push("/dashboard/settings")}
            className="w-full flex items-center space-x-3 space-x-reverse p-3 text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl transition-all duration-300 group/settings"
          >
            <div className="p-2 rounded-lg bg-gray-100 group-hover/settings:bg-gray-200">
              <Settings className="w-5 h-5" />
            </div>
            <span
              className={`flex-1 text-right font-medium transition-all duration-500 ${
                isCollapsed
                  ? "opacity-0 group-hover:opacity-100"
                  : "opacity-100"
              }`}
            >
              تنظیمات
            </span>
          </button>

          <button
            onClick={() => setShowExitModal(true)}
            className="w-full flex items-center space-x-3 space-x-reverse p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-300 group/logout"
          >
            <div className="p-2 rounded-lg bg-red-100 group-hover/logout:bg-red-200">
              <LogOut className="w-5 h-5" />
            </div>
            <span
              className={`flex-1 text-right font-medium transition-all duration-500 ${
                isCollapsed
                  ? "opacity-0 group-hover:opacity-100"
                  : "opacity-100"
              }`}
            >
              خروج از سیستم
            </span>
          </button>
        </div>
      </div>

      <ExitConfirmationModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleLogout}
        isLoggingOut={isLoggingOut}
      />
    </>
  );
}
