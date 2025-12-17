// app/user/dashboard/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  CheckCircle,
  Clock,
  XCircle,
  ShoppingBag,
  Star,
  MapPin,
  CreditCard,
  TrendingUp,
  Calendar,
  Bell,
  AlertCircle,
} from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentOrders from "@/components/dashboard/RecentOrders";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import { toast } from "react-hot-toast";

const BASE_API = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardHome() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    wishlistItems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("accessToken");

    try {
      // Fetch user data
      const userResponse = await fetch(`${BASE_API}/users/me/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      }

      // Fetch orders data (you'll need to implement this endpoint)
      // const ordersResponse = await fetch(`${BASE_API}/orders/my-orders/`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });

      // Mock data for now
      setStats({
        totalOrders: 12,
        pendingOrders: 2,
        completedOrders: 10,
        wishlistItems: 8,
      });
    } catch (error) {
      console.error("Dashboard data error:", error);
      toast.error("خطا در دریافت اطلاعات داشبورد");
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "کل سفارشات",
      value: stats.totalOrders,
      icon: <Package className="w-6 h-6" />,
      color: "bg-blue-500",
      textColor: "text-blue-500",
      bgColor: "bg-blue-50",
      href: "/user/dashboard/orders",
    },
    {
      title: "در انتظار پرداخت",
      value: stats.pendingOrders,
      icon: <Clock className="w-6 h-6" />,
      color: "bg-yellow-500",
      textColor: "text-yellow-500",
      bgColor: "bg-yellow-50",
      href: "/user/dashboard/orders?status=pending",
    },
    {
      title: "تحویل شده",
      value: stats.completedOrders,
      icon: <CheckCircle className="w-6 h-6" />,
      color: "bg-green-500",
      textColor: "text-green-500",
      bgColor: "bg-green-50",
      href: "/user/dashboard/orders?status=completed",
    },
    {
      title: "علاقه‌مندی‌ها",
      value: stats.wishlistItems,
      icon: <Star className="w-6 h-6" />,
      color: "bg-purple-500",
      textColor: "text-purple-500",
      bgColor: "bg-purple-50",
      href: "/user/dashboard/wishlist",
    },
  ];

  const quickActions = [
    {
      title: "پیگیری سفارش",
      description: "پیگیری سفارشات خود",
      icon: <ShoppingBag className="w-5 h-5" />,
      href: "/user/dashboard/orders",
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "ویرایش پروفایل",
      description: "به‌روزرسانی اطلاعات شخصی",
      icon: <CheckCircle className="w-5 h-5" />,
      href: "/user/dashboard/profile/edit",
      color: "bg-green-100 text-green-700",
    },
    {
      title: "مدیریت آدرس‌ها",
      description: "اضافه یا ویرایش آدرس",
      icon: <MapPin className="w-5 h-5" />,
      href: "/user/dashboard/addresses",
      color: "bg-orange-100 text-orange-700",
    },
    {
      title: "کارت‌های من",
      description: "مدیریت روش‌های پرداخت",
      icon: <CreditCard className="w-5 h-5" />,
      href: "/user/dashboard/payment-methods",
      color: "bg-purple-100 text-purple-700",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              سلام {user?.first_name || "کاربر"} عزیز! 👋
            </h2>
            <p className="text-blue-100 mt-2">
              به پنل کاربری خود خوش آمدید. از اینجا می‌توانید حساب خود را مدیریت
              کنید.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex items-center space-x-2 space-x-reverse bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString("fa-IR")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">دسترسی سریع</h3>
          <Link
            href="/user/dashboard/orders"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
          >
            مشاهده همه
            <TrendingUp className="w-4 h-4 mr-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href} className="group">
              <div
                className={`${action.color} rounded-xl p-4 transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{action.title}</h4>
                    <p className="text-sm opacity-80 mt-1">
                      {action.description}
                    </p>
                  </div>
                  <div className="p-2 bg-white/50 rounded-lg">
                    {action.icon}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                سفارشات اخیر
              </h3>
              <Link
                href="/user/dashboard/orders"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                مشاهده همه سفارشات
              </Link>
            </div>
            <RecentOrders />
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              فعالیت‌های اخیر
            </h3>
            <ActivityTimeline />
          </div>
        </div>
      </div>

      {/* Notifications & Alerts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Bell className="w-5 h-5 ml-2" />
            اطلاعیه‌ها
          </h3>
          <button className="text-sm text-gray-500 hover:text-gray-700">
            علامت‌گذاری همه به عنوان خوانده شده
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex items-start p-3 bg-blue-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 ml-2" />
            <div>
              <p className="text-sm font-medium">به‌روزرسانی جدید</p>
              <p className="text-xs text-gray-600 mt-1">
                سیستم پرداخت به‌روزرسانی شد. لطفا کارت‌های بانکی خود را بررسی
                کنید.
              </p>
              <span className="text-xs text-gray-500 mt-2 block">
                ۲ ساعت پیش
              </span>
            </div>
          </div>
          <div className="flex items-start p-3 bg-yellow-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 ml-2" />
            <div>
              <p className="text-sm font-medium">سفارش در انتظار پرداخت</p>
              <p className="text-xs text-gray-600 mt-1">
                سفارش شماره #۱۲۳۴۵ در انتظار پرداخت است. مهلت پرداخت: ۲۴ ساعت
              </p>
              <span className="text-xs text-gray-500 mt-2 block">
                ۱ روز پیش
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
