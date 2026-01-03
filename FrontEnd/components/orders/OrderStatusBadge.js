// components/orders/OrderStatusBadge.js
import { CheckCircle, Clock, Truck, XCircle, Package } from "lucide-react";

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

export default function OrderStatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs flex items-center w-fit ${config.color}`}
    >
      <span className="ml-1">{config.icon}</span>
      {config.text}
    </span>
  );
}
