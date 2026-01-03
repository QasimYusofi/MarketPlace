"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels = {
  pending: "در انتظار پرداخت",
  paid: "پرداخت شده",
  shipped: "ارسال شده",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders?user=me");
      const result = await response.json();

      if (result.success) {
        setOrders(result.data);
      } else {
        toast.error("خطا در دریافت سفارشات");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  const getProductImage = (product) => {
    if (product.productId?.images?.length > 0) {
      const primaryImage =
        product.productId.images.find((img) => img.isPrimary) ||
        product.productId.images[0];
      return `data:${
        primaryImage.contentType
      };base64,${primaryImage.data.toString("base64")}`;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">سفارشات من</h1>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-500 text-lg">
            هنوز سفارشی ثبت نکرده‌اید.
          </div>
          <p className="text-gray-400 mt-2">
            پس از خرید، سفارشات شما در اینجا نمایش داده می‌شوند.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    شماره سفارش
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    فروشگاه
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    مبلغ کل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    وضعیت
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاریخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order._id.toString().slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.storeId?.name || "فروشگاه"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.totalAmount.toLocaleString()} ریال
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[order.status]
                        }`}
                      >
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        مشاهده جزئیات
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  سفارش #{selectedOrder._id.toString().slice(-8)}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">محصولات</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 space-x-reverse border border-gray-200 rounded-lg p-3"
                      >
                        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                          {getProductImage(item) ? (
                            <img
                              src={getProductImage(item)}
                              alt={item.title}
                              className="w-16 h-16 rounded object-cover"
                            />
                          ) : (
                            <span className="text-gray-400">📦</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {item.title}
                          </h4>
                          <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500 mt-1">
                            <span>تعداد: {item.quantity}</span>
                            <span>
                              قیمت: {item.price.toLocaleString()} ریال
                            </span>
                          </div>
                        </div>
                        <div className="text-left font-semibold">
                          {(item.price * item.quantity).toLocaleString()} ریال
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>مبلغ کل:</span>
                      <span>
                        {selectedOrder.totalAmount.toLocaleString()} ریال
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">اطلاعات سفارش</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        وضعیت سفارش
                      </label>
                      <div className="mt-1">
                        <span
                          className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                            statusColors[selectedOrder.status]
                          }`}
                        >
                          {statusLabels[selectedOrder.status]}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        روش پرداخت
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedOrder.paymentMethod}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        تاریخ سفارش
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedOrder.createdAt).toLocaleDateString(
                          "fa-IR"
                        )}
                      </p>
                    </div>

                    {selectedOrder.trackingNumber && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          شماره پیگیری
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedOrder.trackingNumber}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        آدرس ارسال
                      </label>
                      <div className="mt-1 text-sm text-gray-900">
                        {selectedOrder.shippingAddress && (
                          <>
                            <p>
                              {selectedOrder.shippingAddress.firstName}{" "}
                              {selectedOrder.shippingAddress.lastName}
                            </p>
                            <p>{selectedOrder.shippingAddress.address}</p>
                            <p>
                              {selectedOrder.shippingAddress.city} -{" "}
                              {selectedOrder.shippingAddress.postalCode}
                            </p>
                            <p>تلفن: {selectedOrder.shippingAddress.phone}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3 space-x-reverse">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
