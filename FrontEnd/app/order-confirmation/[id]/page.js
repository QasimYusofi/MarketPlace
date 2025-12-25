/* eslint-disable react-hooks/set-state-in-effect */
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
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch order details from API using params.id
    // For now, show mock data
    const mockOrder = {
      id: params.id || "ORD-123456",
      order_number: "123456",
      date: "۱۴۰۲/۱۱/۲۵",
      time: "۱۴:۳۰",
      status: "processing",
      estimated_delivery: "۱۴۰۲/۱۱/۲۷",
      items: [
        { name: "تیشرت مردانه مشکی", quantity: 2, price: "۱۵۹,۰۰۰ تومان" },
        { name: "کفش ورزشی نایک", quantity: 1, price: "۴۵۰,۰۰۰ تومان" },
      ],
      subtotal: "۷۶۸,۰۰۰ تومان",
      shipping: "رایگان",
      discount: "۶۱,۰۰۰ تومان",
      total: "۷۰۷,۰۰۰ تومان",
      shipping_address: "تهران، خیابان ولیعصر، پلاک ۱۲۳",
      payment_method: "پرداخت آنلاین",
      tracking_number: "TRK-789456123",
      customer_email: "customer@example.com",
      customer_phone: "09123456789",
    };

    setOrder(mockOrder);
    setLoading(false);
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const orderUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(orderUrl);
      toast.success("لینک سفارش کپی شد");
    } catch (error) {
      toast.error("خطا در کپی لینک");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 font-vazirmatn" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              سفارش شما با موفقیت ثبت شد!
            </h1>
            <p className="text-gray-600">
              شماره سفارش:{" "}
              <span className="font-bold text-blue-600">
                {order.order_number}
              </span>
            </p>
            <p className="text-gray-600 mt-1">
              یک ایمیل تأیید به آدرس {order.customer_email} ارسال شد.
            </p>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              وضعیت سفارش
            </h2>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-gray-900">ثبت شده</p>
                <p className="text-xs text-gray-500">{order.date}</p>
              </div>
              <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                  <Package className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-gray-900">
                  در حال پردازش
                </p>
                <p className="text-xs text-gray-500">امروز</p>
              </div>
              <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Truck className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-gray-500">ارسال</p>
                <p className="text-xs text-gray-500">
                  {order.estimated_delivery}
                </p>
              </div>
              <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Home className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-gray-500">تحویل</p>
                <p className="text-xs text-gray-500">—</p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              مراحل بعدی
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center ml-3">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">تأیید ایمیل</p>
                  <p className="text-sm text-blue-700">
                    لینک تأیید به ایمیل شما ارسال شد
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center ml-3">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">پیگیری سفارش</p>
                  <p className="text-sm text-blue-700">
                    می‌توانید سفارش خود را از پنل کاربری پیگیری کنید
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center p-4 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Printer className="w-5 h-5 ml-2 text-gray-600" />
              چاپ فاکتور
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center p-4 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-5 h-5 ml-2 text-gray-600" />
              اشتراک‌گذاری
            </button>
            <Link
              href="/user/dashboard/orders"
              className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <ShoppingBag className="w-5 h-5 ml-2" />
              مشاهده سفارشات
            </Link>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                خلاصه سفارش
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">جمع کل کالاها</span>
                  <span className="text-gray-900">{order.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">هزینه ارسال</span>
                  <span className="text-gray-900">{order.shipping}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">تخفیف</span>
                  <span className="text-green-600">-{order.discount}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">
                    مبلغ قابل پرداخت
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    {order.total}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                اطلاعات ارسال
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-600">آدرس</p>
                  <p className="text-gray-900">{order.shipping_address}</p>
                </div>
                <div className="flex justify-between">
                  <div>
                    <p className="text-gray-600">روش پرداخت</p>
                    <p className="text-gray-900">{order.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">کد رهگیری</p>
                    <p className="text-gray-900 font-mono">
                      {order.tracking_number}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Continue Shopping */}
          <div className="mt-8 text-center">
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              ادامه خرید
              <ArrowRight className="w-5 h-5 mr-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
