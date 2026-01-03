// app/user/dashboard/wishlist/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Share2,
  Eye,
  TrendingUp,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  Calendar,
  Store,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const MEDIA_BASE_URL = "http://127.0.0.1:8000";

// Utility functions
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
};

const formatPrice = (price) => {
  if (!price && price !== 0) return "۰ تومان";
  return new Intl.NumberFormat("fa-IR").format(Math.round(price)) + " تومان";
};

const parsePrice = (price) => {
  if (typeof price === "string") {
    return parseFloat(price);
  }
  return price || 0;
};

const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;

  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  if (imagePath.startsWith("/media/")) {
    return `${MEDIA_BASE_URL}${imagePath}`;
  }

  if (imagePath.startsWith("/")) {
    return `${MEDIA_BASE_URL}/media${imagePath}`;
  }

  return `${MEDIA_BASE_URL}/media/${imagePath}`;
};

const calculateDiscount = (price, comparePrice) => {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [imageErrors, setImageErrors] = useState({});
  const [loadingStates, setLoadingStates] = useState({
    wishlist: true,
    actions: {},
    cart: {},
  });

  // Fetch wishlist data
  const fetchWishlist = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      toast.error("لطفا ابتدا وارد حساب کاربری خود شوید");
      router.push("/auth/user-login");
      return;
    }

    try {
      setLoadingStates((prev) => ({ ...prev, wishlist: true }));
      const response = await fetch(`${API_BASE_URL}/wishlists/me/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("accessToken");
          toast.error("لطفا مجددا وارد حساب کاربری خود شوید");
          router.push("/auth/user-login");
          return;
        }
        if (response.status === 404) {
          setWishlist({ items: [] });
          setWishlistItems([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const wishlistData = await response.json();
      console.log("Wishlist data received:", wishlistData);
      setWishlist(wishlistData);

      // Extract wishlist items
      const items = wishlistData.items || [];
      setWishlistItems(items);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("خطا در دریافت لیست علاقه‌مندی");
    } finally {
      setLoadingStates((prev) => ({ ...prev, wishlist: false }));
      setLoading(false);
    }
  }, [router]);

  // Get product image URL
  const getProductImageUrl = (product) => {
    if (!product) return null;

    // Check if product has images array
    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      // Get first image (you can modify to get primary image if available)
      const imagePath = product.images[0];
      return getFullImageUrl(imagePath);
    }

    // Fallback to product.image if available
    if (product.image) {
      if (typeof product.image === "string") {
        return getFullImageUrl(product.image);
      }
      if (product.image.url) {
        return getFullImageUrl(product.image.url);
      }
    }

    return null;
  };

  // Handle image error
  const handleImageError = (itemId, e) => {
    setImageErrors((prev) => ({ ...prev, [itemId]: true }));
    const parent = e.target.parentElement;
    if (parent) {
      parent.innerHTML = `
        <div class="flex flex-col items-center justify-center w-full h-full bg-gray-100">
          <svg class="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <span class="text-sm text-gray-500">بدون تصویر</span>
        </div>
      `;
    }
  };

  // Handle item selection
  const handleSelectItem = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (!wishlistItems || wishlistItems.length === 0) return;

    if (selectedItems.length === wishlistItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistItems.map((item) => item.id));
    }
  };

  // Remove item from wishlist
  const handleRemoveItem = async (wishlistItemId, productId) => {
    if (!confirm("آیا از حذف این محصول از لیست علاقه‌مندی مطمئن هستید؟"))
      return;

    try {
      setLoadingStates((prev) => ({
        ...prev,
        actions: { ...prev.actions, [wishlistItemId]: true },
      }));

      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/wishlists/me/remove/${productId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await fetchWishlist();
        setSelectedItems((prev) => prev.filter((id) => id !== wishlistItemId));
        toast.success("از لیست علاقه‌مندی حذف شد");
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || "خطا در حذف از علاقه‌مندی");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        actions: { ...prev.actions, [wishlistItemId]: false },
      }));
    }
  };

  // Remove selected items
  const handleRemoveSelected = async () => {
    if (selectedItems.length === 0) {
      toast.error("لطفا ابتدا آیتم‌هایی را انتخاب کنید");
      return;
    }

    if (!confirm(`آیا از حذف ${selectedItems.length} آیتم مطمئن هستید؟`))
      return;

    try {
      // Get product IDs from selected wishlist items
      const selectedProducts = wishlistItems
        .filter((item) => selectedItems.includes(item.id))
        .map((item) => item.product.id);

      // Remove each selected item
      const removePromises = selectedProducts.map(async (productId) => {
        const token = getAuthToken();
        return fetch(`${API_BASE_URL}/wishlists/me/remove/${productId}/`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      });

      await Promise.all(removePromises);
      await fetchWishlist();
      setSelectedItems([]);
      toast.success("آیتم‌های انتخاب شده حذف شدند");
    } catch (error) {
      console.error("Error removing selected items:", error);
      toast.error("خطا در حذف آیتم‌ها");
    }
  };

  // Add item to cart
  const handleAddToCart = async (product) => {
    try {
      const productId = product.id;
      setLoadingStates((prev) => ({
        ...prev,
        cart: { ...prev.cart, [productId]: true },
      }));

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/carts/me/add-item/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1,
          price_snapshot: product.price,
          owner_store_id: product.store_id,
        }),
      });

      if (response.ok) {
        toast.success("به سبد خرید اضافه شد");
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || "خطا در اضافه کردن به سبد خرید");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        cart: { ...prev.cart, [product.id]: false },
      }));
    }
  };

  // Add selected items to cart
  const handleAddSelectedToCart = async () => {
    if (selectedItems.length === 0) {
      toast.error("لطفا ابتدا آیتم‌هایی را انتخاب کنید");
      return;
    }

    try {
      const selectedProducts = wishlistItems
        .filter((item) => selectedItems.includes(item.id))
        .map((item) => item.product);

      const addPromises = selectedProducts.map(async (product) => {
        const token = getAuthToken();
        return fetch(`${API_BASE_URL}/carts/me/add-item/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_id: product.id,
            quantity: 1,
            price_snapshot: product.price,
            owner_store_id: product.store_id,
          }),
        });
      });

      await Promise.all(addPromises);
      toast.success("آیتم‌های انتخاب شده به سبد خرید اضافه شدند");
    } catch (error) {
      console.error("Error adding selected to cart:", error);
      toast.error("خطا در اضافه کردن به سبد خرید");
    }
  };

  // Share wishlist
  const handleShareWishlist = () => {
    if (!wishlist || !wishlist.id) {
      toast.error("ابتدا لیست علاقه‌مندی خود را ایجاد کنید");
      return;
    }

    const wishlistUrl = `${window.location.origin}/share/wishlist/${wishlist.id}`;
    navigator.clipboard.writeText(wishlistUrl);
    toast.success("لینک لیست علاقه‌مندی کپی شد");
  };

  // Check if product is in stock
  const isInStock = (product) => {
    return product.stock > 0;
  };

  // Calculate wishlist statistics
  const calculateStatistics = () => {
    if (!wishlistItems || wishlistItems.length === 0) {
      return {
        totalProducts: 0,
        inStock: 0,
        withDiscount: 0,
        totalValue: 0,
        averageStock: 0,
      };
    }

    const totalProducts = wishlistItems.length;
    const inStock = wishlistItems.filter((item) =>
      isInStock(item.product)
    ).length;
    const withDiscount = wishlistItems.filter(
      (item) =>
        item.product.compare_price &&
        item.product.compare_price > item.product.price
    ).length;

    const totalValue = wishlistItems.reduce(
      (sum, item) => sum + (item.product.price || 0),
      0
    );

    const averageStock = Math.round(
      wishlistItems.reduce((sum, item) => sum + (item.product.stock || 0), 0) /
        totalProducts
    );

    return {
      totalProducts,
      inStock,
      withDiscount,
      totalValue,
      averageStock,
    };
  };

  // Clear wishlist
  const handleClearWishlist = async () => {
    if (!confirm("آیا از حذف تمام محصولات از لیست علاقه‌مندی مطمئن هستید؟"))
      return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/wishlists/me/clear/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchWishlist();
        setSelectedItems([]);
        toast.success("لیست علاقه‌مندی خالی شد");
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || "خطا در خالی کردن لیست");
      }
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      toast.error("خطا در ارتباط با سرور");
    }
  };

  // Get color and size display
  const getAttributesDisplay = (product) => {
    const attributes = [];

    if (product.colors && product.colors.length > 0) {
      const colorsDisplay = product.colors.slice(0, 2).join(", ");
      attributes.push(
        `رنگ: ${colorsDisplay}${product.colors.length > 2 ? "..." : ""}`
      );
    }

    if (product.sizes && product.sizes.length > 0) {
      const sizesDisplay = product.sizes.slice(0, 2).join(", ");
      attributes.push(
        `سایز: ${sizesDisplay}${product.sizes.length > 2 ? "..." : ""}`
      );
    }

    return attributes;
  };

  // Initialize
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const statistics = calculateStatistics();

  // Check if all items are selected
  const allSelected =
    wishlistItems.length > 0 && selectedItems.length === wishlistItems.length;

  // Loading state
  if (loadingStates.wishlist && !wishlist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">در حال بارگذاری لیست علاقه‌مندی...</p>
        </div>
      </div>
    );
  }

  // No auth state
  if (!getAuthToken()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            نیاز به ورود به حساب کاربری
          </h2>
          <p className="text-gray-600 mb-8">
            برای مشاهده لیست علاقه‌مندی، لطفا وارد حساب کاربری خود شوید
          </p>
          <button
            onClick={() => router.push("/auth/user-login")}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full"
          >
            ورود به حساب کاربری
          </button>
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
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        }}
      />

      <div className="space-y-6 font-vazirmatn" dir="rtl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              لیست علاقه‌مندی
            </h1>
            <p className="text-gray-600 mt-1">
              {wishlist?.user?.full_name || "کاربر"} - {wishlistItems.length}{" "}
              محصول
            </p>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
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

        {/* Wishlist Info */}
        {wishlist && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="flex items-center text-sm text-gray-600">
                  <Heart className="w-5 h-5 ml-1 text-red-500" />
                  <span>
                    {wishlist.item_count || 0} محصول در لیست علاقه‌مندی
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 ml-1" />
                  <span>ایجاد شده در: {formatDate(wishlist.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-sm font-medium text-gray-900">
                  ارزش کل: {formatPrice(statistics.totalValue)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {wishlistItems.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="select-all"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label
                    htmlFor="select-all"
                    className="mr-2 text-sm text-gray-700 cursor-pointer"
                  >
                    انتخاب همه ({wishlistItems.length})
                  </label>
                </div>

                {selectedItems.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {selectedItems.length} آیتم انتخاب شده
                    </span>
                    <button
                      onClick={handleAddSelectedToCart}
                      className="px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors flex items-center"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 ml-1" />
                      افزودن به سبد خرید
                    </button>
                    <button
                      onClick={handleRemoveSelected}
                      className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors flex items-center"
                    >
                      <Trash2 className="w-3.5 h-3.5 ml-1" />
                      حذف انتخاب شده‌ها
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleClearWishlist}
                className="px-3 py-1.5 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors flex items-center"
              >
                <Trash2 className="w-3.5 h-3.5 ml-1" />
                حذف همه
              </button>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              لیست علاقه‌مندی شما خالی است
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              می‌توانید محصولات مورد علاقه خود را با کلیک بر روی آیکون قلب در
              صفحات محصولات ذخیره کنید
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <TrendingUp className="w-5 h-5 ml-2" />
              مشاهده محصولات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((wishlistItem) => {
              const { id: wishlistItemId, product, added_at } = wishlistItem;
              const productId = product.id;
              const isSelected = selectedItems.includes(wishlistItemId);
              const isLoading = loadingStates.actions[wishlistItemId];
              const isAddingToCart = loadingStates.cart[productId];
              const imageUrl = getProductImageUrl(product);
              const hasImageError = imageErrors[wishlistItemId];
              const discount = calculateDiscount(
                product.price,
                product.compare_price
              );
              const isAvailable = isInStock(product);
              const attributes = getAttributesDisplay(product);

              return (
                <div
                  key={wishlistItemId}
                  className={`bg-white rounded-xl shadow-sm border overflow-hidden group hover:shadow-md transition-all duration-200 ${
                    isSelected
                      ? "border-blue-500 ring-1 ring-blue-500"
                      : "border-gray-200"
                  } ${!isAvailable ? "opacity-60" : ""}`}
                >
                  {/* Product Image Container */}
                  <div className="relative bg-gray-100">
                    <div className="aspect-square w-full">
                      {hasImageError ? (
                        <div className="h-full w-full flex flex-col items-center justify-center bg-gray-200">
                          <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
                          <span className="text-sm text-gray-500">
                            بدون تصویر
                          </span>
                        </div>
                      ) : (
                        <div className="h-full w-full overflow-hidden">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) =>
                                handleImageError(wishlistItemId, e)
                              }
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center bg-gray-200">
                              <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
                              <span className="text-sm text-gray-500">
                                بدون تصویر
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Discount Badge */}
                    {discount > 0 && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-lg font-bold">
                        %{discount}
                      </div>
                    )}

                    {/* Stock Status */}
                    <div
                      className={`absolute top-3 right-3 text-white text-xs px-2 py-1 rounded-lg ${
                        isAvailable ? "bg-green-500" : "bg-gray-600"
                      }`}
                    >
                      {isAvailable ? `${product.stock} عدد` : "ناموجود"}
                    </div>

                    {/* Quick Actions Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={isAddingToCart || !isAvailable}
                        className="p-2.5 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="افزودن به سبد خرید"
                      >
                        {isAddingToCart ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <ShoppingCart className="w-5 h-5" />
                        )}
                      </button>
                      <Link
                        href={`/product/${productId}`}
                        className="p-2.5 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                        title="مشاهده جزئیات"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() =>
                          handleRemoveItem(wishlistItemId, productId)
                        }
                        disabled={isLoading}
                        className="p-2.5 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="حذف از علاقه‌مندی"
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Selection Checkbox */}
                    <div className="absolute top-3 right-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectItem(wishlistItemId)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    {/* Title and Store */}
                    <div className="mb-3">
                      <div className="flex items-start justify-between">
                        <Link
                          href={`/product/${productId}`}
                          className="font-medium text-gray-900 hover:text-blue-600 text-sm line-clamp-2 flex-1"
                        >
                          {product.title}
                        </Link>
                      </div>

                      {product.store_id && (
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <Store className="w-3 h-3 ml-1" />
                          <span>کد فروشگاه: {product.store_id.slice(-6)}</span>
                        </div>
                      )}
                    </div>

                    {/* Product Attributes */}
                    {attributes.length > 0 && (
                      <div className="space-y-1 mb-3">
                        {attributes.map((attr, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            {attr}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Added Date */}
                    <div className="flex items-center text-xs text-gray-500 mb-3">
                      <Calendar className="w-3 h-3 ml-1" />
                      <span>افزوده شده در: {formatDate(added_at)}</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-lg">
                          {formatPrice(product.price)}
                        </span>
                        {product.compare_price &&
                          product.compare_price > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(product.compare_price)}
                            </span>
                          )}
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isAddingToCart || !isAvailable}
                      className={`w-full py-2.5 rounded-lg flex items-center justify-center transition-colors text-sm font-medium ${
                        isAvailable
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-100 text-gray-500 cursor-not-allowed"
                      } ${isAddingToCart ? "opacity-70" : ""}`}
                    >
                      {isAddingToCart ? (
                        <>
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                          در حال افزودن...
                        </>
                      ) : isAvailable ? (
                        <>
                          <ShoppingCart className="w-4 h-4 ml-2" />
                          افزودن به سبد خرید
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 ml-2" />
                          ناموجود
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Wishlist Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            آمار لیست علاقه‌مندی
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">تعداد محصولات</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {statistics.totalProducts}
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700">موجود در انبار</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {statistics.inStock}
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-700">تخفیف دار</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {statistics.withDiscount}
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-700">ارزش کل</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">
                {formatPrice(statistics.totalValue)}
              </p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-sm text-indigo-700">میانگین موجودی</p>
              <p className="text-2xl font-bold text-indigo-900 mt-1">
                {statistics.averageStock}
              </p>
            </div>
          </div>
        </div>

        {/* Empty Wishlist Guide */}
        {wishlistItems.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              چگونه محصولات را به لیست علاقه‌مندی اضافه کنم؟
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  ۱
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    محصولات را مرور کنید
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    به صفحه محصولات بروید و بین هزاران محصول جستجو کنید
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  ۲
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    آیکون قلب را کلیک کنید
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    در هر صفحه محصول، روی آیکون قلب کلیک کنید
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  ۳
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    مدیریت کنید
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    محصولات را حذف یا به سبد خرید اضافه کنید
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
