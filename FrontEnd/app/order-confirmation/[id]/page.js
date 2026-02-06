// app/order-confirmation/[id]/page.js
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Package,
  Truck,
  Home,
  Download,
  Printer,
  Share2,
  ArrowRight,
  ShoppingBag,
  Clock,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  Store,
  Calendar,
  User,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

// Utility Functions
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
};

const formatPrice = (price) => {
  if (!price && price !== 0) return "۰ تومان";
  return new Intl.NumberFormat("fa-IR").format(Math.round(price)) + " تومان";
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getStatusText = (status) => {
  const statusMap = {
    pending: "در انتظار پرداخت",
    paid: "پرداخت شده",
    processing: "در حال پردازش",
    shipped: "ارسال شده",
    delivered: "تحویل داده شده",
    cancelled: "لغو شده",
    refunded: "عودت داده شده",
  };
  return statusMap[status] || status;
};

const getStatusColor = (status) => {
  const colorMap = {
    pending: "text-yellow-600 bg-yellow-100",
    paid: "text-blue-600 bg-blue-100",
    processing: "text-purple-600 bg-purple-100",
    shipped: "text-indigo-600 bg-indigo-100",
    delivered: "text-green-600 bg-green-100",
    cancelled: "text-red-600 bg-red-100",
    refunded: "text-gray-600 bg-gray-100",
  };
  return colorMap[status] || "text-gray-600 bg-gray-100";
};

const getStatusIcon = (status) => {
  const iconMap = {
    pending: <Clock className="w-4 h-4" />,
    paid: <CreditCard className="w-4 h-4" />,
    processing: <Package className="w-4 h-4" />,
    shipped: <Truck className="w-4 h-4" />,
    delivered: <CheckCircle className="w-4 h-4" />,
    cancelled: <AlertCircle className="w-4 h-4" />,
    refunded: <FileText className="w-4 h-4" />,
  };
  return iconMap[status] || <Clock className="w-4 h-4" />;
};

const getStatusStep = (status) => {
  const stepMap = {
    pending: 1,
    paid: 2,
    processing: 3,
    shipped: 4,
    delivered: 5,
  };
  return stepMap[status] || 1;
};

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const orderId = params.id;

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      if (!token) {
        toast.error("لطفا ابتدا وارد حساب کاربری خود شوید");
        router.push("/auth/user-login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/`, {
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
          setError("سفارش مورد نظر یافت نشد");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const orderData = await response.json();
      console.log("Order data received:", orderData);
      setOrder(orderData);
    } catch (error) {
      console.error("Error fetching order:", error);
      setError("خطا در دریافت اطلاعات سفارش");
      toast.error("خطا در دریافت اطلاعات سفارش");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (!order) return;

    const orderUrl = window.location.href;
    const shareText = `سفارش ${order.id} با مبلغ ${formatPrice(
      order.total_amount
    )}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `سفارش ${order.id}`,
          text: shareText,
          url: orderUrl,
        });
      } else {
        await navigator.clipboard.writeText(`${shareText} - ${orderUrl}`);
        toast.success("لینک سفارش کپی شد");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      if (error.name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(orderUrl);
          toast.success("لینک سفارش کپی شد");
        } catch (clipboardError) {
          toast.error("خطا در اشتراک‌گذاری");
        }
      }
    }
  };

  const handleDownloadInvoice = () => {
    toast.success("فاکتور سفارش آماده دریافت است");
    // In a real app, you would generate and download PDF invoice
    // Example: window.open(`${API_BASE_URL}/orders/${orderId}/invoice/`, '_blank');
  };

  // Calculate order totals
  const calculateTotals = (orderData) => {
    if (!orderData?.items) {
      return {
        subtotal: 0,
        shipping: 0,
        discount: 0,
        total: 0,
        itemsCount: 0,
      };
    }

    const subtotal = orderData.items.reduce(
      (sum, item) =>
        sum +
        parseFloat(item.price_snapshot || item.price) * (item.quantity || 1),
      0
    );

    const shipping = orderData.shipping_cost || 0;
    const discount = orderData.discount || 0;
    const total = subtotal + shipping - discount;

    const itemsCount = orderData.items.reduce(
      (sum, item) => sum + (item.quantity || 1),
      0
    );

    return {
      subtotal,
      shipping,
      discount,
      total,
      itemsCount,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">در حال بارگذاری اطلاعات سفارش...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            خطا در دریافت سفارش
          </h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <div className="space-y-4">
            <button
              onClick={() => router.push("/user/dashboard/orders")}
              className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              مشاهده سفارشات من
            </button>
            <button
              onClick={() => router.push("/")}
              className="block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              بازگشت به صفحه اصلی
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            سفارش یافت نشد
          </h2>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            بازگشت به صفحه اصلی
          </button>
        </div>
      </div>
    );
  }

  const { subtotal, shipping, discount, total, itemsCount } =
    calculateTotals(order);
  const statusStep = getStatusStep(order.status);
  const currentStep = statusStep;
  const totalSteps = 5;

  return (
    <div className="min-h-screen bg-gray-50 py-12 font-vazirmatn" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-10">
            <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              سفارش شما با موفقیت ثبت شد!
            </h1>
            <div className="inline-flex items-center px-6 py-3 bg-blue-50 rounded-full mb-6">
              <span className="text-gray-700">شماره سفارش:</span>
              <span className="mr-2 font-bold text-blue-600 text-lg">
                {order.id}
              </span>
            </div>
            <p className="text-gray-600 text-lg">
              جزئیات سفارش به ایمیل{" "}
              <span className="font-semibold text-gray-900">
                {order.shipping_address?.email || order.user?.email || "شما"}
              </span>{" "}
              ارسال شد.
            </p>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-8 flex items-center">
              <Clock className="w-6 h-6 ml-2" />
              وضعیت سفارش
            </h2>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`flex items-center px-4 py-2 rounded-lg ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusIcon(order.status)}
                  <span className="mr-2 font-medium">
                    {getStatusText(order.status)}
                  </span>
                </div>
                {order.tracking_number && (
                  <div className="text-left">
                    <p className="text-sm text-gray-600">کد رهگیری:</p>
                    <p className="font-mono font-bold text-gray-900">
                      {order.tracking_number}
                    </p>
                  </div>
                )}
              </div>

              {order.estimated_delivery && (
                <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <Calendar className="w-4 h-4 ml-2" />
                  <span>
                    تخمین زمان تحویل: {formatDate(order.estimated_delivery)}
                  </span>
                </div>
              )}
            </div>

            {/* Progress Steps */}
            <div className="relative">
              <div className="absolute top-5 right-0 left-0 h-1 bg-gray-200"></div>
              <div
                className="absolute top-5 right-0 h-1 bg-green-500 transition-all duration-500"
                style={{
                  width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
                }}
              ></div>

              <div className="flex justify-between relative">
                {[
                  {
                    step: 1,
                    icon: <CheckCircle className="w-6 h-6" />,
                    label: "ثبت سفارش",
                    date: order.created_at,
                  },
                  {
                    step: 2,
                    icon: <CreditCard className="w-6 h-6" />,
                    label: "پرداخت",
                    date: order.paid_at,
                  },
                  {
                    step: 3,
                    icon: <Package className="w-6 h-6" />,
                    label: "آماده‌سازی",
                    date: order.processing_at,
                  },
                  {
                    step: 4,
                    icon: <Truck className="w-6 h-6" />,
                    label: "ارسال",
                    date: order.shipped_at,
                  },
                  {
                    step: 5,
                    icon: <Home className="w-6 h-6" />,
                    label: "تحویل",
                    date: order.delivered_at,
                  },
                ].map(({ step, icon, label, date }) => (
                  <div
                    key={step}
                    className="flex flex-col items-center text-center"
                    style={{ width: `${100 / totalSteps}%` }}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 z-10 ${
                        step <= currentStep
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {icon}
                    </div>
                    <p
                      className={`text-sm font-medium ${
                        step <= currentStep ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {label}
                    </p>
                    {date && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(date)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-6 flex items-center">
              <Mail className="w-5 h-5 ml-2" />
              مراحل بعدی
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-blue-100">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center ml-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">پیگیری سفارش</p>
                    <p className="text-sm text-blue-700">
                      از طریق پنل کاربری یا کد رهگیری
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-blue-100">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center ml-3">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">پشتیبانی</p>
                    <p className="text-sm text-blue-700">
                      در صورت نیاز با پشتیبانی تماس بگیرید
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-blue-100">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center ml-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">زمان تحویل</p>
                    <p className="text-sm text-blue-700">
                      {order.estimated_delivery
                        ? `حدوداً ${formatDate(order.estimated_delivery)}`
                        : "به زودی اعلام می‌شود"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center p-4 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <Printer className="w-5 h-5 ml-2 text-gray-600 group-hover:text-blue-600" />
              <span className="text-gray-700 group-hover:text-gray-900">
                چاپ فاکتور
              </span>
            </button>

            <button
              onClick={handleDownloadInvoice}
              className="flex items-center justify-center p-4 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <Download className="w-5 h-5 ml-2 text-gray-600 group-hover:text-blue-600" />
              <span className="text-gray-700 group-hover:text-gray-900">
                دانلود فاکتور
              </span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center p-4 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <Share2 className="w-5 h-5 ml-2 text-gray-600 group-hover:text-blue-600" />
              <span className="text-gray-700 group-hover:text-gray-900">
                اشتراک‌گذاری
              </span>
            </button>

            <Link
              href="/user/dashboard/orders"
              className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all group"
            >
              <ShoppingBag className="w-5 h-5 ml-2" />
              <span>مشاهده سفارشات</span>
            </Link>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 ml-2" />
                  خلاصه سفارش
                </h2>
              </div>

              <div className="p-6">
                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-4">
                    محصولات سفارش
                  </h3>
                  <div className="space-y-4">
                    {order.items?.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center ml-3">
                            {item.product?.images?.[0] ? (
                              <img
                                src={
                                  item.product.images[0].url ||
                                  item.product.images[0]
                                }
                                alt={item.product.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.product?.title || "محصول"}
                            </p>
                            <div className="flex items-center mt-1 text-sm text-gray-600">
                              {item.color && (
                                <span className="ml-2">رنگ: {item.color}</span>
                              )}
                              {item.size && <span>سایز: {item.size}</span>}
                              <span className="mr-4">
                                تعداد: {item.quantity}
                              </span>
                            </div>
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <Store className="w-3 h-3 ml-1" />
                              <span>{item.store?.store_name || "فروشگاه"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-900">
                            {formatPrice(
                              (item.price_snapshot || item.price || 0) *
                                (item.quantity || 1)
                            )}
                          </p>
                          <p className="text-sm text-gray-500">
                            هر عدد:{" "}
                            {formatPrice(
                              item.price_snapshot || item.price || 0
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      جمع کل کالاها ({itemsCount} قلم)
                    </span>
                    <span className="text-gray-900">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">هزینه ارسال</span>
                    <span
                      className={
                        shipping === 0 ? "text-green-600" : "text-gray-900"
                      }
                    >
                      {shipping === 0 ? "رایگان" : formatPrice(shipping)}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">تخفیف</span>
                      <span className="text-green-600">
                        -{formatPrice(discount)}
                      </span>
                    </div>
                  )}

                  {order.coupon_discount > 0 && (
                    <div className="flex justify-between bg-green-50 p-3 rounded-lg">
                      <span className="text-green-700">تخفیف کد تخفیف</span>
                      <span className="text-green-700 font-medium">
                        -{formatPrice(order.coupon_discount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between pt-4 border-t border-gray-200">
                    <span className="text-lg font-semibold text-gray-900">
                      مبلغ قابل پرداخت
                    </span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping & Billing Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="w-5 h-5 ml-2" />
                  اطلاعات سفارش
                </h2>
              </div>

              <div className="p-6">
                {/* Customer Info */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <User className="w-4 h-4 ml-2" />
                    اطلاعات مشتری
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-900">
                      {order.shipping_address?.firstName ||
                        order.user?.first_name}{" "}
                      {order.shipping_address?.lastName ||
                        order.user?.last_name}
                    </p>
                    <p className="text-gray-600 mt-1">
                      {order.shipping_address?.phone || order.user?.phone}
                    </p>
                    {order.shipping_address?.email ||
                      (order.user?.email && (
                        <p className="text-gray-600 mt-1">
                          {order.shipping_address?.email || order.user?.email}
                        </p>
                      ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Truck className="w-4 h-4 ml-2" />
                    آدرس ارسال
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-900">آدرس:</p>
                    <p className="text-gray-600 mt-1">
                      {order.shipping_address?.address}
                    </p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <span className="ml-3">
                        {order.shipping_address?.city}
                      </span>
                      <span>کد پستی: {order.shipping_address?.postalCode}</span>
                    </div>
                    {order.shipping_note && (
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">یادداشت:</span>{" "}
                        {order.shipping_note}
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <CreditCard className="w-4 h-4 ml-2" />
                    اطلاعات پرداخت
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">روش پرداخت:</span>
                      <span className="font-medium text-gray-900">
                        {order.payment_method === "online"
                          ? "پرداخت آنلاین"
                          : order.payment_method === "cash"
                          ? "پرداخت در محل"
                          : order.payment_method === "wallet"
                          ? "کیف پول"
                          : order.payment_method}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">تاریخ سفارش:</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(order.created_at)}
                      </span>
                    </div>

                    {order.paid_at && (
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-600">تاریخ پرداخت:</span>
                        <span className="font-medium text-gray-900">
                          {formatDate(order.paid_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Continue Shopping */}
          <div className="mt-12 text-center">
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                از خرید خود راضی هستید؟
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                می‌توانید محصولات مشابه را مشاهده کنید یا به خرید خود ادامه
                دهید.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                مشاهده محصولات بیشتر
              </Link>

              <Link
                href="/"
                className="inline-flex items-center px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                بازگشت به صفحه اصلی
              </Link>
            </div>
          </div>

          {/* Support Info */}
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600 mb-4">نیاز به راهنمایی دارید؟</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center justify-center">
                <Phone className="w-4 h-4 text-gray-500 ml-2" />
                <span className="text-gray-700">۰۲۱-۱۲۳۴۵۶۷۸</span>
              </div>
              <div className="flex items-center justify-center">
                <Clock className="w-4 h-4 text-gray-500 ml-2" />
                <span className="text-gray-700">هر روز ۹ صبح تا ۹ شب</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
