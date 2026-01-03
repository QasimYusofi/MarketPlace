// app/user/dashboard/orders/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
} from "lucide-react";
import OrderTimeline from "@/components/orders/OrderTimeline";

const BASE_API = process.env.NEXT_PUBLIC_API_URL;

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchOrderDetails();
  }, [params.id]);

  const fetchOrderDetails = async () => {
    // Mock data - replace with actual API call
    const mockOrder = {
      id: params.id,
      order_number: "12345",
      date: "۱۴۰۲/۱۱/۲۰",
      time: "۱۴:۳۰",
      status: "delivered",
      items: [
        {
          id: 1,
          name: "تیشرت مردانه مشکی",
          quantity: 2,
          price: "۷۵,۰۰۰ تومان",
          total: "۱۵۰,۰۰۰ تومان",
          image: "/api/placeholder/80/80",
        },
        {
          id: 2,
          name: "شلوار جین آبی",
          quantity: 1,
          price: "۱۰۰,۰۰۰ تومان",
          total: "۱۰۰,۰۰۰ تومان",
          image: "/api/placeholder/80/80",
        },
      ],
      subtotal: "۲۵۰,۰۰۰ تومان",
      shipping: "۳۰,۰۰۰ تومان",
      discount: "۲۰,۰۰۰ تومان",
      total: "۲۶۰,۰۰۰ تومان",
      shipping_address: {
        name: "علی محمدی",
        address: "تهران، خیابان ولیعصر، پلاک ۱۲۳، طبقه ۲",
        city: "تهران",
        postal_code: "1234567890",
        phone: "09123456789",
      },
      billing_address: {
        name: "علی محمدی",
        address: "تهران، خیابان ولیعصر، پلاک ۱۲۳، طبقه ۲",
        city: "تهران",
        postal_code: "1234567890",
      },
      payment_method: {
        type: "آنلاین",
        transaction_id: "TX-789456123",
        status: "موفق",
      },
      shipping_method: {
        name: "پست پیشتاز",
        estimated_delivery: "۱۴۰۲/۱۱/۲۲",
        tracking_number: "TRK-789456",
        tracking_url: "https://tracking.post.ir",
      },
      customer_notes: "لطفا بسته را بعد از ساعت ۱۶ تحویل دهید.",
    };

    setOrder(mockOrder);
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleContactSupport = () => {
    router.push("/user/dashboard/support/new");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Link
              href="/user/dashboard/orders"
              className="text-gray-500 hover:text-gray-700"
            >
              سفارشات
            </Link>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <h1 className="text-2xl font-bold text-gray-900">
              سفارش #{order.order_number}
            </h1>
          </div>
          <p className="text-gray-600 mt-1">
            ثبت شده در {order.date} ساعت {order.time}
          </p>
        </div>
        <div className="flex space-x-3 space-x-reverse mt-4 md:mt-0">
          <button
            onClick={handleContactSupport}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <MessageSquare className="w-4 h-4 ml-2" />
            پشتیبانی
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Printer className="w-4 h-4 ml-2" />
            چاپ فاکتور
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
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                تحویل داده شده
              </div>
            </div>
            <OrderTimeline status={order.status} />
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                اقلام سفارش
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          تعداد: {item.quantity}
                        </p>
                        <p className="text-sm text-gray-500">
                          قیمت واحد: {item.price}
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900">{item.total}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                خلاصه سفارش
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">جمع کل اقلام</span>
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
          </div>
        </div>

        {/* Right Column - Shipping & Payment Info */}
        <div className="space-y-6">
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
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    نام تحویل گیرنده
                  </label>
                  <p className="text-gray-900">{order.shipping_address.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center">
                    <MapPin className="w-4 h-4 ml-1" />
                    آدرس
                  </label>
                  <p className="text-gray-900">
                    {order.shipping_address.address}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {order.shipping_address.city} - کد پستی:{" "}
                    {order.shipping_address.postal_code}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center">
                    <Phone className="w-4 h-4 ml-1" />
                    شماره تماس
                  </label>
                  <p className="text-gray-900">
                    {order.shipping_address.phone}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    روش ارسال
                  </label>
                  <p className="text-gray-900">{order.shipping_method.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    کد رهگیری: {order.shipping_method.tracking_number}
                  </p>
                  {order.shipping_method.tracking_url && (
                    <a
                      href={order.shipping_method.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm mt-2"
                    >
                      پیگیری مرسوله
                      <ArrowRight className="w-3 h-3 mr-1" />
                    </a>
                  )}
                </div>
                {order.customer_notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      یادداشت مشتری
                    </label>
                    <p className="text-gray-900 bg-yellow-50 p-3 rounded-lg">
                      {order.customer_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <CreditCard className="w-5 h-5 ml-2" />
                اطلاعات پرداخت
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    روش پرداخت
                  </label>
                  <p className="text-gray-900">{order.payment_method.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    شناسه تراکنش
                  </label>
                  <p className="text-gray-900 font-mono">
                    {order.payment_method.transaction_id}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    وضعیت پرداخت
                  </label>
                  <p className="text-green-600 font-medium flex items-center">
                    <CheckCircle className="w-4 h-4 ml-1" />
                    {order.payment_method.status}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                آدرس صورتحساب
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                <p className="text-gray-900">{order.billing_address.name}</p>
                <p className="text-gray-900">{order.billing_address.address}</p>
                <p className="text-sm text-gray-500">
                  {order.billing_address.city} - کد پستی:{" "}
                  {order.billing_address.postal_code}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                  <Download className="w-4 h-4 ml-2" />
                  دانلود فاکتور
                </button>
                <button
                  onClick={handleContactSupport}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <MessageSquare className="w-4 h-4 ml-2" />
                  تماس با پشتیبانی
                </button>
                <Link
                  href={`/products?order=${order.id}`}
                  className="w-full px-4 py-3 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
                >
                  خرید مجدد
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
