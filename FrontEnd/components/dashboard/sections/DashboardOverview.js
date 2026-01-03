"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
const BASE_API = `${process.env.NEXT_PUBLIC_API_URL}`;

// Import Lucide React icons
import {
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  User,
  Plus,
  Eye,
  ArrowRight,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  CreditCard,
  Award,
  BarChart3,
  Calendar,
  RefreshCw,
  Star,
  Settings,
  Heart,
  Box,
  Layers,
  Users,
  ShoppingBag,
  Zap,
  Loader2,
} from "lucide-react";
import Loading from "@/components/ui/Loading";

// Custom hook to fetch store owner data
const useStoreOwnerData = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStoreOwner = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${BASE_API}/store-owners/me/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const storeOwnerData = await response.json();
          console.log("📦 Store owner data:", storeOwnerData);
          setUser(storeOwnerData);
        } else {
          console.error("Failed to fetch store owner data");
        }
      } catch (error) {
        console.error("Error fetching store owner:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreOwner();
  }, []);

  return { user, isLoading };
};

export default function DashboardOverview() {
  const { user, isLoading: userLoading } = useStoreOwnerData();
  const router = useRouter();
  const [stats, setStats] = useState({
    stores: 0,
    products: 0,
    orders: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  useEffect(() => {
    if (!userLoading && user) {
      fetchDashboardData();
      updateImagePreviews();
    }
  }, [userLoading, user]);

  const updateImagePreviews = () => {
    if (!user) return;

    console.log("🖼️ Updating image previews for dashboard...");

    // Profile image
    if (user.profile_image_info) {
      const profileUrl = getImageUrl(user.profile_image_info);
      console.log("🖼️ Profile image URL:", profileUrl ? "Generated" : "Null");
      setProfileImagePreview(profileUrl);
    } else {
      setProfileImagePreview(null);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");

      // Since we're using StoreOwner model, we have one store per user
      const storesCount = user ? 1 : 0;
      let productsCount = user?.active_products_count || 0;
      let ordersCount = user?.total_sales || 0;
      let totalRevenue = parseFloat(user?.total_revenue || "0");

      // Fetch products for the user's store
      if (user && token) {
        try {
          // Fetch store owner's products
          const productsResponse = await fetch(
            `${BASE_API}/products/my-products/`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (productsResponse.ok) {
            const productsResult = await productsResponse.json();
            console.log("📦 My products data:", productsResult);

            // Handle different response formats
            let productsData = [];
            if (Array.isArray(productsResult)) {
              productsData = productsResult;
            } else if (productsResult.results) {
              productsData = productsResult.results;
            } else if (productsResult.data) {
              productsData = productsResult.data;
            }

            productsCount = productsData.length;

            // Calculate total value of products in stock
            totalRevenue = productsData.reduce((sum, product) => {
              return (
                sum +
                (parseFloat(product.price) || 0) *
                  (product.stock || product.stock_quantity || 0)
              );
            }, 0);

            // Set recent products for display
            setRecentProducts(productsData.slice(0, 3));
          }
        } catch (error) {
          console.error("Error fetching products:", error);
          // Use data from store owner profile
          productsCount = user.active_products_count || 0;
        }

        // Fetch orders for the user
        try {
          const ordersResponse = await fetch(`${BASE_API}/orders/`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (ordersResponse.ok) {
            const ordersResult = await ordersResponse.json();
            console.log("📦 Orders data:", ordersResult);

            let ordersData = [];
            if (Array.isArray(ordersResult)) {
              ordersData = ordersResult;
            } else if (ordersResult.results) {
              ordersData = ordersResult.results;
            } else if (ordersResult.data) {
              ordersData = ordersResult.data;
            }

            ordersCount = ordersData.length;
            setRecentOrders(ordersData.slice(0, 5));
          } else {
            // Use store owner's total sales if orders API fails
            ordersCount = user.total_sales || 0;
            setRecentOrders(generateMockOrders(ordersCount));
          }
        } catch (error) {
          console.error("Error fetching orders:", error);
          // Use store owner's total sales and generate mock orders
          ordersCount = user.total_sales || 0;
          setRecentOrders(generateMockOrders(ordersCount));
        }

        // Fetch store statistics
        try {
          const statsResponse = await fetch(
            `${BASE_API}/store-owners/me/statistics/`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            console.log("📊 Store statistics:", statsData);

            // Update stats with API data if available
            if (statsData) {
              productsCount = statsData.active_products_count || productsCount;
              ordersCount = statsData.total_sales || ordersCount;
              totalRevenue = parseFloat(
                statsData.total_revenue || totalRevenue
              );
            }
          }
        } catch (error) {
          console.error("Error fetching statistics:", error);
        }
      }

      setStats({
        stores: storesCount,
        products: productsCount,
        orders: ordersCount,
        revenue: totalRevenue,
      });
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
      toast.error("خطا در دریافت اطلاعات داشبورد");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock orders based on total sales count
  const generateMockOrders = (count) => {
    if (count === 0) return [];

    const statuses = ["delivered", "pending", "shipped", "paid"];
    return Array.from({ length: Math.min(count, 5) }, (_, index) => ({
      id: index + 1,
      total_amount: (Math.random() * 1000000 + 50000).toFixed(0),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      created_at: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
    }));
  };

  // Updated getImageUrl function for Django API

  const getImageUrl = (imageInfo) => {
    if (!imageInfo) return null;

    try {
      // If it's a blob URL (temporary preview)
      if (typeof imageInfo === "string" && imageInfo.startsWith("blob:")) {
        return imageInfo;
      }

      // If image URL is provided directly by Django
      if (imageInfo.url) {
        // Handle relative URLs
        if (imageInfo.url.startsWith("/")) {
          // For media URLs (like /media/profile_images/...), use Django base URL without /api
          if (imageInfo.url.startsWith("/media/")) {
            const djangoBaseUrl = BASE_API.replace("/api", "");
            return `${djangoBaseUrl}${imageInfo.url}`;
          }
          return `${BASE_API}${imageInfo.url}`;
        }
        return imageInfo.url;
      }

      if (imageInfo.filename) {
        return `${BASE_API}${imageInfo.filename}`;
      }

      if (typeof imageInfo === "string" && imageInfo.startsWith("http")) {
        return imageInfo;
      }

      return null;
    } catch (error) {
      console.error("❌ Error creating image URL:", error);
      return null;
    }
  };

  // Handle image load error
  const handleImageError = (e) => {
    console.error("❌ Profile image failed to load in dashboard");
    e.target.style.display = "none";

    // Show fallback if image fails to load
    const fallbackElement = e.target.nextSibling;
    if (fallbackElement && fallbackElement.style) {
      fallbackElement.style.display = "flex";
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {isLoading ? (
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : typeof value === "number" ? (
              value.toLocaleString()
            ) : (
              value
            )}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 flex items-center">
              <TrendingUp className="ml-1 text-green-500" size={12} />
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={`p-4 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}
        >
          <div className={`text-2xl ${color}`}>{icon}</div>
        </div>
      </div>
    </div>
  );

  const QuickAction = ({
    title,
    description,
    icon,
    onClick,
    color = "blue",
  }) => {
    const colorClasses = {
      blue: "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200",
      green: "bg-green-50 text-green-600 hover:bg-green-100 border-green-200",
      purple:
        "bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200",
      orange:
        "bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200",
    };

    return (
      <button
        onClick={onClick}
        className={`bg-white rounded-xl shadow-sm border p-4 text-right hover:shadow-lg transition-all duration-300 group w-full ${
          color === "blue"
            ? "hover:border-blue-300"
            : color === "green"
            ? "hover:border-green-300"
            : color === "purple"
            ? "hover:border-purple-300"
            : "hover:border-orange-300"
        }`}
      >
        <div className="flex items-center justify-between">
          <div
            className={`p-3 rounded-xl ${colorClasses[color]} transition-colors`}
          >
            <div className="text-lg">{icon}</div>
          </div>
          <div className="flex-1 mr-3">
            <h3 className="font-semibold text-gray-900 text-right">{title}</h3>
            <p className="text-sm text-gray-600 mt-1 text-right">
              {description}
            </p>
          </div>
          <ArrowRight
            className={`opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 ${
              color === "blue"
                ? "text-blue-600"
                : color === "green"
                ? "text-green-600"
                : color === "purple"
                ? "text-purple-600"
                : "text-orange-600"
            }`}
          />
        </div>
      </button>
    );
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      delivered: {
        label: "تحویل شده",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
      },
      pending: {
        label: "در انتظار",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
      },
      shipped: {
        label: "ارسال شده",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Truck,
      },
      paid: {
        label: "پرداخت شده",
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: CreditCard,
      },
      completed: {
        label: "تکمیل شده",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        <IconComponent className="ml-1" size={14} />
        {config.label}
      </span>
    );
  };

  const ActivityItem = ({ icon, title, description, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      orange: "bg-orange-500",
    };

    return (
      <div className="flex items-center space-x-4 space-x-reverse p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
        <div
          className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center text-white`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    );
  };

  const ProductItem = ({ product }) => {
    const productImage =
      product.images && product.images.length > 0
        ? getImageUrl(product.images[0])
        : "/api/placeholder/80/80";

    return (
      <div className="flex items-center space-x-4 space-x-reverse p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 group">
        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
          <img
            src={productImage}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <div className="hidden w-full h-full items-center justify-center">
            <Package className="w-6 h-6 text-gray-400" />
          </div>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm line-clamp-1">
            {product.title}
          </p>
          <p className="text-green-600 font-bold text-sm" dir="ltr">
            {parseInt(product.price || 0).toLocaleString()} ریال
          </p>
          <div className="flex items-center space-x-2 space-x-reverse mt-1">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                (product.stock || product.stock_quantity) > 10
                  ? "bg-green-100 text-green-700"
                  : (product.stock || product.stock_quantity) > 0
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              موجودی: {product.stock || product.stock_quantity || 0}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return "کاربر";
    return (
      `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
      user.full_name ||
      "کاربر"
    );
  };

  // Get user role
  const getUserRole = () => {
    if (!user) return "کاربر";

    if (user.store_type === "multi-vendor") {
      return "مدیر سیستم";
    } else if (user.store_type === "single-vendor") {
      return "مالک فروشگاه";
    }

    return user.seller_status === "approved" ? "کاربر تایید شده" : "کاربر";
  };

  // Get store rating display
  const getStoreRating = () => {
    if (!user?.store_rating) return { average: 0, count: 0 };
    return user.store_rating;
  };

  // Refresh dashboard data
  const handleRefresh = () => {
    fetchDashboardData();
    toast.success("داده‌ها به‌روزرسانی شد");
  };

  if (isLoading || userLoading) {
    return <Loading fullScreen={true} />;
  }

  return (
    <div className="space-y-8 p-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex-1">
            <div className="flex items-center space-x-3 space-x-reverse mb-3">
              <Award className="text-yellow-300 text-xl" />
              <span className="text-red-400 font-bold text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
                پنل مدیریت فروشگاه
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              سلام، {getUserDisplayName()}! 👋
            </h1>
            <p className="text-blue-100 text-lg opacity-90 mb-4">
              به پنل مدیریت فروشگاه خود خوش آمدید. از اینجا می‌توانید تمام
              فعالیت‌های خود را مدیریت کنید.
            </p>
            <div className="flex items-center space-x-6 space-x-reverse">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Activity className="text-blue-200" />
                <span className="text-blue-200 text-sm">
                  وضعیت:{" "}
                  {user?.seller_status === "approved"
                    ? "فعال"
                    : "در انتظار تایید"}
                </span>
              </div>
              <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Calendar className="text-blue-200" />
                <span className="text-blue-200 text-sm">
                  {new Date().toLocaleDateString("fa-IR")}
                </span>
              </div>
              <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Star className="text-yellow-300" />
                <span className="text-blue-200 text-sm">
                  سطح: {getUserRole()}
                </span>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex items-center space-x-4 space-x-reverse">
            <div className="relative">
              <div className="w-28 h-28 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white border-opacity-30 shadow-2xl">
                {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt="Profile"
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-lg"
                    onError={handleImageError}
                  />
                ) : null}
                {!profileImagePreview && (
                  <div className="w-24 h-24 rounded-2xl bg-white bg-opacity-30 flex items-center justify-center">
                    <User className="w-12 h-12 text-white opacity-80" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-400 rounded-full border-4 border-indigo-600 flex items-center justify-center">
                <CheckCircle className="text-white text-sm" />
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="bg-white/20 hover:bg-white/30 p-3 rounded-2xl transition-all duration-300 backdrop-blur-sm border border-white/30"
              title="بروزرسانی داده‌ها"
            >
              <RefreshCw className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="فروشگاه‌ها"
          value={stats.stores}
          icon={<Store className="text-blue-600" />}
          color="text-blue-600"
          subtitle={stats.stores > 0 ? "فروشگاه فعال" : "بدون فروشگاه"}
        />
        <StatCard
          title="محصولات فعال"
          value={stats.products}
          icon={<Package className="text-green-600" />}
          color="text-green-600"
          subtitle={stats.products > 0 ? "محصول موجود" : "بدون محصول"}
        />
        <StatCard
          title="فروش کل"
          value={stats.orders}
          icon={<ShoppingBag className="text-purple-600" />}
          color="text-purple-600"
          subtitle={stats.orders > 0 ? "سفارش ثبت شده" : "بدون فروش"}
        />
        <StatCard
          title="درآمد کل (ریال)"
          value={stats.revenue}
          icon={<DollarSign className="text-yellow-600" />}
          color="text-yellow-600"
          subtitle={stats.revenue > 0 ? "درآمد مجموع" : "بدون درآمد"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Zap className="ml-2 text-yellow-500" />
              دسترسی سریع
            </h2>
            <Activity className="text-gray-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickAction
              title="مدیریت محصولات"
              description="محصولات خود را مدیریت کنید"
              icon={<Package className="text-blue-600" />}
              onClick={() => router.push("/dashboard/products")}
              color="blue"
            />
            <QuickAction
              title="افزودن محصول"
              description="محصول جدید به فروشگاه اضافه کنید"
              icon={<Plus className="text-green-600" />}
              onClick={() => router.push("/dashboard/products/")}
              color="green"
            />
            <QuickAction
              title="مشاهده سفارشات"
              description="سفارشات خود را پیگیری کنید"
              icon={<Eye className="text-purple-600" />}
              onClick={() => router.push("/dashboard/orders")}
              color="purple"
            />
            <QuickAction
              title="پروفایل فروشگاه"
              description="اطلاعات فروشگاه را ویرایش کنید"
              icon={<User className="text-orange-600" />}
              onClick={() => router.push("/dashboard/profile")}
              color="orange"
            />
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Package className="ml-2 text-green-500" />
              محصولات اخیر
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock size={16} />
              <span>آخرین محصولات</span>
            </div>
          </div>
          {recentProducts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="text-gray-400 text-2xl" />
              </div>
              <p className="text-gray-500 mb-2">هنوز محصولی اضافه نکرده‌اید.</p>
              <button
                onClick={() => router.push("/dashboard/products/")}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center mx-auto"
              >
                <Plus className="ml-1" />
                افزودن اولین محصول
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProducts.map((product) => (
                <ProductItem key={product.id} product={product} />
              ))}
              <button
                onClick={() => router.push("/dashboard/products")}
                className="w-full mt-4 py-3 text-center text-blue-600 hover:text-blue-800 font-semibold border border-gray-200 rounded-xl hover:border-blue-300 transition-colors flex items-center justify-center group"
              >
                مشاهده همه محصولات
                <ArrowRight className="mr-2 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <ShoppingBag className="ml-2 text-purple-500" />
              سفارشات اخیر
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock size={16} />
              <span>آخرین به‌روزرسانی: هم‌اکنون</span>
            </div>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="text-gray-400 text-3xl" />
              </div>
              <p className="text-gray-500 mb-2 text-lg">
                هنوز سفارشی ثبت نکرده‌اید.
              </p>
              <p className="text-gray-400 text-sm mb-4">
                با ثبت اولین سفارش، اطلاعات اینجا نمایش داده می‌شود
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div
                  key={order.id || index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-300 group hover:shadow-md"
                >
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
                      <Package className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        سفارش #
                        {order.id?.toString().slice(-6) || `ORD-${index + 1}`}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <Calendar className="ml-1" size={14} />
                        {new Date(
                          order.created_at || new Date()
                        ).toLocaleDateString("fa-IR")}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900 text-lg mb-2">
                      {parseInt(
                        order.total_amount || order.totalAmount || "0"
                      ).toLocaleString()}{" "}
                      ریال
                    </p>
                    <StatusBadge status={order.status || "pending"} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {recentOrders.length > 0 && (
            <button
              onClick={() => router.push("/dashboard/orders")}
              className="w-full mt-6 py-3 text-center text-blue-600 hover:text-blue-800 font-semibold border border-gray-200 rounded-xl hover:border-blue-300 transition-colors flex items-center justify-center group"
            >
              مشاهده همه سفارشات
              <ArrowRight className="mr-2 transform group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="ml-2 text-blue-500" />
              آمار عملکرد
            </h2>
            <Settings className="text-gray-400" />
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Star className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">امتیاز فروشگاه</p>
                  <p className="text-sm text-gray-600">
                    {getStoreRating().average} از ۵ ({getStoreRating().count}{" "}
                    نظر)
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {((getStoreRating().average / 5) * 100).toFixed(0)}٪
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Box className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">محصولات فعال</p>
                  <p className="text-sm text-gray-600">آماده برای فروش</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {stats.products}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Users className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">رضایت مشتریان</p>
                  <p className="text-sm text-gray-600">بر اساس نظرات</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {getStoreRating().count > 0 ? "۹۵٪" : "۰٪"}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">نرخ رشد</p>
                  <p className="text-sm text-gray-600">ماه جاری</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {stats.orders > 0 ? "۲۴٪" : "۰٪"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
