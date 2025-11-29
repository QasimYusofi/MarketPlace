"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bell, Search, User, Menu, HelpCircle } from "lucide-react";
import Sidebar from "./Sidebar";
import MobileDrawer from "./MobileDrawer";
import Loading from "@/components/ui/Loading";
import axios from "axios";

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

// Custom hook to fetch user data with full profile information
import toast from "react-hot-toast";

const useUserData = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Check if user or store owner is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const userResponse = await fetch(`${BASE_API}/users/me/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("user response: ");
        console.log(userResponse);

        // Check for user session
        if (userResponse.ok) {
          const userResult = await userResponse.json();
          console.log(userResult);
          if (userResult.status === "active") {
            setUser(userResult);
            setIsLoading(false);
            return;
          }
        }

        // Replace with your actual API endpoint
        const storeResponse = await fetch(`${BASE_API}/store-owners/me/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // Check for store owner session
        if (storeResponse.ok) {
          console.log("store reulst: ");
          const storeResult = await storeResponse.json();
          console.log(storeResult);
          if (storeResult || storeResult.status === "active") {
            setUser(storeResult);
          }
        }
      } catch (error) {
        console.error("Error checking auth session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const token = localStorage.getItem("accessToken");
    if (token) {
      checkAuth();
    }
  }, []);

  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     try {
  //       setIsLoading(true);
  //       setError(null);

  //       const sessionResponse = await fetch("/api/auth/session", {
  //         credentials: "include",
  //         cache: "no-cache",
  //       });

  //       const sessionResult = await sessionResponse.json();
  //       console.log("📦 Session result:", sessionResult);

  //       if (!sessionResult.success || !sessionResult.authenticated) {
  //         console.log("❌ User not authenticated");
  //         toast.error("لطفا ابتدا وارد حساب کاربری خود شوید");
  //         router.push("/auth/login");

  //         return;
  //       }

  //       console.log("✅ User session verified, fetching profile data...");

  //       // Step 2: If user is logged in, get full profile data from ownerStore API
  //       const profileResponse = await fetch("/api/store-owners/profile", {
  //         credentials: "include",
  //         cache: "no-cache",
  //       });

  //       if (profileResponse.ok) {
  //         const profileResult = await profileResponse.json();
  //         console.log("📦 Profile data result:", profileResult);

  //         if (profileResult.success) {
  //           setUser(profileResult.data);
  //           console.log("✅ User data loaded from profile API");
  //           return;
  //         }
  //       }

  //       // Step 3: If profile API fails but session is valid, use session data
  //       console.log("⚠️ Profile API failed, using session data as fallback");
  //       setUser(sessionResult.user);
  //       console.log("✅ User data loaded from session API");
  //     } catch (err) {
  //       console.error("💥 Error fetching user data:", err);
  //       setError("خطا در دریافت اطلاعات کاربر");
  //       setUser(null);
  //       toast.error("خطا در ارتباط با سرور");
  //       router.push("/auth/owner-login");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchUserData();
  // }, [router]);

  return { user, isLoading, error };
};

export default function DashboardLayout({ children, section }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(3);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const { user, isLoading, error } = useUserData();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user && !error) {
      router.push("/auth/owner-login");
    }
  }, [user, isLoading, error, router]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/immutability
      updateImagePreviews();
    }
  }, [user]);

  const updateImagePreviews = () => {
    if (!user) return;

    console.log("🖼️ Updating image previews for dashboard layout...");

    // Profile image
    if (user.sellerProfileImage) {
      const profileUrl = getImageUrl(user.sellerProfileImage);
      console.log("🖼️ Profile image URL:", profileUrl ? "Generated" : "Null");
      setProfileImagePreview(profileUrl);
    } else {
      setProfileImagePreview(null);
    }
  };

  const handleSearch = (query) => {
    console.log("Search:", query);
  };

  // IMPROVED: getImageUrl function that handles MongoDB Buffer format
  const getImageUrl = (imageData) => {
    if (!imageData) {
      console.log("🖼️ No image data provided");
      return null;
    }

    try {
      console.log("🖼️ Processing image data:", imageData);

      // If it's already a URL string (base64)
      if (typeof imageData === "string") {
        console.log("🖼️ Already a string URL");
        return imageData;
      }

      // If it's a Buffer object from MongoDB with data array (most common case)
      if (imageData.data && Array.isArray(imageData.data)) {
        console.log("🖼️ Processing Buffer data array");
        try {
          const buffer = Buffer.from(imageData.data);
          const base64 = buffer.toString("base64");
          const contentType = imageData.contentType || "image/jpeg";
          const dataUrl = `data:${contentType};base64,${base64}`;
          console.log("🖼️ Created data URL successfully");
          return dataUrl;
        } catch (bufferError) {
          console.error("❌ Buffer conversion error:", bufferError);
          return null;
        }
      }

      // If it's a Buffer object directly
      if (imageData.data && Buffer.isBuffer(imageData.data)) {
        console.log("🖼️ Processing Buffer directly");
        try {
          const base64 = imageData.data.toString("base64");
          const contentType = imageData.contentType || "image/jpeg";
          const dataUrl = `data:${contentType};base64,${base64}`;
          console.log("🖼️ Created data URL from Buffer");
          return dataUrl;
        } catch (bufferError) {
          console.error("❌ Direct Buffer conversion error:", bufferError);
          return null;
        }
      }

      // If it's a plain object with base64 data
      if (imageData.base64) {
        console.log("🖼️ Processing base64 string");
        return imageData.base64;
      }

      // If we only have metadata but no image data
      if (imageData.contentType && !imageData.data) {
        console.log("🖼️ Image metadata exists but no image data");
        return null;
      }

      // Check for MongoDB Binary format
      if (imageData.data && imageData.data.type === "Buffer") {
        console.log("🖼️ Processing MongoDB Binary format");
        try {
          const buffer = Buffer.from(imageData.data.data);
          const base64 = buffer.toString("base64");
          const contentType = imageData.contentType || "image/jpeg";
          const dataUrl = `data:${contentType};base64,${base64}`;
          console.log("🖼️ Created data URL from MongoDB Binary");
          return dataUrl;
        } catch (error) {
          console.error("❌ MongoDB Binary conversion error:", error);
          return null;
        }
      }

      console.warn(
        "🖼️ Unknown image data format, keys:",
        Object.keys(imageData)
      );
      return null;
    } catch (error) {
      console.error("❌ Error creating image URL:", error);
      return null;
    }
  };

  // Handle image load error
  const handleImageError = (e) => {
    console.error("❌ Profile image failed to load in dashboard layout");
    e.target.style.display = "none";

    // Show fallback if image fails to load
    const fallbackElement = e.target.nextSibling;
    if (fallbackElement && fallbackElement.style) {
      fallbackElement.style.display = "flex";
    }
  };

  // Get user display name based on your schema
  const getUserDisplayName = () => {
    if (!user) return "";
    return `${user.first_name || ""} ${user.last_name || ""}`.trim();
  };

  // Get user role based on your schema
  const getUserRole = () => {
    if (!user) return "کاربر";

    if (user.storeType === "multi-vendor") {
      return "مدیر سیستم";
    } else if (user.storeType === "single-vendor") {
      return "مالک فروشگاه";
    }

    return user.sellerStatus === "approved" ? "کاربر تایید شده" : "کاربر";
  };

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
              onClick={() => router.push("/auth/ologin")}
              className="w-full bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-all duration-200"
            >
              ورود به سیستم
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="animate-pulse text-4xl mb-4">🔐</div>
          <div className="text-lg text-gray-600">
            در حال انتقال به صفحه ورود...
          </div>
        </div>
      </div>
    );
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
        {/* Enhanced Mobile Header */}
        <header className="lg:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="text-center flex-1 mx-4">
              <h1 className="text-lg font-semibold text-gray-900">
                {sectionTitles[section] || "داشبورد"}
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                {user.storeName || "پنل مدیریت فروشگاه"}
              </p>
            </div>

            <div className="relative">
              <div className="w-10 h-10  bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                    onError={handleImageError}
                  />
                ) : null}
                {!profileImagePreview && (
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
            {/* Search Bar */}
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
            {/* Help & Support */}
            <button className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 relative group">
              <HelpCircle className="w-5 h-5" />
              <div className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 mt-2 whitespace-nowrap">
                  راهنما و پشتیبانی
                  <div className="absolute -top-1 right-1/2 transform translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 relative group">
              <Bell className="w-5 h-5" />
              {notificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {notificationsCount}
                </span>
              )}
              <div className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 mt-2 whitespace-nowrap">
                  اعلان‌ها
                  <div className="absolute -top-1 right-1/2 transform translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
            </button>

            {/* User Profile */}
            <div className="flex items-center space-x-3 space-x-reverse group relative">
              <div className="text-right">
                <p className="font-medium text-gray-900 text-sm">
                  {getUserDisplayName()}
                </p>
                <p className="text-gray-500 text-xs">{getUserRole()}</p>
                {user.storeName && (
                  <p className="text-gray-400 text-xs mt-1">{user.storeName}</p>
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
                  <p className="font-medium text-gray-900">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    {user.sellerPhone || user.sellerEmail}
                  </p>
                  {user.storeName && (
                    <p className="text-blue-600 text-xs mt-1">
                      {user.storeName}
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
                  <button
                    onClick={() => router.push("/dashboard/stores")}
                    className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    مدیریت فروشگاه
                  </button>
                  <button className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    تنظیمات حساب
                  </button>
                </div>
                <div className="p-2 border-t border-gray-200">
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch("/api/auth/session", {
                          method: "DELETE",
                          credentials: "include",
                        });
                        if (response.ok) {
                          router.push("/auth/login");
                        }
                      } catch (error) {
                        console.error("Logout error:", error);
                        router.push("/auth/login");
                      }
                    }}
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
            {user.storeCity && (
              <span className="ml-4">شهر: {user.storeCity}</span>
            )}
            <span className="mr-4">
              آخرین به‌روزرسانی: امروز {new Date().toLocaleTimeString("fa-IR")}
            </span>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-blue-50/30">
          <div className="p-4 lg:p-6">{children}</div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 px-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              © 2024 {user.storeName || "فروشگاه"}. تمام حقوق محفوظ است.
            </div>
            <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500">
              <button className="hover:text-gray-700 transition-colors">
                شرایط استفاده
              </button>
              <button className="hover:text-gray-700 transition-colors">
                حریم خصوصی
              </button>
              <button className="hover:text-gray-700 transition-colors">
                پشتیبانی
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
