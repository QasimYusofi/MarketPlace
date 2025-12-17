// components/dashboard/ActivityTimeline.js
"use client";

import {
  CheckCircle,
  ShoppingBag,
  Star,
  MapPin,
  CreditCard,
  MessageSquare,
} from "lucide-react";

const activities = [
  {
    id: 1,
    type: "order",
    title: "سفارش جدید ثبت شد",
    description: "سفارش #ORD-12345 با موفقیت ثبت شد",
    time: "۲ ساعت پیش",
    icon: <ShoppingBag className="w-4 h-4" />,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 2,
    type: "review",
    title: "نظر جدید ثبت کردید",
    description: "برای محصول 'تیشرت مردانه' نظر ثبت کردید",
    time: "۱ روز پیش",
    icon: <Star className="w-4 h-4" />,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    id: 3,
    type: "address",
    title: "آدرس جدید اضافه شد",
    description: "آدرس جدید در تهران اضافه کردید",
    time: "۲ روز پیش",
    icon: <MapPin className="w-4 h-4" />,
    color: "bg-green-100 text-green-600",
  },
  {
    id: 4,
    type: "payment",
    title: "کارت بانکی اضافه شد",
    description: "کارت بانکی جدید به حساب اضافه شد",
    time: "۳ روز پیش",
    icon: <CreditCard className="w-4 h-4" />,
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: 5,
    type: "support",
    title: "تیکت پشتیبانی ایجاد شد",
    description: "تیکت جدید برای پشتیبانی ایجاد کردید",
    time: "۴ روز پیش",
    icon: <MessageSquare className="w-4 h-4" />,
    color: "bg-red-100 text-red-600",
  },
];

export default function ActivityTimeline() {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute right-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>

      <div className="space-y-6">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className="relative flex items-start space-x-4 space-x-reverse"
          >
            {/* Timeline dot */}
            <div className="relative">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center ${activity.color}`}
              >
                {activity.icon}
              </div>
              {index < activities.length - 1 && (
                <div className="absolute top-7 right-3 bottom-0 w-0.5 bg-gray-200"></div>
              )}
            </div>

            {/* Activity content */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">
                  {activity.title}
                </h4>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {activity.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
