// app/cart/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Heart,
  ArrowRight,
  Truck,
  Shield,
  Package,
  CreditCard,
  Tag,
  Clock,
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  XCircle,
  Store,
  ChevronLeft,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const MEDIA_BASE_URL = "http://127.0.0.1:8000";

// Utility Functions
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

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState({
    cart: true,
    products: {},
    updating: {},
  });
  const [couponCode, setCouponCode] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [shippingCost, setShippingCost] = useState(25000);
  const [storeDetails, setStoreDetails] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  // Fetch cart data
  const fetchCart = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      toast.error("لطفا ابتدا وارد حساب کاربری خود شوید");
      router.push("/auth/user-login");
      return;
    }

    try {
      setLoadingStates((prev) => ({ ...prev, cart: true }));
      const response = await fetch(`${API_BASE_URL}/carts/me/`, {
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
          setCart({ items: [] });
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const cartData = await response.json();
      console.log("Cart data received:", cartData);
      setCart(cartData);

      await fetchProductDetails(cartData.items);

      // Select all items by default (only available ones)
      if (cartData.items?.length > 0) {
        // We'll fetch product details first, then select available ones
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("خطا در دریافت سبد خرید");
    } finally {
      setLoadingStates((prev) => ({ ...prev, cart: false }));
      setLoading(false);
    }
  }, [router]);

  // Fetch product details with images
  const fetchProductDetails = async (items) => {
    if (!items || items.length === 0) return;

    const productPromises = items.map(async (item) => {
      const productId = item.product_id;
      if (!productId || products[productId]) return;

      setLoadingStates((prev) => ({
        ...prev,
        products: { ...prev.products, [productId]: true },
      }));

      try {
        const productResponse = await fetch(
          `${API_BASE_URL}/products/${productId}/`
        );
        if (!productResponse.ok) {
          return null;
        }

        const productData = await productResponse.json();
        console.log(`Product ${productId} data:`, productData);

        if (productData.images && Array.isArray(productData.images)) {
          productData.images = productData.images.map((img) => {
            if (typeof img === "string") {
              return { url: getFullImageUrl(img) };
            } else if (img.image) {
              return { ...img, url: getFullImageUrl(img.image) };
            } else if (img.url) {
              return { ...img, url: getFullImageUrl(img.url) };
            }
            return img;
          });
        }

        if (item.owner_store_id && !storeDetails[item.owner_store_id]) {
          await fetchStoreDetails(item.owner_store_id);
        }

        return { productId, productData };
      } catch (error) {
        console.error(`Error fetching product ${productId}:`, error);
        return null;
      } finally {
        setLoadingStates((prev) => ({
          ...prev,
          products: { ...prev.products, [productId]: false },
        }));
      }
    });

    const results = await Promise.all(productPromises);
    const newProducts = { ...products };

    results.forEach((result) => {
      if (result && result.productData) {
        newProducts[result.productId] = result.productData;
      }
    });

    setProducts(newProducts);

    // After fetching products, select available ones by default
    if (items.length > 0) {
      const availableItems = items
        .filter((item) => {
          const product = newProducts[item.product_id];
          return product && product.stock > 0;
        })
        .map((item) => item.id || item._id);

      setSelectedItems(availableItems);
    }
  };

  // Fetch store details
  const fetchStoreDetails = async (storeId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/store-owners/${storeId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const storeData = await response.json();
        setStoreDetails((prev) => ({
          ...prev,
          [storeId]: storeData,
        }));
      }
    } catch (error) {
      console.error(`Error fetching store ${storeId}:`, error);
    }
  };

  // Get product image URL
  const getProductImageUrl = (product) => {
    if (!product) return null;

    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      const primaryImage =
        product.images.find((img) => img.is_primary) || product.images[0];
      if (primaryImage?.url) {
        return primaryImage.url;
      }
    }

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
        <div class="flex flex-col items-center justify-center w-full h-full">
          <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <span class="text-xs text-gray-500">بدون تصویر</span>
        </div>
      `;
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    if (!cart?.items) {
      return {
        subtotal: 0,
        shipping: 0,
        discount: 0,
        total: 0,
        itemsCount: 0,
        productsCount: 0,
      };
    }

    const selectedCartItems = cart.items.filter((item) =>
      selectedItems.includes(item.id || item._id)
    );

    let subtotal = 0;
    let itemsCount = 0;
    let productDiscount = 0;

    selectedCartItems.forEach((item) => {
      const product = products[item.product_id];
      const price = parsePrice(item.price_snapshot);
      const quantity = item.quantity || 1;

      subtotal += price * quantity;
      itemsCount += quantity;

      if (product?.compare_price) {
        const comparePrice = parsePrice(product.compare_price);
        if (comparePrice > price) {
          productDiscount += (comparePrice - price) * quantity;
        }
      }
    });

    const shipping = subtotal > 500000 ? 0 : shippingCost;
    const total = Math.max(0, subtotal + shipping - productDiscount);

    return {
      subtotal,
      shipping,
      discount: productDiscount,
      total,
      itemsCount,
      productsCount: selectedCartItems.length,
    };
  };

  // Handle quantity change
  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) return;

    const product = products[item.product_id];
    if (product && newQuantity > (product.stock || 99)) {
      toast.error(`حداکثر تعداد موجود: ${product.stock}`);
      return;
    }

    const itemId = item.id || item._id;
    setLoadingStates((prev) => ({
      ...prev,
      updating: { ...prev.updating, [itemId]: true },
    }));

    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/carts/me/update-item/${item.product_id}/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quantity: newQuantity,
            color: item.color,
            size: item.size,
          }),
        }
      );

      if (response.ok) {
        await fetchCart();
        toast.success("تعداد به‌روزرسانی شد");
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || "خطا در به‌روزرسانی");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        updating: { ...prev.updating, [itemId]: false },
      }));
    }
  };

  // Handle remove item
  const handleRemoveItem = async (item) => {
    if (!confirm("آیا از حذف این محصول از سبد خرید مطمئن هستید؟")) return;

    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/carts/me/remove-item/${item.product_id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await fetchCart();
        // Remove from selected items
        setSelectedItems((prev) =>
          prev.filter((id) => id !== (item.id || item._id))
        );
        toast.success("محصول از سبد خرید حذف شد");
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || "خطا در حذف محصول");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("خطا در ارتباط با سرور");
    }
  };

  // Handle move to wishlist
  const handleMoveToWishlist = async (productId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/wishlists/me/add/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product_id: productId }),
      });

      if (response.ok) {
        toast.success("به لیست علاقه‌مندی‌ها منتقل شد");
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || "خطا در انتقال");
      }
    } catch (error) {
      console.error("Error moving to wishlist:", error);
      toast.error("خطا در ارتباط با سرور");
    }
  };

  // Handle apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("لطفا کد تخفیف را وارد کنید");
      return;
    }

    try {
      const token = getAuthToken();
      // Note: You need to implement this endpoint in your backend
      // For now, show a message
      toast.error("سیستم کد تخفیف به زودی راه‌اندازی خواهد شد");

      // Uncomment when you implement the coupon API
      // const response = await fetch(`${API_BASE_URL}/coupons/apply/`, {
      //   method: "POST",
      //   headers: {
      //     "Authorization": `Bearer ${token}`,
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ code: couponCode }),
      // });
      //
      // if (response.ok) {
      //   const result = await response.json();
      //   toast.success("کد تخفیف با موفقیت اعمال شد");
      //   await fetchCart();
      // } else {
      //   const errorData = await response.json();
      //   toast.error(errorData.detail || "کد تخفیف نامعتبر است");
      // }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error("خطا در اعمال کد تخفیف");
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
    if (!cart?.items) return;

    const availableItems = cart.items
      .filter((item) => {
        const product = products[item.product_id];
        return product && product.stock > 0;
      })
      .map((item) => item.id || item._id);

    if (
      selectedItems.length === availableItems.length &&
      availableItems.length > 0
    ) {
      // Deselect all
      setSelectedItems([]);
    } else {
      // Select all available items
      setSelectedItems(availableItems);
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    if (!confirm("آیا از حذف همه محصولات از سبد خرید مطمئن هستید؟")) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/carts/me/clear/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchCart();
        setSelectedItems([]);
        toast.success("سبد خرید خالی شد");
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || "خطا در خالی کردن سبد خرید");
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("خطا در ارتباط با سرور");
    }
  };

  // Handle proceed to checkout
  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("لطفا حداقل یک محصول را انتخاب کنید");
      return;
    }

    const selectedCartItems =
      cart?.items.filter((item) =>
        selectedItems.includes(item.id || item._id)
      ) || [];

    // Prepare checkout data
    const checkoutData = {
      items: selectedCartItems.map((item) => ({
        cart_item_id: item.id || item._id,
        product_id: item.product_id,
        product: products[item.product_id] || null,
        quantity: item.quantity || 1,
        price_snapshot: parsePrice(item.price_snapshot),
        color: item.color,
        size: item.size,
        owner_store_id: item.owner_store_id,
        store: storeDetails[item.owner_store_id] || null,
      })),
      totals: calculateTotals(),
      timestamp: Date.now(),
    };

    console.log("Checkout data prepared:", checkoutData);
    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
    router.push("/checkout");
  };

  // Initialize
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const { subtotal, shipping, discount, total, itemsCount, productsCount } =
    calculateTotals();

  // Check if all available items are selected
  const allAvailableSelected = () => {
    if (!cart?.items) return false;

    const availableItems = cart.items
      .filter((item) => {
        const product = products[item.product_id];
        return product && product.stock > 0;
      })
      .map((item) => item.id || item._id);

    return (
      availableItems.length > 0 &&
      selectedItems.length === availableItems.length &&
      availableItems.every((id) => selectedItems.includes(id))
    );
  };

  // Loading state
  if (loadingStates.cart && !cart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">در حال بارگذاری سبد خرید...</p>
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
            برای مشاهده سبد خرید، لطفا وارد حساب کاربری خود شوید
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

      <div className="min-h-screen bg-gray-50 py-8 font-vazirmatn" dir="rtl">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  سبد خرید
                </h1>
                <p className="text-gray-600 mt-2">
                  {cart?.items?.length || 0} محصول در سبد خرید شما
                </p>
              </div>
            </div>
          </div>

          {!cart?.items || cart.items.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                سبد خرید شما خالی است
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                می‌توانید از بین هزاران محصول موجود، خرید خود را شروع کنید
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                شروع خرید
                <ArrowRight className="w-4 h-4 mr-2" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {/* Cart Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="select-all"
                        checked={allAvailableSelected()}
                        onChange={handleSelectAll}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      />
                      <label
                        htmlFor="select-all"
                        className="mr-3 font-medium text-gray-900 cursor-pointer"
                      >
                        انتخاب همه (
                        {
                          cart.items.filter((item) => {
                            const product = products[item.product_id];
                            return product && product.stock > 0;
                          }).length
                        }
                        )
                      </label>
                    </div>
                    <button
                      onClick={handleClearCart}
                      className="flex items-center text-red-600 hover:text-red-700 text-sm"
                    >
                      <Trash2 className="w-4 h-4 ml-1" />
                      خالی کردن سبد خرید
                    </button>
                  </div>
                </div>

                {/* Cart Items List */}
                <div className="space-y-4">
                  {cart.items.map((item) => {
                    const product = products[item.product_id];
                    const isLoading = loadingStates.products[item.product_id];
                    const isUpdating =
                      loadingStates.updating[item.id || item._id];
                    const itemId = item.id || item._id;
                    const isSelected = selectedItems.includes(itemId);
                    const itemPrice = parsePrice(item.price_snapshot);
                    const itemTotal = itemPrice * (item.quantity || 1);
                    const store = storeDetails[item.owner_store_id];
                    const imageUrl = getProductImageUrl(product);
                    const hasImageError = imageErrors[itemId];
                    const isAvailable = product && product.stock > 0;

                    return (
                      <div
                        key={itemId}
                        className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-200 ${
                          isSelected
                            ? "border-blue-500 ring-1 ring-blue-500"
                            : "border-gray-200"
                        } ${!isAvailable ? "opacity-60" : ""}`}
                      >
                        {/* Store Header */}
                        {store && (
                          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center">
                            <Store className="w-4 h-4 text-gray-500 ml-2" />
                            <span className="text-sm text-gray-700">
                              فروشگاه:{" "}
                              {store.store_name ||
                                `${store.first_name} ${store.last_name}`}
                            </span>
                          </div>
                        )}

                        <div className="p-6">
                          <div className="flex flex-col md:flex-row gap-6">
                            {/* Selection & Image */}
                            <div className="flex flex-col items-start gap-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelectItem(itemId)}
                                disabled={!isAvailable}
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                                {isLoading ? (
                                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                                ) : imageUrl && !hasImageError ? (
                                  <img
                                    src={imageUrl}
                                    alt={product?.title || "محصول"}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    onError={(e) => handleImageError(itemId, e)}
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="flex flex-col items-center justify-center w-full h-full">
                                    <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                                    <span className="text-xs text-gray-500">
                                      بدون تصویر
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Product Info */}
                            <div className="flex-1">
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="flex-1">
                                  {isLoading ? (
                                    <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                                  ) : (
                                    <Link
                                      href={`/product/${item.product_id}`}
                                      className="font-medium text-gray-900 hover:text-blue-600 text-lg block mb-2"
                                    >
                                      {product?.title || "در حال بارگذاری..."}
                                    </Link>
                                  )}

                                  {/* Product Attributes */}
                                  <div className="flex flex-wrap gap-2 mt-3">
                                    {item.color && (
                                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                                        رنگ: {item.color}
                                      </span>
                                    )}
                                    {item.size && (
                                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                                        سایز: {item.size}
                                      </span>
                                    )}
                                  </div>

                                  {/* Stock Status */}
                                  {product && (
                                    <div className="mt-3">
                                      {isAvailable ? (
                                        <span className="flex items-center text-green-600 text-sm">
                                          <CheckCircle className="w-4 h-4 ml-1" />
                                          موجود در انبار ({product.stock} عدد)
                                        </span>
                                      ) : (
                                        <span className="flex items-center text-red-600 text-sm">
                                          <XCircle className="w-4 h-4 ml-1" />
                                          ناموجود
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Product SKU */}
                                  {product?.sku && (
                                    <div className="mt-2 text-sm text-gray-500">
                                      کد محصول: {product.sku}
                                    </div>
                                  )}
                                </div>

                                {/* Price Info */}
                                <div className="text-left min-w-[120px]">
                                  <div className="space-y-1">
                                    <div className="font-bold text-gray-900 text-lg">
                                      {formatPrice(itemPrice)}
                                    </div>
                                    {product?.compare_price &&
                                      parsePrice(product.compare_price) >
                                        itemPrice && (
                                        <div className="text-sm text-gray-500 line-through">
                                          {formatPrice(
                                            parsePrice(product.compare_price)
                                          )}
                                        </div>
                                      )}
                                  </div>
                                  <div className="mt-2 text-sm text-gray-600">
                                    × {item.quantity || 1}
                                  </div>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                                {/* Quantity Controls */}
                                <div className="flex items-center">
                                  <button
                                    onClick={() =>
                                      handleQuantityChange(
                                        item,
                                        (item.quantity || 1) - 1
                                      )
                                    }
                                    disabled={
                                      isUpdating ||
                                      (item.quantity || 1) <= 1 ||
                                      !isAvailable
                                    }
                                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    {isUpdating ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Minus className="w-4 h-4" />
                                    )}
                                  </button>
                                  <div className="w-16 h-10 flex items-center justify-center border-t border-b border-gray-300">
                                    <span className="font-medium">
                                      {item.quantity || 1}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() =>
                                      handleQuantityChange(
                                        item,
                                        (item.quantity || 1) + 1
                                      )
                                    }
                                    disabled={
                                      isUpdating ||
                                      !isAvailable ||
                                      (item.quantity || 1) >=
                                        (product?.stock || 99)
                                    }
                                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    {isUpdating ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Plus className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center space-x-4 space-x-reverse">
                                  <button
                                    onClick={() =>
                                      handleMoveToWishlist(item.product_id)
                                    }
                                    disabled={isUpdating || !product}
                                    className="flex items-center text-gray-600 hover:text-red-500 transition-colors disabled:opacity-50 p-2 rounded-lg hover:bg-gray-50"
                                    title="افزودن به علاقه‌مندی‌ها"
                                  >
                                    <Heart className="w-5 h-5 ml-1" />
                                    <span className="hidden sm:inline text-sm">
                                      ذخیره
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => handleRemoveItem(item)}
                                    disabled={isUpdating}
                                    className="flex items-center text-gray-600 hover:text-red-500 transition-colors disabled:opacity-50 p-2 rounded-lg hover:bg-gray-50"
                                    title="حذف از سبد خرید"
                                  >
                                    <Trash2 className="w-5 h-5 ml-1" />
                                    <span className="hidden sm:inline text-sm">
                                      حذف
                                    </span>
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
                            <span className="font-bold text-gray-900 text-lg">
                              {formatPrice(itemTotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Shopping Tips */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <Shield className="w-5 h-5 ml-2" />
                    نکات مهم خرید امن
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-white rounded-full mt-2 ml-2 flex-shrink-0"></div>
                      <span>
                        تا قبل از ارسال می‌توانید سفارش خود را ویرایش یا حذف
                        کنید
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-white rounded-full mt-2 ml-2 flex-shrink-0"></div>
                      <span>گارانتی ۷ روز بازگشت وجه برای تمام محصولات</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 sticky top-6">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                      خلاصه سفارش
                    </h2>
                  </div>

                  <div className="p-6">
                    {/* Summary Items */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">تعداد کالاها</span>
                        <span className="font-medium text-gray-900">
                          {itemsCount} قلم ({productsCount} محصول)
                        </span>
                      </div>

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
                            shipping === 0 ? "text-green-600" : "text-gray-900"
                          }
                        >
                          {shipping === 0 ? "رایگان" : formatPrice(shipping)}
                        </span>
                      </div>

                      {discount > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">تخفیف محصولات</span>
                          <span className="text-green-600">
                            -{formatPrice(discount)}
                          </span>
                        </div>
                      )}

                      {/* Coupon Section */}
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-gray-600 flex items-center">
                            <Tag className="w-4 h-4 ml-1" />
                            کد تخفیف
                          </span>
                        </div>
                        <div className="flex">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="کد تخفیف خود را وارد کنید"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                          <button
                            onClick={handleApplyCoupon}
                            className="px-4 py-2 bg-blue-600 text-white rounded-l-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                          >
                            اعمال کد
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-semibold text-gray-900">
                          مبلغ قابل پرداخت
                        </span>
                        <span className="text-2xl font-bold text-gray-900">
                          {formatPrice(total)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        هزینه نهایی پس از ثبت سفارش قابل پرداخت است
                      </p>
                    </div>

                    {/* Checkout Button */}
                    <button
                      onClick={handleProceedToCheckout}
                      disabled={selectedItems.length === 0}
                      className="w-full mt-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium text-lg"
                    >
                      <CreditCard className="w-5 h-5 ml-2" />
                      ادامه فرآیند خرید
                    </button>

                    {/* Selected Items Count */}
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">
                        {selectedItems.length} محصول از {cart.items.length}{" "}
                        محصول انتخاب شده
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center mb-4">
                    <Truck className="w-6 h-6 ml-2" />
                    <h3 className="font-semibold">تخمین زمان تحویل</h3>
                  </div>
                  <p className="text-sm mb-3">
                    سفارش شما پس از پرداخت، بین ۱ تا ۳ روز کاری در تهران و ۳ تا
                    ۷ روز کاری در سایر شهرها تحویل داده می‌شود.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
