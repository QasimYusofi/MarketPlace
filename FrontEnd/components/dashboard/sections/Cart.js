"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function Cart() {
  const [cart, setCart] = useState({ items: [], subtotal: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart");
      const result = await response.json();

      if (result.success) {
        setCart(result.data);
      } else {
        toast.error("خطا در دریافت سبد خرید");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: newQuantity,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCart(result.data);
        toast.success("تعداد محصول به‌روزرسانی شد");
      } else {
        toast.error(result.message || "خطا در به‌روزرسانی سبد خرید");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await fetch(`/api/cart?productId=${productId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setCart(result.data);
        toast.success("محصول از سبد خرید حذف شد");
      } else {
        toast.error(result.message || "خطا در حذف از سبد خرید");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    }
  };

  const handleCheckout = async () => {
    if (cart.items.length === 0) {
      toast.error("سبد خرید شما خالی است");
      return;
    }

    setIsCheckingOut(true);
    try {
      // In a real application, you would integrate with a payment gateway
      // For now, we'll create an order directly
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId: cart.items[0].productId.storeId, // Assuming all items from same store
          items: cart.items.map((item) => ({
            productId: item.productId._id,
            quantity: item.quantity,
          })),
          shippingAddress: {
            // You would get this from user profile or form
            firstName: "کاربر",
            lastName: "نمونه",
            address: "آدرس نمونه",
            city: "تهران",
            postalCode: "1234567890",
            phone: "09123456789",
          },
          paymentMethod: "آنلاین",
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Clear cart after successful order
        await fetch("/api/cart", { method: "DELETE" });
        setCart({ items: [], subtotal: 0, total: 0 });
        toast.success("سفارش با موفقیت ثبت شد");
      } else {
        toast.error(result.message || "خطا در ثبت سفارش");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const getProductImage = (product) => {
    if (product.images?.length > 0) {
      const primaryImage =
        product.images.find((img) => img.isPrimary) || product.images[0];
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
        <h1 className="text-2xl font-bold text-gray-900">سبد خرید</h1>
      </div>

      {cart.items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-500 text-lg">سبد خرید شما خالی است.</div>
          <p className="text-gray-400 mt-2">
            محصولاتی که به سبد خرید اضافه کنید در اینجا نمایش داده می‌شوند.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold">
                  محصولات ({cart.items.length})
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <div key={item._id} className="p-6">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        {getProductImage(item.productId) ? (
                          <img
                            src={getProductImage(item.productId)}
                            alt={item.productId.title}
                            className="w-20 h-20 rounded object-cover"
                          />
                        ) : (
                          <span className="text-gray-400">📦</span>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {item.productId.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {item.priceSnapshot.toLocaleString()} ریال
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId._id,
                                item.quantity - 1
                              )
                            }
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 12H4"
                              />
                            </svg>
                          </button>

                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId._id,
                                item.quantity + 1
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Price and Remove */}
                      <div className="text-left">
                        <div className="text-lg font-bold text-gray-900 mb-2">
                          {(
                            item.priceSnapshot * item.quantity
                          ).toLocaleString()}{" "}
                          ریال
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId._id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4">خلاصه سفارش</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>جمع کل:</span>
                  <span>{cart.subtotal.toLocaleString()} ریال</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>هزینه ارسال:</span>
                  <span>۰ ریال</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>مالیات:</span>
                  <span>۰ ریال</span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>مبلغ قابل پرداخت:</span>
                    <span>{cart.total.toLocaleString()} ریال</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || cart.items.length === 0}
                className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCheckingOut ? "در حال پرداخت..." : "پرداخت و ثبت سفارش"}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                با کلیک بر روی دکمه پرداخت، قوانین و شرایط را پذیرفته‌اید.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
