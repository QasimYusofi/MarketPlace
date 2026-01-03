// components/orders/OrderTimeline.js
import { CheckCircle, Clock, Truck, Package, Home } from "lucide-react";

const timelineSteps = [
  {
    id: 1,
    status: "pending",
    icon: <Clock />,
    title: "در انتظار پرداخت",
    description: "سفارش ثبت شده",
  },
  {
    id: 2,
    status: "processing",
    icon: <Package />,
    title: "در حال پردازش",
    description: "در حال آماده‌سازی",
  },
  {
    id: 3,
    status: "shipped",
    icon: <Truck />,
    title: "ارسال شده",
    description: "مرسوله تحویل پست شد",
  },
  {
    id: 4,
    status: "delivered",
    icon: <Home />,
    title: "تحویل داده شده",
    description: "تحویل مشتری",
  },
];

export default function OrderTimeline({ status }) {
  const getStatusIndex = (status) => {
    const statusOrder = ["pending", "processing", "shipped", "delivered"];
    return statusOrder.indexOf(status);
  };

  const currentStep = getStatusIndex(status);

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

      <div className="space-y-8">
        {timelineSteps.map((step, index) => {
          const isCompleted = index <= currentStep;
          const isCurrent = index === currentStep;

          return (
            <div
              key={step.id}
              className="relative flex items-start space-x-4 space-x-reverse"
            >
              {/* Timeline dot */}
              <div className="relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isCurrent
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>
              </div>

              {/* Content */}
              <div
                className={`flex-1 pb-8 ${
                  index === timelineSteps.length - 1 ? "pb-0" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4
                    className={`font-medium ${
                      isCompleted
                        ? "text-green-700"
                        : isCurrent
                        ? "text-blue-700"
                        : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </h4>
                  {isCompleted && (
                    <span className="text-xs text-green-600">تکمیل شده</span>
                  )}
                  {isCurrent && (
                    <span className="text-xs text-blue-600">در حال انجام</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{step.description}</p>

                {/* Status-specific info */}
                {isCurrent && step.status === "shipped" && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      کد رهگیری: <span className="font-mono">TRK-789456</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
