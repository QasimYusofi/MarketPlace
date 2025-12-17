// app/user/dashboard/orders/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
} from "lucide-react";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import Pagination from "@/components/ui/Pagination";

const BASE_API = process.env.NEXT_PUBLIC_API_URL;

const statusFilters = [
  { id: "all", label: "همه سفارشات", color: "bg-gray-100" },
  {
    id: "pending",
    label: "در انتظار پرداخت",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    id: "processing",
    label: "در حال پردازش",
    color: "bg-blue-100 text-blue-800",
  },
  { id: "shipped", label: "ارسال شده", color: "bg-purple-100 text-purple-800" },
  {
    id: "delivered",
    label: "تحویل داده شده",
    color: "bg-green-100 text-green-800",
  },
  { id: "cancelled", label: "لغو شده", color: "bg-red-100 text-red-800" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    const token = localStorage.getItem("accessToken");

    try {
      // Mock data - replace with actual API call
      const mockOrders = [
        {
          id: "ORD-12345",
          order_number: "12345",
          date: "۱۴۰۲/۱۱/۲۰",
          total: "۲۵۰,۰۰۰ تومان",
          status: "delivered",
          items: [
            { name: "تیشرت مردانه مشکی", quantity: 2, price: "۷۵,۰۰۰ تومان" },
            { name: "شلوار جین آبی", quantity: 1, price: "۱۰۰,۰۰۰ تومان" },
          ],
          shipping_address: "تهران، خیابان ولیعصر، پلاک ۱۲۳",
          payment_method: "آنلاین",
          tracking_number: "TRK-789456",
        },
        {
          id: "ORD-12346",
          order_number: "12346",
          date: "۱۴۰۲/۱۱/۱۹",
          total: "۱۸۰,۰۰۰ تومان",
          status: "shipped",
          items: [
            { name: "کیف چرمی مردانه", quantity: 1, price: "۱۸۰,۰۰۰ تومان" },
          ],
          shipping_address: "مشهد، بلوار وکیل آباد",
          payment_method: "کارت به کارت",
          tracking_number: "TRK-789457",
        },
        {
          id: "ORD-12347",
          order_number: "12347",
          date: "۱۴۰۲/۱۱/۱۸",
          total: "۴۵۰,۰۰۰ تومان",
          status: "processing",
          items: [
            { name: "کفش ورزشی", quantity: 1, price: "۲۵۰,۰۰۰ تومان" },
            { name: "لباس ورزشی", quantity: 1, price: "۱۵۰,۰۰۰ تومان" },
            { name: "کلاه بیسبال", quantity: 1, price: "۵۰,۰۰۰ تومان" },
          ],
          shipping_address: "اصفهان، خیابان چهارباغ",
          payment_method: "آنلاین",
          tracking_number: "TRK-789458",
        },
        {
          id: "ORD-12348",
          order_number: "12348",
          date: "۱۴۰۲/۱۱/۱۷",
          total: "۱۲۰,۰۰۰ تومان",
          status: "pending",
          items: [
            { name: "کتاب برنامه‌نویسی", quantity: 1, price: "۱۲۰,۰۰۰ تومان" },
          ],
          shipping_address: "تبریز، میدان ساعت",
          payment_method: "در محل",
          tracking_number: null,
        },
        {
          id: "ORD-12349",
          order_number: "12349",
          date: "۱۴۰۲/۱۱/۱۶",
          total: "۳۲۰,۰۰۰ تومان",
          status: "delivered",
          items: [
            { name: "هدفون بی‌سیم", quantity: 1, price: "۲۲۰,۰۰۰ تومان" },
            { name: "کیف گوشی", quantity: 1, price: "۱۰۰,۰۰۰ تومان" },
          ],
          shipping_address: "شیراز، خیابان زند",
          payment_method: "آنلاین",
          tracking_number: "TRK-789459",
        },
      ];

      // Apply filters
      let filteredOrders = mockOrders;

      if (statusFilter !== "all") {
        filteredOrders = mockOrders.filter(
          (order) => order.status === statusFilter
        );
      }

      if (searchQuery) {
        filteredOrders = filteredOrders.filter(
          (order) =>
            order.order_number
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            order.tracking_number
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase())
        );
      }

      setOrders(filteredOrders);
      setTotalPages(Math.ceil(filteredOrders.length / 10));
    } catch (error) {
      console.error("Orders fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (filterId) => {
    setStatusFilter(filterId);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchOrders();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">سفارشات من</h1>
          <p className="text-gray-600 mt-1">مدیریت و پیگیری سفارشات شما</p>
        </div>
        <div className="flex space-x-3 space-x-reverse mt-4 md:mt-0">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <RefreshCw className="w-4 h-4 ml-2" />
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
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="جستجو بر اساس شماره سفارش یا کد رهگیری..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">فیلتر بر اساس:</span>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {statusFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleFilterChange(filter.id)}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                filter.id === statusFilter
                  ? `${filter.color} font-medium`
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              سفارشی یافت نشد
            </h3>
            <p className="text-gray-500 mb-6">شما هنوز سفارشی ثبت نکرده‌اید</p>
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              شروع خرید
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      شماره سفارش
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      تاریخ
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      مبلغ کل
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      وضعیت
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      کد رهگیری
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.order_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.date}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {order.total}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.tracking_number || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <Link
                            href={`/user/dashboard/orders/${order.id}`}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Eye className="w-4 h-4 ml-1" />
                            مشاهده
                          </Link>
                          <button className="text-gray-600 hover:text-gray-900 flex items-center">
                            <Download className="w-4 h-4 ml-1" />
                            فاکتور
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="border-t border-gray-200 px-6 py-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">کل سفارشات</p>
              <p className="text-2xl font-bold mt-1">۱۲</p>
            </div>
            <Package className="w-8 h-8 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">تحویل شده</p>
              <p className="text-2xl font-bold mt-1">۸</p>
            </div>
            <CheckCircle className="w-8 h-8 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">در انتظار</p>
              <p className="text-2xl font-bold mt-1">۲</p>
            </div>
            <Clock className="w-8 h-8 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">در حال ارسال</p>
              <p className="text-2xl font-bold mt-1">۲</p>
            </div>
            <Truck className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </div>
    </div>
  );
}
