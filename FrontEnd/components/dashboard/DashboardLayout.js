"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bell, Search, User, Menu, HelpCircle, Store } from "lucide-react";
import Sidebar from "./Sidebar";
import MobileDrawer from "./MobileDrawer";
import Loading from "@/components/ui/Loading";

const sectionTitles = {
  overview: "داشبورد",
  profile: "پروفایل",
  stores: "فروشگاه من",
  products: "محصولات",
  orders: "سفارشات",
  subscriptions: "تیک من",
  wishlist: "علاقه‌مندی",
  cart: "سبد خرید",
};

const BASE_API = `${process.env.NEXT_PUBLIC_API_URL}`;

// Improved custom hook with proper error handling and cleanup
const useUserData = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          if (isMounted) setIsLoading(false);
          return;
        }

        // Try store owner endpoint
        try {
          const storeResponse = await fetch(`${BASE_API}/store-owners/me/`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          });

          if (storeResponse.ok) {
            const storeResult = await storeResponse.json();
            if (isMounted) {
              setUser({
                ...storeResult,
                userType: "store_owner",
                full_name: `${storeResult.first_name || ""} ${
                  storeResult.last_name || ""
                }`.trim(),
                phone: storeResult.phone,
                email: storeResult.email,
                store_name: storeResult.store_name,
                city: storeResult.city,
              });
              setError(null);
            }
            setIsLoading(false);
            return;
          }
        } catch (storeError) {
          if (storeError.name !== "AbortError") {
            console.error("Store owner fetch error:", storeError);
          }
        }

        // Fallback to regular user
        try {
          const userResponse = await fetch(`${BASE_API}/users/me/`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          });

          if (userResponse.ok) {
            const userResult = await userResponse.json();
            if (isMounted) {
              setUser({
                ...userResult,
                userType: "customer",
                full_name: `${userResult.first_name || ""} ${
                  userResult.last_name || ""
                }`.trim(),
              });
              setError(null);
            }
          }
        } catch (userError) {
          if (userError.name !== "AbortError" && isMounted) {
            setError("خطا در دریافت اطلاعات کاربر");
          }
        }
      } catch (error) {
        if (error.name !== "AbortError" && isMounted) {
          setError("خطا در بررسی وضعیت احراز هویت");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [router]);

  return { user, isLoading, error };
};

export default function DashboardLayout({ children, section }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const { user, isLoading, error } = useUserData();
  const router = useRouter();
  const pathname = usePathname();

  // ✅ DERIVE profile image preview during render — NO useEffect + setState!
  const profileImagePreview = useMemo(() => {
    if (!user) return null;

    // Priority 1: Direct URL
    if (user.profile_image_url) {
      return user.profile_image_url;
    }

    // Priority 2: Process profile_image field
    if (user.profile_image) {
      try {
        // Base64 image data
        if (user.profile_image.startsWith("data:image")) {
          return user.profile_image;
        }
        // Relative URL (e.g., "/media/profiles/123.jpg")
        if (user.profile_image.startsWith("/")) {
          return `${BASE_API.replace("/api", "")}${user.profile_image}`;
        }
      } catch (err) {
        console.error("Error processing profile image:", err);
        return null;
      }
    }

    // Priority 3: Use profile_image_info (from store-owners API)
    if (user.has_profile_image && user.profile_image_info?.url) {
      const url = user.profile_image_info.url;
      if (url.startsWith("/")) {
        return `${BASE_API.replace("/api", "")}${url}`;
      }
      return url;
    }

    return null;
  }, [user]);

  // Handle image load errors gracefully
  const handleImageError = useCallback((e) => {
    console.error("❌ Image failed to load");
    e.target.style.display = "none";
  }, []);

  // Handle redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user && !error) {
      if (!pathname.includes("/auth/")) {
        router.push("/auth/owner-login");
      }
    }
  }, [user, isLoading, error, router, pathname]);

  const handleSearch = useCallback((query) => {
    console.log("Searching for:", query);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      router.push("/auth/owner-login");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/auth/owner-login");
    }
  }, [router]);

  const getUserDisplayName = useCallback(() => {
    if (!user) return "";
    return (
      user.full_name ||
      `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
      user.store_name ||
      "کاربر"
    );
  }, [user]);

  const getUserRole = useCallback(() => {
    if (!user) return "کاربر";
    if (user.userType === "store_owner") {
      return user.store_type === "multi-vendor" ? "مدیر سیستم" : "مالک فروشگاه";
    }
    return "مشتری";
  }, [user]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "ثبت نشده";
    try {
      return new Date(dateString).toLocaleDateString("fa-IR");
    } catch {
      return "نامعتبر";
    }
  }, []);

  if (isLoading) {
    return (
      <Loading
        fullScreen={true}
        text="در حال بارگذاری پنل مدیریت..."
        subText="لطفا چند لحظه صبر کنید"
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="text-2xl">⚠️</div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            خطا در بارگذاری
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              تلاش مجدد
            </button>
            <button
              onClick={() => router.push("/auth/owner-login")}
              className="w-full bg-gray-100 text-gray-700 border border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200"
            >
              ورود به سیستم
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar currentSection={section} user={user} />
      </div>

      {/* Mobile drawer */}
      <MobileDrawer
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        currentSection={section}
        user={user}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="text-center flex-1 mx-4">
              <h1 className="text-lg font-semibold text-gray-900">
                {sectionTitles[section] || "داشبورد"}
              </h1>
              {user.store_name && (
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {user.store_name}
                </p>
              )}
            </div>

            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="جستجو در پنل مدیریت..."
                className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all duration-200"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 relative group"
              aria-label="Help and support"
            >
              <HelpCircle className="w-5 h-5" />
              <div className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 mt-2 whitespace-nowrap">
                  راهنما و پشتیبانی
                  <div className="absolute -top-1 right-1/2 transform translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
            </button>

            <button
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 relative group"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationsCount}
                </span>
              )}
              <div className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 mt-2 whitespace-nowrap">
                  اعلان‌ها
                  <div className="absolute -top-1 right-1/2 transform translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
            </button>

            <div className="flex items-center space-x-3 space-x-reverse group relative">
              <div className="text-right">
                <p className="font-medium text-gray-900 text-sm">
                  {getUserDisplayName()}
                </p>
                <p className="text-gray-500 text-xs">{getUserRole()}</p>
                {user.store_name && (
                  <p className="text-gray-400 text-xs mt-1 flex items-center">
                    <Store className="w-3 h-3 ml-1" />
                    {user.store_name}
                  </p>
                )}
              </div>

              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-200 overflow-hidden">
                  {profileImagePreview ? (
                    <img
                      src={profileImagePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>

              {/* Profile Dropdown */}
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform translate-y-2 group-hover:translate-y-0">
                <div className="p-4 border-b border-gray-200">
                  <p className="font-medium text-gray-900 truncate">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-gray-500 text-sm mt-1 truncate">
                    {user.phone || user.email}
                  </p>
                  {user.store_name && (
                    <p className="text-blue-600 text-xs mt-1 truncate flex items-center">
                      <Store className="w-3 h-3 ml-1" />
                      {user.store_name}
                    </p>
                  )}
                </div>
                <div className="p-2">
                  <button
                    onClick={() => router.push("/dashboard/profile")}
                    className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    ویرایش پروفایل
                  </button>
                  {user.userType === "store_owner" && (
                    <button
                      onClick={() => router.push("/dashboard/stores")}
                      className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      مدیریت فروشگاه
                    </button>
                  )}
                  <button
                    onClick={() => router.push("/dashboard/settings")}
                    className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    تنظیمات حساب
                  </button>
                </div>
                <div className="p-2 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    خروج از سیستم
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="hidden lg:flex items-center px-8 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <nav className="flex items-center space-x-2 space-x-reverse text-sm">
            <span className="text-gray-600">پنل مدیریت</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">
              {sectionTitles[section] || "داشبورد"}
            </span>
          </nav>
          <div className="flex-1"></div>
          <div className="text-xs text-gray-500">
            {user.city && <span className="ml-4">شهر: {user.city}</span>}
            <span className="mr-4">
              آخرین به‌روزرسانی: امروز {new Date().toLocaleTimeString("fa-IR")}
            </span>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-blue-50/30">
          <div className="p-4 lg:p-6">{children}</div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 px-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} {user.store_name || "فروشگاه"}. تمام
              حقوق محفوظ است.
            </div>
            <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500">
              <button
                onClick={() => router.push("/terms")}
                className="hover:text-gray-700 transition-colors"
              >
                شرایط استفاده
              </button>
              <button
                onClick={() => router.push("/privacy")}
                className="hover:text-gray-700 transition-colors"
              >
                حریم خصوصی
              </button>
              <button
                onClick={() => router.push("/support")}
                className="hover:text-gray-700 transition-colors"
              >
                پشتیبانی
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
