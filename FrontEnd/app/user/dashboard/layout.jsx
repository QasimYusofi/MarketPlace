// app/user/dashboard/layout.js
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
  Home,
  ShoppingBag,
  CreditCard,
  ShoppingCartIcon,
  Calendar,
  Star,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import Link from "next/link";
import LoadingSpinner from "@/components/ui/AdvancedLoading";

const BASE_API = process.env.NEXT_PUBLIC_API_URL;

const menuItems = [
  {
    title: "داشبورد",
    href: "/user/dashboard",
    icon: <Home className="w-5 h-5" />,
  },
  {
    title: "پروفایل من",
    href: "/user/dashboard/profile",
    icon: <User className="w-5 h-5" />,
  },
  {
    title: "سفارشات من",
    href: "/user/dashboard/orders",
    icon: <Package className="w-5 h-5" />,
    badge: true,
  },
  {
    title: "لیست علاقه‌مندی",
    href: "/user/dashboard/wishlist",
    icon: <Heart className="w-5 h-5" />,
  },
  {
    title: "آدرس‌های من",
    href: "/user/dashboard/addresses",
    icon: <MapPin className="w-5 h-5" />,
  },
  {
    title: "سبد خرید من",
    href: "/cart",
    icon: <ShoppingCartIcon className="w-5 h-5" />,
  },
  {
    title: "نظرات من",
    href: "/user/dashboard/reviews",
    icon: <MessageSquare className="w-5 h-5" />,
  },
];

const accountItems = [
  {
    title: "تنظیمات حساب",
    href: "/user/dashboard/settings",
    icon: <Settings className="w-5 h-5" />,
  },
  {
    title: "امنیت و رمز عبور",
    href: "/user/dashboard/security",
    icon: <Shield className="w-5 h-5" />,
  },
  {
    title: "پشتیبانی",
    href: "/user/dashboard/support",
    icon: <HelpCircle className="w-5 h-5" />,
  },
];

export default function UserDashboardLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(3); // Example count
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      toast.error("لطفا ابتدا وارد حساب کاربری خود شوید");
      router.push("/auth/user-login");
      return;
    }

    try {
      const response = await fetch(`${BASE_API}/users/me/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error("خطا در دریافت اطلاعات کاربر");
      router.push("/auth/user-login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    toast.success("با موفقیت خارج شدید");
    router.push("/");
  };

  const getInitials = (name) => {
    if (!name) return "ک";
    return name.charAt(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <LoadingSpinner text="در حال بارگذاری پنل کاربری..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          className: "font-vazirmatn",
          style: {
            fontFamily: "var(--font-vazirmatn), sans-serif",
            direction: "rtl",
          },
        }}
      />

      <div className="min-h-screen bg-gray-50 font-vazirmatn" dir="rtl">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-3 space-x-reverse">
              <button className="relative p-2">
                <Bell className="w-5 h-5 text-gray-600" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>

              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {getInitials(user.first_name)}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
            <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                <Link href="/" className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-white" />
                  </div>
                  <span className="mr-3 font-bold text-lg text-gray-900">
                    پنل کاربری
                  </span>
                </Link>
              </div>

              {/* User Profile Card */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {getInitials(user.first_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email || user.phone}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      عضویت از{" "}
                      {new Date(user.date_joined).toLocaleDateString("fa-IR")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Navigation */}
              <nav className="flex-1 py-4 overflow-y-auto">
                <div className="px-2 space-y-1">
                  <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    حساب کاربری
                  </h3>
                  {menuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-all duration-200 ${
                        pathname === item.href
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`mr-3 ${
                          pathname === item.href
                            ? "text-blue-600"
                            : "text-gray-400 group-hover:text-gray-500"
                        }`}
                      >
                        {item.icon}
                      </span>
                      {item.title}
                      {item.badge && notifications > 0 && (
                        <span className="mr-auto bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                          {notifications}
                        </span>
                      )}
                      <ChevronRight
                        className={`w-4 h-4 mr-auto ${
                          pathname === item.href
                            ? "text-blue-600"
                            : "text-gray-300 group-hover:text-gray-400"
                        }`}
                      />
                    </Link>
                  ))}

                  <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">
                    تنظیمات
                  </h3>
                  {accountItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-all duration-200 ${
                        pathname === item.href
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`mr-3 ${
                          pathname === item.href
                            ? "text-blue-600"
                            : "text-gray-400 group-hover:text-gray-500"
                        }`}
                      >
                        {item.icon}
                      </span>
                      {item.title}
                      <ChevronRight className="w-4 h-4 mr-auto text-gray-300 group-hover:text-gray-400" />
                    </Link>
                  ))}

                  <button
                    onClick={handleLogout}
                    className="group flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg mx-2 transition-all duration-200 mt-6"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    خروج از حساب
                  </button>
                </div>
              </nav>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-xs text-gray-500">نسخه ۱.۰.۰</p>
                  <p className="text-xs text-gray-400 mt-1">
                    © {new Date().getFullYear()} فروشگاه آنلاین
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Sidebar */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-gray-600 bg-opacity-75"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <div className="absolute inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl">
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4 text-white" />
                      </div>
                      <span className="mr-3 font-bold text-lg">پنل کاربری</span>
                    </div>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                        {getInitials(user.first_name)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {user.email || user.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  <nav className="flex-1 py-4 overflow-y-auto">
                    <div className="space-y-1 px-2">
                      {[...menuItems, ...accountItems].map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                            pathname === item.href
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <span className="mr-3">{item.icon}</span>
                          {item.title}
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <LogOut className="w-5 h-5 mr-3" />
                        خروج از حساب
                      </button>
                    </div>
                  </nav>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 lg:mr-64">
            <div className="py-6">
              {/* Desktop Top Bar */}
              <div className="hidden lg:block px-8 pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      پنل مدیریت حساب کاربری
                    </h1>
                    <p className="text-gray-600 mt-1">
                      مدیریت اطلاعات شخصی، سفارشات و علاقه‌مندی‌های شما
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="جستجو در پنل کاربری..."
                        className="w-64 pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <button className="relative p-2">
                        <Bell className="w-5 h-5 text-gray-600" />
                        {notifications > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {notifications}
                          </span>
                        )}
                      </button>
                      <Link
                        href="/"
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        بازگشت به فروشگاه
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="px-4 lg:px-8">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
