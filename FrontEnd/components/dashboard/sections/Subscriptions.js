"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const subscriptionTypes = {
  basic: {
    name: "پایه",
    price: 49000,
    duration: "۱ ماه",
    features: ["مدیریت ۱ فروشگاه", "تا ۵۰ محصول", "پشتیبانی ایمیلی"],
  },
  premium: {
    name: "پریمیوم",
    price: 99000,
    duration: "۱ سال",
    features: [
      "مدیریت ۳ فروشگاه",
      "محصولات نامحدود",
      "پشتیبانی تلفنی",
      "آنالیز پیشرفته",
    ],
  },
  enterprise: {
    name: "شرکتی",
    price: 199000,
    duration: "۱ سال",
    features: [
      "فروشگاه‌های نامحدود",
      "محصولات نامحدود",
      "پشتیبانی ۲۴/۷",
      "API دسترسی",
      "گزارش‌های سفارشی",
    ],
  },
};

const statusColors = {
  active: "bg-green-100 text-green-800",
  expired: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const statusLabels = {
  active: "فعال",
  expired: "منقضی شده",
  cancelled: "لغو شده",
};

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState("");

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch("/api/subscriptions?user=me");
      const result = await response.json();

      if (result.success) {
        setSubscriptions(result.data);
      } else {
        toast.error("خطا در دریافت اشتراک‌ها");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (type) => {
    setIsPurchasing(type);
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, price: subscriptionTypes[type].price }),
      });

      const result = await response.json();

      if (result.success) {
        setSubscriptions((prev) => [result.data, ...prev]);
        toast.success("اشتراک با موفقیت فعال شد");
      } else {
        toast.error(result.message || "خطا در فعال‌سازی اشتراک");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsPurchasing("");
    }
  };

  const getActiveSubscription = () => {
    return subscriptions.find(
      (sub) => sub.status === "active" && new Date(sub.expiresAt) > new Date()
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">در حال بارگذاری...</div>
      </div>
    );
  }

  const activeSubscription = getActiveSubscription();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">تیک من - اشتراک‌ها</h1>
      </div>

      {/* Current Subscription Status */}
      {activeSubscription && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                اشتراک {subscriptionTypes[activeSubscription.type]?.name} شما
                فعال است
              </h2>
              <p className="text-gray-600 mt-1">
                اعتبار تا{" "}
                {new Date(activeSubscription.expiresAt).toLocaleDateString(
                  "fa-IR"
                )}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusColors.active}`}
              >
                {statusLabels.active}
              </span>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {activeSubscription.price.toLocaleString()} ریال
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Plans */}
      <div>
        <h2 className="text-lg font-semibold mb-4">پلن‌های اشتراک</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(subscriptionTypes).map(([key, plan]) => (
            <div
              key={key}
              className={`border rounded-lg p-6 ${
                activeSubscription?.type === key
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-gray-900">
                    {plan.price.toLocaleString()}
                  </span>
                  <span className="text-gray-600"> ریال</span>
                </div>
                <p className="text-gray-500 mt-1">{plan.duration}</p>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center space-x-2 space-x-reverse"
                  >
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePurchase(key)}
                disabled={
                  isPurchasing === key || activeSubscription?.type === key
                }
                className={`w-full mt-6 px-4 py-2 rounded-md font-semibold ${
                  activeSubscription?.type === key
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isPurchasing === key
                  ? "در حال پرداخت..."
                  : activeSubscription?.type === key
                  ? "فعال"
                  : "خرید اشتراک"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">تاریخچه اشتراک‌ها</h2>

        {subscriptions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>هنوز اشتراکی خریداری نکرده‌اید.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نوع اشتراک
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    مبلغ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاریخ شروع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاریخ انقضا
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    وضعیت
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.map((subscription) => (
                  <tr key={subscription._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {subscriptionTypes[subscription.type]?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subscription.price.toLocaleString()} ریال
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(subscription.startedAt).toLocaleDateString(
                        "fa-IR"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(subscription.expiresAt).toLocaleDateString(
                        "fa-IR"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[subscription.status]
                        }`}
                      >
                        {statusLabels[subscription.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
