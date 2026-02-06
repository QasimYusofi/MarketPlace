// app/user/dashboard/orders/[id]/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  CreditCard,
  Printer,
  Download,
  MessageSquare,
  Phone,
  Mail,
  User,
  Store,
  Calendar,
  DollarSign,
  ShoppingBag,
  ChevronLeft,
  AlertCircle,
  Loader2,
  Copy,
  ExternalLink,
  Receipt,
  RefreshCw,
  Shield,
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
    cancelled: AlertCircle,
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

// Order Timeline Component
const OrderTimeline = ({ status }) => {
  const steps = [
    {
      id: "pending",
      label: "ثبت سفارش",
      icon: Clock,
      color: "text-yellow-500",
    },
    { id: "paid", label: "پرداخت", icon: CreditCard, color: "text-blue-500" },
    {
      id: "processing",
      label: "آماده سازی",
      icon: Package,
      color: "text-indigo-500",
    },
    { id: "shipped", label: "ارسال", icon: Truck, color: "text-purple-500" },
    {
      id: "delivered",
      label: "تحویل",
      icon: CheckCircle,
      color: "text-green-500",
    },
  ];

  const getStepStatus = (stepId) => {
    const stepOrder = ["pending", "paid", "processing", "shipped", "delivered"];
    const currentIndex = stepOrder.indexOf(status);
    const stepIndex = stepOrder.indexOf(stepId);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

  return (
    <div className="relative">
      <div className="flex justify-between mb-4">
        {steps.map((step, index) => {
          const stepStatus = getStepStatus(step.id);
          const StepIcon = step.icon;

          return (
            <div
              key={step.id}
              className="flex flex-col items-center text-center"
              style={{ width: "20%" }}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  stepStatus === "completed"
                    ? "bg-green-100 border-2 border-green-500"
                    : stepStatus === "current"
                    ? "bg-blue-100 border-2 border-blue-500"
                    : "bg-gray-100 border-2 border-gray-300"
                }`}
              >
                <StepIcon
                  className={`w-6 h-6 ${
                    stepStatus === "completed"
                      ? "text-green-600"
                      : stepStatus === "current"
                      ? "text-blue-600"
                      : "text-gray-400"
                  }`}
                />
              </div>
              <span
                className={`text-sm font-medium ${
                  stepStatus === "completed"
                    ? "text-green-700"
                    : stepStatus === "current"
                    ? "text-blue-700"
                    : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress Line */}
      <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 -z-10">
        <div
          className="h-full bg-green-500 transition-all duration-500"
          style={{
            width:
              status === "delivered"
                ? "100%"
                : status === "shipped"
                ? "75%"
                : status === "processing"
                ? "50%"
                : status === "paid"
                ? "25%"
                : "0%",
          }}
        />
      </div>
    </div>
  );
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch order details from API
  const fetchOrderDetails = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      toast.error("لطفا ابتدا وارد حساب کاربری خود شوید");
      router.push("/auth/user-login");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/orders/${params.id}/`, {
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
          toast.error("سفارش مورد نظر یافت نشد");
          router.push("/user/dashboard/orders");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const orderData = await response.json();
      console.log("Order details received:", orderData);
      setOrder(orderData);
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("خطا در دریافت اطلاعات سفارش");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [params.id, router]);

  // Refresh order
  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrderDetails();
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Download invoice
  const handleDownloadInvoice = async () => {
    const token = getAuthToken();
    try {
      toast.loading("در حال دریافت فاکتور...");
      const response = await fetch(
        `${API_BASE_URL}/orders/${params.id}/invoice/`,
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
        a.download = `invoice-${params.id}.pdf`;
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

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("کپی شد");
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

  // Calculate order totals
  const calculateOrderTotals = (items) => {
    if (!items || !Array.isArray(items)) return { subtotal: 0, total: 0 };

    const subtotal = items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = item.quantity || 1;
      return sum + price * quantity;
    }, 0);

    // Assuming shipping is included in total_amount, we'll use that
    return { subtotal, total: subtotal };
  };

  // Initialize
  useEffect(() => {
    if (params.id) {
      fetchOrderDetails();
    }
  }, [params.id, fetchOrderDetails]);

  // Loading state
  if (loading && !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">در حال بارگذاری اطلاعات سفارش...</p>
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
            برای مشاهده اطلاعات سفارش، لطفا وارد حساب کاربری خود شوید
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

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          سفارش یافت نشد
        </h3>
        <p className="text-gray-500 mb-6">
          سفارش مورد نظر وجود ندارد یا حذف شده است
        </p>
        <Link
          href="/user/dashboard/orders"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          بازگشت به سفارشات
        </Link>
      </div>
    );
  }

  const { subtotal } = calculateOrderTotals(order.items);
  const totalAmount = parseFloat(order.total_amount) || subtotal;
  const itemsCount =
    order.items_count || (order.items ? order.items.length : 0);
  const StatusIcon = getStatusIcon(order.status);
  const store = order.store;
  const user = order.user;
  const shippingAddress = order.shipping_address;

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
            <div className="flex items-center space-x-2 space-x-reverse mb-3">
              <Link
                href="/user/dashboard/orders"
                className="flex items-center text-gray-500 hover:text-gray-700 text-sm"
              >
                <ChevronLeft className="w-4 h-4 ml-1" />
                سفارشات
              </Link>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                سفارش #{order.id.slice(-8).toUpperCase()}
              </h1>
              <div className="flex items-center space-x-2 space-x-reverse">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(
                    order.status
                  )}`}
                >
                  <StatusIcon className="w-4 h-4 ml-1" />
                  {getOrderStatus(order.status)}
                </span>
                <button
                  onClick={handleRefresh}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="بروزرسانی"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 ml-1" />
                ثبت شده: {formatDate(order.created_at)}
              </span>
              <span className="flex items-center">
                <ShoppingBag className="w-4 h-4 ml-1" />
                {itemsCount} قلم کالا
              </span>
              <span className="flex items-center">
                <Store className="w-4 h-4 ml-1" />
                {store?.store_name || "فروشگاه نامشخص"}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <button
              onClick={handleDownloadInvoice}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <Download className="w-4 h-4 ml-2" />
              دانلود فاکتور
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Printer className="w-4 h-4 ml-2" />
              چاپ
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Timeline & Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  وضعیت سفارش
                </h2>
                <div className="text-sm text-gray-500">
                  آخرین به‌روزرسانی: {formatDate(order.updated_at)}
                </div>
              </div>
              <OrderTimeline status={order.status} />

              {order.tracking_number && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Truck className="w-5 h-5 text-blue-600 ml-2" />
                      <div>
                        <div className="font-medium text-blue-900">
                          کد رهگیری
                        </div>
                        <div className="font-mono text-lg mt-1">
                          {order.tracking_number}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(order.tracking_number)}
                      className="p-2 text-blue-600 hover:text-blue-700"
                      title="کپی کد"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  اقلام سفارش ({itemsCount})
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {order.items?.map((item) => {
                    const product = item.product;
                    const imageUrl = getProductImageUrl(product);
                    const itemTotal =
                      (parseFloat(item.price) || 0) * (item.quantity || 1);

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-start space-x-4 space-x-reverse mb-3 sm:mb-0">
                          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={item.title || product?.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900">
                              {item.title ||
                                product?.title ||
                                "محصول بدون عنوان"}
                            </h4>
                            {product?.sku && (
                              <p className="text-sm text-gray-500 mt-1">
                                کد محصول: {product.sku}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.color && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                  رنگ: {item.color}
                                </span>
                              )}
                              {item.size && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                  سایز: {item.size}
                                </span>
                              )}
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                تعداد: {item.quantity || 1}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-bold text-gray-900 text-lg">
                            {formatPrice(itemTotal)}
                          </p>
                          <p className="text-sm text-gray-500">
                            واحد: {formatPrice(item.price)}
                          </p>
                          {product && (
                            <Link
                              href={`/product-details/${product.id}`}
                              className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm mt-2"
                            >
                              مشاهده محصول
                              <ExternalLink className="w-3 h-3 mr-1" />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Receipt className="w-5 h-5 ml-2" />
                  خلاصه سفارش
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">جمع کل اقلام</span>
                    <span className="text-gray-900">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">هزینه ارسال</span>
                    <span className="text-gray-900">
                      {order.status === "delivered" ||
                      order.status === "shipped"
                        ? formatPrice(25000)
                        : "محاسبه پس از پرداخت"}
                    </span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>تخفیف</span>
                    <span>- {formatPrice(0)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200">
                    <span className="font-semibold text-gray-900 text-lg">
                      مبلغ قابل پرداخت
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>

                  {/* Payment Status */}
                  <div
                    className={`mt-4 p-3 rounded-lg ${
                      order.status === "pending"
                        ? "bg-yellow-50 border border-yellow-200"
                        : order.status === "paid"
                        ? "bg-green-50 border border-green-200"
                        : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <div className="flex items-center">
                      <CreditCard
                        className={`w-5 h-5 ml-2 ${
                          order.status === "pending"
                            ? "text-yellow-600"
                            : order.status === "paid"
                            ? "text-green-600"
                            : "text-gray-600"
                        }`}
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          وضعیت پرداخت:{" "}
                          {order.status === "paid"
                            ? "پرداخت شده"
                            : "در انتظار پرداخت"}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          روش پرداخت:{" "}
                          {getPaymentMethodText(order.payment_method)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Shipping & Payment Info */}
          <div className="space-y-6">
            {/* Store Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Store className="w-5 h-5 ml-2" />
                  اطلاعات فروشگاه
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Store className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {store?.store_name || "فروشگاه نامشخص"}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        فروشنده: {store?.full_name || "نامشخص"}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-600 mb-2">
                      اطلاعات تماس فروشگاه:
                    </div>
                    <div className="space-y-2">
                      {store?.phone && (
                        <div className="flex items-center text-sm text-gray-700">
                          <Phone className="w-4 h-4 ml-2 text-gray-400" />
                          {store.phone}
                        </div>
                      )}
                      {store?.email && (
                        <div className="flex items-center text-sm text-gray-700">
                          <Mail className="w-4 h-4 ml-2 text-gray-400" />
                          {store.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Truck className="w-5 h-5 ml-2" />
                  اطلاعات ارسال
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center">
                      <User className="w-4 h-4 ml-1" />
                      نام تحویل گیرنده
                    </label>
                    <p className="text-gray-900">
                      {shippingAddress?.firstName} {shippingAddress?.lastName}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center">
                      <MapPin className="w-4 h-4 ml-1" />
                      آدرس تحویل
                    </label>
                    <p className="text-gray-900">
                      {shippingAddress?.address || "آدرس مشخص نشده"}
                    </p>
                    <div className="text-sm text-gray-500 mt-1 space-y-1">
                      {shippingAddress?.city && (
                        <div>شهر: {shippingAddress.city}</div>
                      )}
                      {shippingAddress?.postalCode && (
                        <div>کد پستی: {shippingAddress.postalCode}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center">
                      <Phone className="w-4 h-4 ml-1" />
                      شماره تماس
                    </label>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900">
                        {shippingAddress?.phone || user?.phone || "—"}
                      </p>
                      {shippingAddress?.phone && (
                        <button
                          onClick={() => copyToClipboard(shippingAddress.phone)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="کپی شماره"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {shippingAddress?.note && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        📝 یادداشت شما
                      </label>
                      <p className="text-gray-900 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        {shippingAddress.note}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 ml-2" />
                  اطلاعات مشتری
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      نام کامل
                    </label>
                    <p className="text-gray-900">
                      {user?.full_name ||
                        shippingAddress?.firstName +
                          " " +
                          shippingAddress?.lastName}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      شماره تماس
                    </label>
                    <p className="text-gray-900">
                      {user?.phone || shippingAddress?.phone || "—"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      کد مشتری
                    </label>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900 font-mono">
                        {user?.id?.slice(-8).toUpperCase() || "—"}
                      </p>
                      {user?.id && (
                        <button
                          onClick={() => copyToClipboard(user.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="کپی کد"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="space-y-3">
                  <button
                    onClick={handleDownloadInvoice}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Download className="w-4 h-4 ml-2" />
                    دانلود فاکتور
                  </button>

                  <Link
                    href="/user/dashboard/support/new"
                    className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    <MessageSquare className="w-4 h-4 ml-2" />
                    تماس با پشتیبانی
                  </Link>

                  {order.status === "delivered" && (
                    <button
                      onClick={() =>
                        toast.success("درخواست بازگشت کالا ثبت شد")
                      }
                      className="w-full px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center"
                    >
                      <RefreshCw className="w-4 h-4 ml-2" />
                      درخواست بازگشت کالا
                    </button>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 ml-2 text-green-500" />
                        این سفارش تحت پوشش گارانتی ۷ روزه بازگشت وجه می‌باشد
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
