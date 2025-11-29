"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState({ items: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await fetch("/api/wishlist?user=me");
      const result = await response.json();

      if (result.success) {
        setWishlist(result.data);
      } else {
        toast.error("خطا در دریافت لیست علاقه‌مندی");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setWishlist(result.data);
        toast.success("محصول از علاقه‌مندی‌ها حذف شد");
      } else {
        toast.error(result.message || "خطا در حذف از علاقه‌مندی");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    }
  };

  const addToCart = async (product) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("محصول به سبد خرید اضافه شد");
      } else {
        toast.error(result.message || "خطا در اضافه کردن به سبد خرید");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
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
        <h1 className="text-2xl font-bold text-gray-900">علاقه‌مندی‌های من</h1>
      </div>

      {wishlist.items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-500 text-lg">
            لیست علاقه‌مندی‌های شما خالی است.
          </div>
          <p className="text-gray-400 mt-2">
            محصولاتی که به علاقه‌مندی‌ها اضافه کنید در اینجا نمایش داده می‌شوند.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.items.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Product Image */}
              <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                {getProductImage(item.productId) ? (
                  <img
                    src={getProductImage(item.productId)}
                    alt={item.productId.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center text-gray-400">
                    <span className="text-4xl">📦</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {item.productId.title}
                </h3>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {item.productId.description}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <svg
                      className="w-4 h-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm text-gray-600">
                      {item.productId.rating?.avg || 0}
                    </span>
                    <span className="text-sm text-gray-400">
                      ({item.productId.rating?.count || 0})
                    </span>
                  </div>

                  <div className="text-left">
                    <div className="text-lg font-bold text-green-600">
                      {item.productId.price.toLocaleString()} ریال
                    </div>
                    {item.productId.comparePrice &&
                      item.productId.comparePrice > item.productId.price && (
                        <div className="text-sm text-gray-500 line-through">
                          {item.productId.comparePrice.toLocaleString()} ریال
                        </div>
                      )}
                  </div>
                </div>

                <div className="flex space-x-2 space-x-reverse">
                  <button
                    onClick={() => addToCart(item.productId)}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors"
                  >
                    افزودن به سبد
                  </button>
                  <button
                    onClick={() => removeFromWishlist(item.productId._id)}
                    className="bg-red-100 text-red-600 py-2 px-3 rounded-md text-sm hover:bg-red-200 transition-colors"
                    title="حذف از علاقه‌مندی"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {item.productId.categories
                    ?.slice(0, 2)
                    .map((category, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                      >
                        {category}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
