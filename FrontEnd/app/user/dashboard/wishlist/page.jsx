// app/user/dashboard/wishlist/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Share2,
  Eye,
  TrendingUp,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";

const BASE_API = process.env.NEXT_PUBLIC_API_URL;

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    const fetchWishlist = async () => {
      // Mock data for clothing products
      const mockItems = [
        {
          id: 1,
          product_id: "TS001",
          name: "تیشرت مردانه تمام پنبه - مشکی",
          price: "۱۵۹,۰۰۰ تومان",
          original_price: "۲۲۰,۰۰۰ تومان",
          discount: "۲۸٪",
          image:
            "https://i.pinimg.com/736x/0a/ea/2c/0aea2ce00406e84480e552597a8bea66.jpg",
          in_stock: true,
          category: "تیشرت",
          rating: 4.5,
          reviews: 128,
          sizes: ["S", "M", "L", "XL"],
          colors: ["مشکی", "سفید", "آبی"],
        },
        {
          id: 2,
          product_id: "CT002",
          name: "کاپشن مردانه زمستانه - سرمه‌ای",
          price: "۴۵۰,۰۰۰ تومان",
          original_price: "۵۵۰,۰۰۰ تومان",
          discount: "۱۸٪",
          image:
            "https://i.pinimg.com/736x/0a/ea/2c/0aea2ce00406e84480e552597a8bea66.jpg",
          in_stock: true,
          category: "کاپشن",
          rating: 4.8,
          reviews: 89,
          sizes: ["M", "L", "XL", "2XL"],
          colors: ["سرمه‌ای", "مشکی", "خاکستری"],
        },
        {
          id: 3,
          product_id: "PN003",
          name: "پیراهن مردانه رسمی - سفید",
          price: "۳۲۰,۰۰۰ تومان",
          original_price: "۴۰۰,۰۰۰ تومان",
          discount: "۲۰٪",
          image:
            "https://i.pinimg.com/736x/0a/ea/2c/0aea2ce00406e84480e552597a8bea66.jpg",
          in_stock: false,
          category: "پیراهن",
          rating: 4.3,
          reviews: 204,
          sizes: ["S", "M", "L"],
          colors: ["سفید", "آبی", "صورتی"],
        },
        {
          id: 4,
          product_id: "SW004",
          name: "سویشرت مردانه ورزشی - خاکستری",
          price: "۲۸۰,۰۰۰ تومان",
          original_price: "۳۵۰,۰۰۰ تومان",
          discount: "۲۰٪",
          image:
            "https://i.pinimg.com/736x/0a/ea/2c/0aea2ce00406e84480e552597a8bea66.jpg",
          in_stock: true,
          category: "سویشرت",
          rating: 4.6,
          reviews: 156,
          sizes: ["M", "L", "XL"],
          colors: ["خاکستری", "مشکی", "آبی"],
        },
        {
          id: 5,
          product_id: "SH005",
          name: "شلوار جین مردانه - آبی",
          price: "۱۸۰,۰۰۰ تومان",
          original_price: "۲۵۰,۰۰۰ تومان",
          discount: "۲۸٪",
          image:
            "https://i.pinimg.com/736x/0a/ea/2c/0aea2ce00406e84480e552597a8bea66.jpg",
          in_stock: true,
          category: "شلوار",
          rating: 4.4,
          reviews: 92,
          sizes: ["30", "32", "34", "36"],
          colors: ["آبی", "مشکی", "خاکستری"],
        },
        {
          id: 6,
          product_id: "HD006",
          name: "هودی مردانه پنبه‌ای - مشکی",
          price: "۲۱۰,۰۰۰ تومان",
          original_price: "۲۸۰,۰۰۰ تومان",
          discount: "۲۵٪",
          image:
            "https://i.pinimg.com/736x/0a/ea/2c/0aea2ce00406e84480e552597a8bea66.jpg",
          in_stock: true,
          category: "هودی",
          rating: 4.7,
          reviews: 115,
          sizes: ["S", "M", "L", "XL"],
          colors: ["مشکی", "خاکستری", "سفید"],
        },
      ];

      setWishlistItems(mockItems);
      setLoading(false);
    };

    fetchWishlist();
  }, []);

  const handleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === wishlistItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistItems.map((item) => item.id));
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      // API call to remove from wishlist
      setWishlistItems((prev) => prev.filter((item) => item.id !== id));
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
      toast.success("از لیست علاقه‌مندی حذف شد");
    } catch (error) {
      toast.error("خطا در حذف از علاقه‌مندی");
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedItems.length === 0) {
      toast.error("لطفا ابتدا آیتم‌هایی را انتخاب کنید");
      return;
    }

    if (!confirm(`آیا از حذف ${selectedItems.length} آیتم مطمئن هستید؟`))
      return;

    try {
      // API call to remove selected items
      setWishlistItems((prev) =>
        prev.filter((item) => !selectedItems.includes(item.id))
      );
      setSelectedItems([]);
      toast.success("آیتم‌های انتخاب شده حذف شدند");
    } catch (error) {
      toast.error("خطا در حذف آیتم‌ها");
    }
  };

  const handleAddToCart = async (item) => {
    try {
      // API call to add to cart
      toast.success("به سبد خرید اضافه شد");
    } catch (error) {
      toast.error("خطا در اضافه کردن به سبد خرید");
    }
  };

  const handleAddSelectedToCart = async () => {
    if (selectedItems.length === 0) {
      toast.error("لطفا ابتدا آیتم‌هایی را انتخاب کنید");
      return;
    }

    try {
      // API call to add selected items to cart
      toast.success("آیتم‌های انتخاب شده به سبد خرید اضافه شدند");
    } catch (error) {
      toast.error("خطا در اضافه کردن به سبد خرید");
    }
  };

  const handleShareWishlist = () => {
    const wishlistUrl = `${window.location.origin}/user/dashboard/wishlist`;
    navigator.clipboard.writeText(wishlistUrl);
    toast.success("لینک لیست علاقه‌مندی کپی شد");
  };

  const handleImageError = (itemId) => {
    setImageErrors((prev) => ({
      ...prev,
      [itemId]: true,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">لیست علاقه‌مندی</h1>
          <p className="text-gray-600 mt-1">پوشاک مورد علاقه شما</p>
        </div>
        <div className="flex space-x-3 space-x-reverse mt-4 md:mt-0">
          <button
            onClick={handleShareWishlist}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <Share2 className="w-4 h-4 ml-2" />
            اشتراک‌گذاری
          </button>
          <Link
            href="/products"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <TrendingUp className="w-4 h-4 ml-2" />
            ادامه خرید
          </Link>
        </div>
      </div>

      {/* Bulk Actions */}
      {wishlistItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={selectedItems.length === wishlistItems.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="select-all"
                  className="mr-2 text-sm text-gray-700"
                >
                  انتخاب همه ({wishlistItems.length})
                </label>
              </div>

              {selectedItems.length > 0 && (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className="text-sm text-gray-600">
                    {selectedItems.length} آیتم انتخاب شده
                  </span>
                  <button
                    onClick={handleAddSelectedToCart}
                    className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors flex items-center"
                  >
                    <ShoppingCart className="w-3 h-3 ml-1" />
                    افزودن به سبد خرید
                  </button>
                  <button
                    onClick={handleRemoveSelected}
                    className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors flex items-center"
                  >
                    <Trash2 className="w-3 h-3 ml-1" />
                    حذف انتخاب شده‌ها
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <Heart className="w-4 h-4 ml-1 text-red-500" />
              <span>{wishlistItems.length} محصول در لیست علاقه‌مندی</span>
            </div>
          </div>
        </div>
      )}

      {/* Wishlist Items */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-96 bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            لیست علاقه‌مندی شما خالی است
          </h3>
          <p className="text-gray-500 mb-6">
            پوشاک مورد علاقه خود را اینجا ذخیره کنید
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <TrendingUp className="w-4 h-4 ml-2" />
            مشاهده محصولات
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-all duration-200"
            >
              {/* Product Image Container */}
              <div className="relative flex justify-center items-center bg-gray-100">
                <div className="w-full flex justify-center items-center">
                  {imageErrors[item.id] ? (
                    <div className="h-96 w-full flex flex-col items-center justify-center bg-gray-200">
                      <ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
                      <span className="text-gray-500">تصویر بارگذاری نشد</span>
                    </div>
                  ) : (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="object-cover rounded-2xl shadow-sm h-96 w-full"
                      onError={() => handleImageError(item.id)}
                    />
                  )}
                </div>

                {/* Discount Badge */}
                {item.discount && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    {item.discount} تخفیف
                  </div>
                )}

                {/* Stock Status */}
                {!item.in_stock && (
                  <div className="absolute top-3 right-3 bg-gray-500 text-white text-xs px-2 py-1 rounded">
                    ناموجود
                  </div>
                )}

                {/* Quick Actions Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-4 space-x-reverse">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                    title="افزودن به سبد خرید"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                  <Link
                    href={`/products/${item.product_id}`}
                    className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                    title="مشاهده جزئیات"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors"
                    title="حذف از علاقه‌مندی"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.category}
                    </p>
                  </div>

                  {/* Selection Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                {/* Size and Color */}
                <div className="flex items-center space-x-3 space-x-reverse mb-3">
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 ml-1">سایز:</span>
                    <span className="text-xs font-medium">
                      {item.sizes.join(", ")}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 ml-1">رنگ:</span>
                    <span className="text-xs font-medium">
                      {item.colors.slice(0, 2).join(", ")}
                      {item.colors.length > 2 && "..."}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(item.rating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 mr-1">
                    ({item.reviews} نظر)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="font-bold text-gray-900">
                      {item.price}
                    </span>
                    {item.original_price && (
                      <span className="text-sm text-gray-500 line-through">
                        {item.original_price}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 space-x-reverse">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                      title="افزودن به سبد خرید"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={!item.in_stock}
                  className={`w-full mt-4 py-2 rounded-lg flex items-center justify-center transition-colors ${
                    item.in_stock
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 ml-2" />
                  {item.in_stock ? "افزودن به سبد خرید" : "ناموجود"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Wishlist Statistics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          آمار علاقه‌مندی‌ها
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">کل محصولات</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {wishlistItems.length}
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700">موجود در انبار</p>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {wishlistItems.filter((item) => item.in_stock).length}
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-700">تخفیف دار</p>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              {wishlistItems.filter((item) => item.discount).length}
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-700">میانگین امتیاز</p>
            <p className="text-2xl font-bold text-yellow-900 mt-1">
              {wishlistItems.length > 0
                ? (
                    wishlistItems.reduce((sum, item) => sum + item.rating, 0) /
                    wishlistItems.length
                  ).toFixed(1)
                : "۰"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
