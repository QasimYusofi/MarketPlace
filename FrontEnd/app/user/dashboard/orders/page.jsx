// app/user/dashboard/orders/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  Package,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  RefreshCw,
  Loader2,
  AlertCircle,
  Calendar,
  CreditCard,
  MapPin,
  Store,
  User,
  Phone,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const MEDIA_BASE_URL = "http://127.0.0.1:8000";

// Utility functions
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
};

const formatPrice = (price) => {
  if (!price && price !== 0) return "۰ تومان";
  return (
    new Intl.NumberFormat("fa-IR").format(Math.round(parseFloat(price) || 0)) +
    " تومان"
  );
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getPersianDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  const persianDate = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
  return persianDate;
};

const getRelativeTime = (dateString) => {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins} دقیقه قبل`;
  } else if (diffHours < 24) {
    return `${diffHours} ساعت قبل`;
  } else if (diffDays < 30) {
    return `${diffDays} روز قبل`;
  } else {
    return getPersianDate(dateString);
  }
};

const getOrderStatus = (status) => {
  const statusMap = {
    pending: "در انتظار پرداخت",
    paid: "پرداخت شده",
    processing: "در حال پردازش",
    shipped: "ارسال شده",
    delivered: "تحویل داده شده",
    cancelled: "لغو شده",
    refunded: "مرجوع شده",
  };
  return statusMap[status] || status;
};

const getStatusColor = (status) => {
  const colorMap = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    paid: "bg-blue-100 text-blue-800 border-blue-200",
    processing: "bg-indigo-100 text-indigo-800 border-indigo-200",
    shipped: "bg-purple-100 text-purple-800 border-purple-200",
    delivered: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    refunded: "bg-gray-100 text-gray-800 border-gray-200",
  };
  return colorMap[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

const getStatusIcon = (status) => {
  const iconMap = {
    pending: Clock,
    paid: CreditCard,
    processing: Clock,
    shipped: Truck,
    delivered: CheckCircle,
    cancelled: XCircle,
    refunded: AlertCircle,
  };
  return iconMap[status] || Package;
};

const getPaymentMethodText = (method) => {
  const methodMap = {
    online: "پرداخت آنلاین",
    cash: "پرداخت در محل",
    bank_transfer: "کارت به کارت",
  };
  return methodMap[method] || method || "—";
};

const statusFilters = [
  { id: "all", label: "همه سفارشات", status: null },
  { id: "pending", label: "در انتظار پرداخت", status: "pending" },
  { id: "paid", label: "پرداخت شده", status: "paid" },
  { id: "processing", label: "در حال پردازش", status: "processing" },
  { id: "shipped", label: "ارسال شده", status: "shipped" },
  { id: "delivered", label: "تحویل داده شده", status: "delivered" },
  { id: "cancelled", label: "لغو شده", status: "cancelled" },
];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      toast.error("لطفا ابتدا وارد حساب کاربری خود شوید");
      router.push("/auth/user-login");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/orders/my-orders/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("accessToken");
          toast.error("لطفا مجددا وارد حساب کاربری خود شوید");
          router.push("/auth/user-login");
          return;
        }
        if (response.status === 404) {
          setOrders([]);
          setTotalOrders(0);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Orders data received:", data);

      // Handle both array and paginated response
      let ordersData = Array.isArray(data)
        ? data
        : data.results || data.orders || [];

      // Apply filters
      if (statusFilter !== "all") {
        const statusObj = statusFilters.find((f) => f.id === statusFilter);
        if (statusObj?.status) {
          ordersData = ordersData.filter(
            (order) => order.status === statusObj.status
          );
        }
      }

      if (searchQuery) {
        ordersData = ordersData.filter(
          (order) =>
            order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.tracking_number
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            order.store?.store_name
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase())
        );
      }

      setOrders(ordersData);
      setTotalOrders(ordersData.length);
      setTotalPages(1); // Since we're not paginating on frontend
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("خطا در دریافت سفارشات");
    } finally {
      setLoading(false);
    }
  }, [router, statusFilter, searchQuery]);

  // Calculate order statistics
  const calculateOrderStats = useCallback((ordersList) => {
    const stats = {
      total: ordersList.length,
      pending: ordersList.filter((o) => o.status === "pending").length,
      paid: ordersList.filter((o) => o.status === "paid").length,
      processing: ordersList.filter((o) => o.status === "processing").length,
      shipped: ordersList.filter((o) => o.status === "shipped").length,
      delivered: ordersList.filter((o) => o.status === "delivered").length,
      cancelled: ordersList.filter((o) => o.status === "cancelled").length,
    };
    setOrderStats(stats);
  }, []);

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  // Handle filter change
  const handleFilterChange = (filterId) => {
    setStatusFilter(filterId);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchOrders();
  };

  // Download invoice
  const handleDownloadInvoice = async (orderId) => {
    const token = getAuthToken();
    try {
      toast.loading("در حال دریافت فاکتور...");
      // This endpoint should be implemented in your backend
      const response = await fetch(
        `${API_BASE_URL}/orders/${orderId}/invoice/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.dismiss();
        toast.success("فاکتور با موفقیت دانلود شد");
      } else {
        toast.dismiss();
        toast.error("خطا در دریافت فاکتور");
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.dismiss();
      toast.error("خطا در دریافت فاکتور");
    }
  };

  // Get product image URL
  const getProductImageUrl = (product) => {
    if (!product) return null;

    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      const imagePath = product.images[0];
      if (imagePath.startsWith("/media/")) {
        return `${MEDIA_BASE_URL}${imagePath}`;
      }
      return `${MEDIA_BASE_URL}/media/${imagePath}`;
    }

    return null;
  };

  // Initialize
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    calculateOrderStats(orders);
  }, [orders, calculateOrderStats]);

  // Loading state
  if (loading && !orders.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">در حال بارگذاری سفارشات...</p>
        </div>
      </div>
    );
  }

  // No auth state
  if (!getAuthToken()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            نیاز به ورود به حساب کاربری
          </h2>
          <p className="text-gray-600 mb-8">
            برای مشاهده سفارشات، لطفا وارد حساب کاربری خود شوید
          </p>
          <button
            onClick={() => router.push("/auth/user-login")}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full"
          >
            ورود به حساب کاربری
          </button>
        </div>
      </div>
    );
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
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        }}
      />

      <div className="space-y-6 font-vazirmatn" dir="rtl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">سفارشات من</h1>
            <p className="text-gray-600 mt-1">مدیریت و پیگیری سفارشات شما</p>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <RefreshCw
                className={`w-4 h-4 ml-2 ${loading ? "animate-spin" : ""}`}
              />
              به‌روزرسانی
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Printer className="w-4 h-4 ml-2" />
              چاپ گزارش
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex-1 max-w-md"
            >
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="جستجو بر اساس شماره سفارش، کد رهگیری یا نام فروشگاه..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </form>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">
                فیلتر بر اساس وضعیت:
              </span>
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {statusFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleFilterChange(filter.id)}
                className={`px-3 py-2 rounded-lg text-sm transition-all border ${
                  filter.id === statusFilter
                    ? `${getStatusColor(filter.status)} font-medium`
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Grid */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                سفارشی یافت نشد
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || statusFilter !== "all"
                  ? "با فیلترهای انتخابی شما سفارشی یافت نشد"
                  : "شما هنوز سفارشی ثبت نکرده‌اید"}
              </p>
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                شروع خرید
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {orders.map((order) => {
                  const StatusIcon = getStatusIcon(order.status);
                  const itemsCount =
                    order.items_count || (order.items ? order.items.length : 0);
                  const totalAmount = parseFloat(order.total_amount) || 0;
                  const store = order.store;
                  const user = order.user;
                  const shippingAddress = order.shipping_address;

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                      {/* Order Header */}
                      <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <div
                              className={`p-2 rounded-lg ${getStatusColor(
                                order.status
                              )}`}
                            >
                              <StatusIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <span className="font-medium text-gray-900">
                                  سفارش #{order.id.slice(-8).toUpperCase()}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    order.status
                                  )}`}
                                >
                                  {getOrderStatus(order.status)}
                                </span>
                              </div>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Calendar className="w-3 h-3 ml-1" />
                                <span>
                                  {getRelativeTime(order.created_at)} •{" "}
                                  {getPersianDate(order.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="text-left">
                              <div className="text-sm text-gray-500">
                                مبلغ سفارش
                              </div>
                              <div className="font-bold text-gray-900 text-lg">
                                {formatPrice(totalAmount)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Store Info */}
                          <div className="space-y-3">
                            <div className="flex items-start space-x-2 space-x-reverse">
                              <Store className="w-5 h-5 text-gray-400 mt-0.5" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  فروشگاه
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {store?.store_name ||
                                    store?.full_name ||
                                    "فروشگاه نامشخص"}
                                </div>
                                {store?.full_name && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    فروشنده: {store.full_name}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-start space-x-2 space-x-reverse">
                              <User className="w-5 h-5 text-gray-400 mt-0.5" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  گیرنده
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {shippingAddress?.firstName}{" "}
                                  {shippingAddress?.lastName}
                                </div>
                                {shippingAddress?.phone && (
                                  <div className="text-xs text-gray-500 mt-1 flex items-center">
                                    <Phone className="w-3 h-3 ml-1" />
                                    {shippingAddress.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Shipping Address */}
                          <div className="space-y-3">
                            <div className="flex items-start space-x-2 space-x-reverse">
                              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  آدرس تحویل
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {shippingAddress?.address || "آدرس مشخص نشده"}
                                </div>
                                {shippingAddress?.city && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    شهر: {shippingAddress.city}
                                  </div>
                                )}
                                {shippingAddress?.note && (
                                  <div className="text-xs text-gray-500 mt-1 bg-yellow-50 p-2 rounded border border-yellow-200">
                                    📝 {shippingAddress.note}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-start space-x-2 space-x-reverse">
                              <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  روش پرداخت
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {getPaymentMethodText(order.payment_method)}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Order Items Preview */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-gray-900">
                                محصولات ({itemsCount})
                              </div>
                              <div className="text-xs text-gray-500">
                                {order.tracking_number
                                  ? `کد رهگیری: ${order.tracking_number}`
                                  : "بدون کد رهگیری"}
                              </div>
                            </div>

                            <div className="space-y-2">
                              {order.items?.slice(0, 2).map((item, index) => (
                                <div
                                  key={item.id}
                                  className="flex items-center space-x-3 space-x-reverse p-2 bg-gray-50 rounded-lg"
                                >
                                  {item.product?.images?.[0] && (
                                    <div className="w-10 h-10 rounded border border-gray-300 overflow-hidden flex-shrink-0">
                                      <img
                                        src={getProductImageUrl(item.product)}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                      {item.title ||
                                        item.product?.title ||
                                        "محصول بدون عنوان"}
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                      <span>تعداد: {item.quantity || 1}</span>
                                      <span>{formatPrice(item.price)}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {order.items && order.items.length > 2 && (
                                <div className="text-center text-sm text-gray-500">
                                  و {order.items.length - 2} محصول دیگر...
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 pt-4 border-t border-gray-200 space-y-3 sm:space-y-0">
                          <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
                            <ShoppingBag className="w-4 h-4" />
                            <span>
                              {itemsCount} محصول • مجموع:{" "}
                              {formatPrice(totalAmount)}
                            </span>
                          </div>

                          <div className="flex items-center space-x-3 space-x-reverse">
                            <button
                              onClick={() => handleDownloadInvoice(order.id)}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center text-sm"
                            >
                              <Download className="w-4 h-4 ml-1" />
                              فاکتور
                            </button>
                            <Link
                              href={`/user/dashboard/orders/${order.id}`}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
                            >
                              <Eye className="w-4 h-4 ml-1" />
                              مشاهده جزئیات
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="text-sm text-gray-700 mb-4 md:mb-0">
                      نمایش <span className="font-medium">{orders.length}</span>{" "}
                      از <span className="font-medium">{totalOrders}</span>{" "}
                      سفارش
                    </div>

                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`w-10 h-10 flex items-center justify-center border rounded-lg text-sm ${
                                currentPage === pageNum
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Order Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">کل سفارشات</p>
                <p className="text-2xl font-bold mt-1">{orderStats.total}</p>
              </div>
              <Package className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">تحویل شده</p>
                <p className="text-2xl font-bold mt-1">
                  {orderStats.delivered}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  {orderStats.delivered > 0
                    ? `${Math.round(
                        (orderStats.delivered / orderStats.total) * 100
                      )}%`
                    : "۰%"}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">در انتظار</p>
                <p className="text-2xl font-bold mt-1">{orderStats.pending}</p>
                <p className="text-xs opacity-75 mt-1">
                  {orderStats.paid > 0 && `${orderStats.paid} پرداخت شده`}
                </p>
              </div>
              <Clock className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">در حال ارسال</p>
                <p className="text-2xl font-bold mt-1">{orderStats.shipped}</p>
                <p className="text-xs opacity-75 mt-1">
                  {orderStats.processing > 0 &&
                    `${orderStats.processing} در پردازش`}
                </p>
              </div>
              <Truck className="w-8 h-8 opacity-80" />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        {orders.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              خلاصه سفارشات
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  آخرین سفارش
                </div>
                {orders.length > 0 &&
                  (() => {
                    const latestOrder = orders[0];
                    const latestAmount =
                      parseFloat(latestOrder.total_amount) || 0;
                    return (
                      <>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPrice(latestAmount)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {getRelativeTime(latestOrder.created_at)}
                        </div>
                      </>
                    );
                  })()}
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  میانگین سفارش
                </div>
                {orders.length > 0 &&
                  (() => {
                    const total = orders.reduce(
                      (sum, order) =>
                        sum + (parseFloat(order.total_amount) || 0),
                      0
                    );
                    const average = total / orders.length;
                    return (
                      <div className="text-2xl font-bold text-gray-900">
                        {formatPrice(average)}
                      </div>
                    );
                  })()}
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  مجموع خرید
                </div>
                {orders.length > 0 &&
                  (() => {
                    const total = orders.reduce(
                      (sum, order) =>
                        sum + (parseFloat(order.total_amount) || 0),
                      0
                    );
                    return (
                      <div className="text-2xl font-bold text-gray-900">
                        {formatPrice(total)}
                      </div>
                    );
                  })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
