// app/cart/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Heart,
  ArrowLeft,
  Truck,
  Shield,
  RefreshCw,
  Package,
  CreditCard,
  Percent,
  Tag,
  ArrowRight,
  Clock,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

const BASE_API = process.env.NEXT_PUBLIC_API_URL;

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState({});
  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      // Mock data - replace with actual API call
      const mockCartItems = [
        {
          id: 1,
          product_id: "TS001",
          name: "تیشرت مردانه تمام پنبه مشکی",
          price: 159000,
          original_price: 220000,
          quantity: 2,
          image:
            "https://i.pinimg.com/736x/0a/ea/2c/0aea2ce00406e84480e552597a8bea66.jpg",
          in_stock: true,
          max_quantity: 10,
          color: "مشکی",
          size: "L",
          seller: "فروشگاه پوشاک البرز",
          shipping_time: "۱-۲ روز کاری",
          free_shipping: true,
        },
        {
          id: 2,
          product_id: "CT002",
          name: "کاپشن مردانه زمستانه سرمه‌ای",
          price: 450000,
          original_price: 550000,
          quantity: 1,
          image:
            "https://i.pinimg.com/736x/0a/ea/2c/0aea2ce00406e84480e552597a8bea66.jpg",
          in_stock: true,
          max_quantity: 5,
          color: "سرمه‌ای",
          size: "XL",
          seller: "فروشگاه پوشاک زمستانی",
          shipping_time: "۲-۳ روز کاری",
          free_shipping: false,
          shipping_cost: 25000,
        },
        {
          id: 3,
          product_id: "PN003",
          name: "پیراهن مردانه رسمی سفید",
          price: 320000,
          original_price: 400000,
          quantity: 1,
          image:
            "https://i.pinimg.com/736x/0a/ea/2c/0aea2ce00406e84480e552597a8bea66.jpg",
          in_stock: false,
          max_quantity: 0,
          color: "سفید",
          size: "M",
          seller: "فروشگاه پوشاک رسمی",
          shipping_time: "ناموجود",
          free_shipping: true,
        },
        {
          id: 4,
          product_id: "SW004",
          name: "سویشرت مردانه ورزشی خاکستری",
          price: 280000,
          original_price: 350000,
          quantity: 3,
          image:
            "https://i.pinimg.com/736x/0a/ea/2c/0aea2ce00406e84480e552597a8bea66.jpg",
          in_stock: true,
          max_quantity: 8,
          color: "خاکستری",
          size: "L",
          seller: "فروشگاه ورزشی",
          shipping_time: "۲-۳ روز کاری",
          free_shipping: true,
        },
        {
          id: 5,
          product_id: "SH005",
          name: "شلوار جین مردانه آبی",
          price: 180000,
          original_price: 250000,
          quantity: 1,
          image:
            "https://i.pinimg.com/736x/0a/ea/2c/0aea2ce00406e84480e552597a8bea66.jpg",
          in_stock: true,
          max_quantity: 6,
          color: "آبی",
          size: "32",
          seller: "فروشگاه شلوار جین",
          shipping_time: "۱-۲ روز کاری",
          free_shipping: false,
          shipping_cost: 15000,
        },
      ];

      setCartItems(mockCartItems);
      // Select all in-stock items by default
      const inStockItems = mockCartItems
        .filter((item) => item.in_stock)
        .map((item) => item.id);
      setSelectedItems(inStockItems);
    } catch (error) {
      console.error("Cart fetch error:", error);
      toast.error("خطا در دریافت سبد خرید");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const selectedCartItems = cartItems.filter((item) =>
      selectedItems.includes(item.id)
    );

    const subtotal = selectedCartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = selectedCartItems.reduce((sum, item) => {
      if (item.free_shipping) return sum;
      return sum + (item.shipping_cost || 0);
    }, 0);
    const discount =
      selectedCartItems.reduce((sum, item) => {
        if (item.original_price > item.price) {
          return sum + (item.original_price - item.price) * item.quantity;
        }
        return sum;
      }, 0) + couponDiscount;

    const total = subtotal + shipping - discount;

    return {
      subtotal,
      shipping,
      discount,
      total,
      itemsCount: selectedCartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
      productsCount: selectedCartItems.length,
    };
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    const item = cartItems.find((item) => item.id === itemId);
    if (newQuantity > item.max_quantity) {
      toast.error(`حداکثر تعداد موجود: ${item.max_quantity}`);
      return;
    }

    setUpdatingItems((prev) => ({ ...prev, [itemId]: true }));

    try {
      // API call to update quantity
      // await fetch(`${BASE_API}/cart/update/${itemId}/`, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ quantity: newQuantity }),
      // });

      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );

      toast.success("تعداد به‌روزرسانی شد");
    } catch (error) {
      console.error("Quantity update error:", error);
      toast.error("خطا در به‌روزرسانی تعداد");
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!confirm("آیا از حذف این محصول از سبد خرید مطمئن هستید؟")) return;

    try {
      // API call to remove item
      // await fetch(`${BASE_API}/cart/remove/${itemId}/`, { method: "DELETE" });

      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      setSelectedItems((prev) => prev.filter((id) => id !== itemId));
      toast.success("محصول از سبد خرید حذف شد");
    } catch (error) {
      console.error("Remove item error:", error);
      toast.error("خطا در حذف محصول");
    }
  };

  const handleMoveToWishlist = async (itemId) => {
    try {
      // API call to move to wishlist
      // await fetch(`${BASE_API}/wishlist/add/${itemId}/`, { method: "POST" });

      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      setSelectedItems((prev) => prev.filter((id) => id !== itemId));
      toast.success("به لیست علاقه‌مندی‌ها منتقل شد");
    } catch (error) {
      console.error("Move to wishlist error:", error);
      toast.error("خطا در انتقال به علاقه‌مندی‌ها");
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("لطفا کد تخفیف را وارد کنید");
      return;
    }

    setApplyingCoupon(true);

    try {
      // API call to validate coupon
      // const response = await fetch(`${BASE_API}/coupons/validate/`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ code: couponCode }),
      // });

      // Mock success
      setTimeout(() => {
        setCouponApplied(true);
        setCouponDiscount(50000); // 50,000 Tomans discount
        toast.success("کد تخفیف با موفقیت اعمال شد");
      }, 1000);
    } catch (error) {
      console.error("Coupon apply error:", error);
      toast.error("کد تخفیف نامعتبر است");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponCode("");
    setCouponDiscount(0);
    toast.success("کد تخفیف حذف شد");
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    const inStockItems = cartItems
      .filter((item) => item.in_stock)
      .map((item) => item.id);

    if (selectedItems.length === inStockItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(inStockItems);
    }
  };

  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("لطفا حداقل یک محصول را انتخاب کنید");
      return;
    }

    // Save selected items to localStorage or context for checkout
    const selectedCartItems = cartItems.filter((item) =>
      selectedItems.includes(item.id)
    );
    localStorage.setItem("checkoutItems", JSON.stringify(selectedCartItems));

    router.push("/checkout");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
  };

  const handleImageError = (itemId) => {
    setImageErrors((prev) => ({
      ...prev,
      [itemId]: true,
    }));
  };

  const { subtotal, shipping, discount, total, itemsCount, productsCount } =
    calculateTotals();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          className: "font-vazirmatn",
          style: {
            fontFamily: "var(--font-vazirmatn), sans-serif",
            direction: "rtl",
          },
        }}
      />

      <div className="min-h-screen bg-gray-50 py-12 font-vazirmatn" dir="rtl">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">سبد خرید</h1>
                  <p className="text-gray-600 mt-1">
                    {cartItems.length} محصول در سبد خرید شما
                  </p>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                      ۱
                    </div>
                    <span className="mr-2 font-medium text-blue-600">
                      سبد خرید
                    </span>
                  </div>
                  <div className="w-16 h-0.5 bg-gray-300 mx-4"></div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center">
                      ۲
                    </div>
                    <span className="mr-2 text-gray-500">تکمیل اطلاعات</span>
                  </div>
                  <div className="w-16 h-0.5 bg-gray-300 mx-4"></div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center">
                      ۳
                    </div>
                    <span className="mr-2 text-gray-500">پرداخت</span>
                  </div>
                </div>
              </div>
            </div>

            {cartItems.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  سبد خرید شما خالی است
                </h2>
                <p className="text-gray-600 mb-8">
                  می‌توانید از بین هزاران محصول موجود، خرید خود را شروع کنید
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  شروع خرید
                  <ArrowRight className="w-4 h-4 mr-2" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Cart Items */}
                <div className="lg:col-span-2">
                  {/* Cart Header */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="select-all"
                          checked={
                            selectedItems.length ===
                            cartItems.filter((item) => item.in_stock).length
                          }
                          onChange={handleSelectAll}
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="select-all"
                          className="mr-3 font-medium text-gray-900"
                        >
                          انتخاب همه (
                          {cartItems.filter((item) => item.in_stock).length})
                        </label>
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedItems.length} محصول انتخاب شده
                      </div>
                    </div>
                  </div>

                  {/* Cart Items List */}
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-4 md:space-x-reverse">
                            {/* Selection Checkbox */}
                            <div className="flex items-start">
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(item.id)}
                                onChange={() => handleSelectItem(item.id)}
                                disabled={!item.in_stock}
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 mt-1"
                              />
                            </div>

                            {/* Product Image */}
                            <div className="w-36 h-full bg-red-300 overflow-hidden flex items-center justify-center flex-shrink-0 mx-4">
                              {imageErrors[item.id] ? (
                                <div className="flex flex-col items-center justify-center w-full h-full bg-gray-200">
                                  <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                                  <span className="text-xs text-gray-500">
                                    تصویر بارگذاری نشد
                                  </span>
                                </div>
                              ) : (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={() => handleImageError(item.id)}
                                />
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1">
                              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                                <div>
                                  <Link
                                    href={`/products/${item.product_id}`}
                                    className="font-medium text-gray-900 hover:text-blue-600 text-lg"
                                  >
                                    {item.name}
                                  </Link>

                                  {/* Product Attributes */}
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {item.color && (
                                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                        رنگ: {item.color}
                                      </span>
                                    )}
                                    {item.size && (
                                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                        سایز: {item.size}
                                      </span>
                                    )}
                                  </div>

                                  {/* Seller Info */}
                                  <div className="flex items-center mt-2 text-sm text-gray-600">
                                    <span>فروشنده: {item.seller}</span>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full mx-2"></div>
                                    <span className="flex items-center">
                                      <Clock className="w-3 h-3 ml-1" />
                                      ارسال: {item.shipping_time}
                                    </span>
                                    {item.free_shipping && (
                                      <span className="mr-3 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                        ارسال رایگان
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Price Info */}
                                <div className="mt-4 md:mt-0 text-left">
                                  <div className="flex items-center space-x-2 space-x-reverse">
                                    {item.original_price > item.price && (
                                      <span className="text-sm text-gray-500 line-through">
                                        {formatPrice(item.original_price)}
                                      </span>
                                    )}
                                    <span className="font-bold text-gray-900 text-lg">
                                      {formatPrice(item.price)}
                                    </span>
                                  </div>
                                  {item.original_price > item.price && (
                                    <div className="mt-1">
                                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                                        {Math.round(
                                          (1 -
                                            item.price / item.original_price) *
                                            100
                                        )}
                                        % تخفیف
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Stock Status */}
                              {!item.in_stock && (
                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                  <div className="flex items-center">
                                    <AlertCircle className="w-5 h-5 text-red-500 ml-2" />
                                    <span className="text-red-700">
                                      این محصول در حال حاضر موجود نیست
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                                {/* Quantity Controls */}
                                <div className="flex items-center">
                                  <button
                                    onClick={() =>
                                      handleQuantityChange(
                                        item.id,
                                        item.quantity - 1
                                      )
                                    }
                                    disabled={
                                      item.quantity <= 1 ||
                                      updatingItems[item.id]
                                    }
                                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <div className="w-16 h-10 flex items-center justify-center border-t border-b border-gray-300">
                                    {updatingItems[item.id] ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                    ) : (
                                      <span className="font-medium">
                                        {item.quantity}
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() =>
                                      handleQuantityChange(
                                        item.id,
                                        item.quantity + 1
                                      )
                                    }
                                    disabled={
                                      item.quantity >= item.max_quantity ||
                                      updatingItems[item.id]
                                    }
                                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                  <span className="mr-4 text-sm text-gray-500">
                                    موجودی: {item.max_quantity}
                                  </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center space-x-3 space-x-reverse">
                                  <button
                                    onClick={() =>
                                      handleMoveToWishlist(item.id)
                                    }
                                    className="flex items-center text-gray-600 hover:text-red-500 transition-colors"
                                  >
                                    <Heart className="w-5 h-5 ml-1" />
                                    ذخیره
                                  </button>
                                  <button
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="flex items-center text-gray-600 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 className="w-5 h-5 ml-1" />
                                    حذف
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">
                              جمع این محصول:
                            </span>
                            <span className="font-bold text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cart Tips */}
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-6">
                    <h3 className="font-medium text-blue-900 mb-3 flex items-center">
                      <Shield className="w-5 h-5 ml-2" />
                      نکات مهم خرید
                    </h3>
                    <ul className="space-y-2 text-blue-800 text-sm">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 ml-2"></div>
                        <span>قیمت‌ها شامل مالیات بر ارزش افزوده می‌شوند</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 ml-2"></div>
                        <span>
                          تا قبل از ارسال می‌توانید سفارش خود را ویرایش یا حذف
                          کنید
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 ml-2"></div>
                        <span>گارانتی ۷ روز بازگشت وجه برای تمام محصولات</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 ml-2"></div>
                        <span>
                          پشتیبانی ۲۴ ساعته برای پاسخگویی به سوالات شما
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Right Column - Order Summary */}
                <div className="space-y-6">
                  {/* Order Summary Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 sticky top-6">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">
                        خلاصه سفارش
                      </h2>
                    </div>

                    <div className="p-6">
                      {/* Items Count */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-600">تعداد کالاها</span>
                        <span className="font-medium text-gray-900">
                          {itemsCount} قلم ({productsCount} محصول)
                        </span>
                      </div>

                      {/* Price Breakdown */}
                      <div className="space-y-3 border-t border-gray-200 pt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">جمع کل کالاها</span>
                          <span className="text-gray-900">
                            {formatPrice(subtotal)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">هزینه ارسال</span>
                          <span
                            className={
                              shipping === 0
                                ? "text-green-600"
                                : "text-gray-900"
                            }
                          >
                            {shipping === 0 ? "رایگان" : formatPrice(shipping)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">تخفیف کالاها</span>
                          <span className="text-green-600">
                            -{formatPrice(discount - couponDiscount)}
                          </span>
                        </div>

                        {/* Coupon Section */}
                        {couponApplied ? (
                          <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                            <div className="flex items-center">
                              <Percent className="w-4 h-4 text-green-600 ml-1" />
                              <span className="text-green-700">کد تخفیف</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-green-700 font-medium">
                                -{formatPrice(couponDiscount)}
                              </span>
                              <button
                                onClick={handleRemoveCoupon}
                                className="mr-2 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="border-t border-gray-200 pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-gray-600 flex items-center">
                                <Tag className="w-4 h-4 ml-1" />
                                کد تخفیف
                              </span>
                              <button className="text-blue-600 hover:text-blue-700 text-sm">
                                کد دارم
                              </button>
                            </div>
                            <div className="flex">
                              <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                placeholder="کد تخفیف"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:border-transparent"
                              />
                              <button
                                onClick={handleApplyCoupon}
                                disabled={applyingCoupon || !couponCode.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-l-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {applyingCoupon ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  "اعمال"
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Total */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-gray-900">
                            مبلغ قابل پرداخت
                          </span>
                          <span className="text-2xl font-bold text-gray-900">
                            {formatPrice(total)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          هزینه نهایی پس از ثبت سفارش قابل پرداخت است
                        </p>
                      </div>

                      {/* Proceed to Checkout */}
                      <button
                        onClick={handleProceedToCheckout}
                        disabled={selectedItems.length === 0}
                        className="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        <CreditCard className="w-5 h-5 ml-2" />
                        ادامه فرآیند خرید
                      </button>

                      {/* Security Badges */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Shield className="w-5 h-5 text-green-600" />
                            </div>
                            <p className="text-xs text-gray-600">پرداخت امن</p>
                          </div>
                          <div className="text-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Truck className="w-5 h-5 text-blue-600" />
                            </div>
                            <p className="text-xs text-gray-600">ارسال سریع</p>
                          </div>
                          <div className="text-center">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Package className="w-5 h-5 text-purple-600" />
                            </div>
                            <p className="text-xs text-gray-600">بازگشت وجه</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Estimated Delivery */}
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center mb-4">
                      <Truck className="w-6 h-6 ml-2" />
                      <h3 className="font-semibold">تخمین زمان تحویل</h3>
                    </div>
                    <p className="text-sm mb-3">
                      سفارش شما پس از پرداخت، بین ۱ تا ۳ روز کاری تحویل داده
                      می‌شود.
                    </p>
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 ml-1" />
                      <span>ساعات کاری: شنبه تا پنجشنبه، ۹ صبح تا ۶ عصر</span>
                    </div>
                  </div>

                  {/* Need Help */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      نیاز به راهنمایی دارید؟
                    </h3>
                    <div className="space-y-3">
                      <Link
                        href="/faq"
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span>سوالات متداول</span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </Link>
                      <Link
                        href="/support"
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span>تماس با پشتیبانی</span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </Link>
                      <Link
                        href="/shipping"
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span>شرایط ارسال و بازگشت</span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recently Viewed */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  بازدیدهای اخیر
                </h2>
                <Link
                  href="/products"
                  className="text-blue-600 hover:text-blue-700 flex items-center"
                >
                  مشاهده همه
                  <ArrowRight className="w-4 h-4 mr-1" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                      <img
                        src="https://i.pinimg.com/736x/0a/ea/2c/0aea2ce00406e84480e552597a8bea66.jpg"
                        alt={`محصول ${i}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm text-gray-900 line-clamp-2">
                      محصول نمونه {i}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-gray-900">
                        ۱۵۹,۰۰۰ تومان
                      </span>
                      <button className="text-gray-400 hover:text-red-500">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
