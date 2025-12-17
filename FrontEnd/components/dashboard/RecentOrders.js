// components/dashboard/RecentOrders.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, CheckCircle, Clock, Truck, XCircle } from "lucide-react";

const statusConfig = {
  pending: {
    color: "bg-yellow-100 text-yellow-800",
    icon: <Clock className="w-4 h-4" />,
    text: "در انتظار پرداخت",
  },
  processing: {
    color: "bg-blue-100 text-blue-800",
    icon: <Package className="w-4 h-4" />,
    text: "در حال پردازش",
  },
  shipped: {
    color: "bg-purple-100 text-purple-800",
    icon: <Truck className="w-4 h-4" />,
    text: "ارسال شده",
  },
  delivered: {
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="w-4 h-4" />,
    text: "تحویل داده شده",
  },
  cancelled: {
    color: "bg-red-100 text-red-800",
    icon: <XCircle className="w-4 h-4" />,
    text: "لغو شده",
  },
};

export default function RecentOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockOrders = [
      {
        id: "ORD-12345",
        date: "۱۴۰۲/۱۱/۲۰",
        total: "۲۵۰,۰۰۰ تومان",
        status: "delivered",
        items: 3,
      },
      {
        id: "ORD-12346",
        date: "۱۴۰۲/۱۱/۱۹",
        total: "۱۸۰,۰۰۰ تومان",
        status: "shipped",
        items: 2,
      },
      {
        id: "ORD-12347",
        date: "۱۴۰۲/۱۱/۱۸",
        total: "۴۵۰,۰۰۰ تومان",
        status: "processing",
        items: 5,
      },
      {
        id: "ORD-12348",
        date: "۱۴۰۲/۱۱/۱۷",
        total: "۱۲۰,۰۰۰ تومان",
        status: "pending",
        items: 1,
      },
      {
        id: "ORD-12349",
        date: "۱۴۰۲/۱۱/۱۶",
        total: "۳۲۰,۰۰۰ تومان",
        status: "delivered",
        items: 4,
      },
    ];

    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div
          key={order.id}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{order.id}</p>
              <p className="text-sm text-gray-500 mt-1">
                {order.date} • {order.items} قلم
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 space-x-reverse">
            <div>
              <p className="font-bold text-gray-900">{order.total}</p>
            </div>
            <div className="flex items-center">
              <span
                className={`px-3 py-1 rounded-full text-xs flex items-center ${
                  statusConfig[order.status].color
                }`}
              >
                <span className="ml-1">{statusConfig[order.status].icon}</span>
                {statusConfig[order.status].text}
              </span>
            </div>
            <Link
              href={`/user/dashboard/orders/${order.id}`}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              جزئیات
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
