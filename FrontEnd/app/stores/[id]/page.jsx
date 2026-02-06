"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ShoppingBag,
  Store,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Star,
  Package,
  Shield,
  Truck,
  Clock,
  Heart,
  Share2,
  Search,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Eye,
  ShoppingCart,
  Award,
  CheckCircle,
  TrendingUp,
  Home,
  AlertCircle,
  X,
  Filter,
  Check,
  Tag,
  Menu,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

const StoreDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const storeId = params.id;

  const [storeData, setStoreData] = useState(null);
  const [storeDetails, setStoreDetails] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000000 });
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [cart, setCart] = useState([]);
  const [addingToCart, setAddingToCart] = useState({});
  const [toast, setToast] = useState({
    show: false,
    message: "",
    product: null,
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileSort, setShowMobileSort] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    category: "all",
    priceRange: { min: 0, max: 10000000 },
  });
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [tempPriceRange, setTempPriceRange] = useState({
    min: 0,
    max: 10000000,
  });

  const categoryDropdownRef = useRef(null);
  const filtersRef = useRef(null);

  // Check if user has access token
  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  };

  // Fetch store data from the new API endpoint
  const fetchStoreData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/products/store/${storeId}/`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("فروشگاه یافت نشد");
        }
        throw new Error(`خطا در دریافت اطلاعات: ${response.status}`);
      }

      const data = await response.json();
      setStoreData(data);

      // Extract store details from the response
      if (data.store) {
        setStoreDetails({
          id: data.store.id,
          store_name: data.store.store_name || "فروشگاه ناشناس",
          first_name: data.store.first_name || "",
          last_name: data.store.last_name || "",
          full_name:
            data.store.full_name ||
            `${data.store.first_name || ""} ${data.store.last_name || ""}`,
          phone: data.store.phone || "ثبت نشده",
          email: data.store.email || "ثبت نشده",
          city: data.store.city || "نامشخص",
          store_logo: data.store.store_logo || null,
          created_at: data.store.created_at || new Date().toISOString(),
          seller_join_date:
            data.store.seller_join_date || data.store.created_at,
          store_rating: data.store.store_rating || { average: 0, count: 0 },
          seller_rating: data.store.seller_rating || { average: 0, count: 0 },
          active_products_count: data.total_products || 0,
          total_sales: data.store.total_sales || 0,
          total_revenue: data.store.total_revenue || "0.00",
          is_verified: data.store.is_verified || false,
          seller_status: data.store.seller_status || "pending",
          store_type: data.store.store_type || "single-vendor",
          supported_languages: data.store.supported_languages || ["fa"],
          supported_currencies: data.store.supported_currencies || ["IRR"],
        });
      }

      // Extract products from the response
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
        setFilteredProducts(data.products);

        // Initialize price range based on actual products
        if (data.products.length > 0) {
          const prices = data.products
            .map((p) => p.price || 0)
            .filter((p) => p > 0);
          if (prices.length > 0) {
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            setPriceRange({ min: minPrice, max: maxPrice });
            setTempPriceRange({ min: minPrice, max: maxPrice });
            setAppliedFilters((prev) => ({
              ...prev,
              priceRange: { min: minPrice, max: maxPrice },
            }));
          }
        }
      }
    } catch (error) {
      console.error("Error fetching store data:", error);
      setError(error.message || "خطا در دریافت اطلاعات فروشگاه");
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  // Show toast message
  const showToast = (message, product) => {
    setToast({ show: true, message, product });
    setTimeout(() => {
      setToast({ show: false, message: "", product: null });
    }, 10000);
  };

  // Add item to cart
  const handleAddToCart = async (product) => {
    if (!product || !product.id) {
      alert("محصول نامعتبر است");
      return;
    }

    setAddingToCart((prev) => ({ ...prev, [product.id]: true }));

    try {
      const token = getAuthToken();
      if (!token) {
        alert("لطفا ابتدا وارد حساب کاربری خود شوید");
        router.push("/auth/user-login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/carts/me/add-item/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
          price_snapshot: product.price,
          color: product.colors?.[0] || null,
          size: product.sizes?.[0] || null,
          owner_store_id: storeId,
        }),
      });

      if (response.ok) {
        showToast(`محصول "${product.title}" به سبد خرید اضافه شد`, product);

        // Update cart state
        setCart((prev) => [
          ...prev,
          {
            product_id: product.id,
            title: product.title,
            price: product.price,
            quantity: 1,
          },
        ]);
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "خطا در اضافه کردن به سبد خرید");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("خطا در ارتباط با سرور");
    } finally {
      setAddingToCart((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  // View product details
  const handleViewProduct = (productId) => {
    if (productId) {
      router.push(`/product-details/${productId}`);
    }
  };

  // Apply filters
  const applyFilters = () => {
    setAppliedFilters({
      category: selectedCategory,
      priceRange: { ...tempPriceRange },
    });
    setPriceRange({ ...tempPriceRange });
    setShowFilters(false);
    setShowMobileFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    const minPrice = Math.min(...products.map((p) => p.price || 0));
    const maxPrice = Math.max(...products.map((p) => p.price || 0));

    setSelectedCategory("all");
    setPriceRange({ min: minPrice, max: maxPrice });
    setTempPriceRange({ min: minPrice, max: maxPrice });
    setAppliedFilters({
      category: "all",
      priceRange: { min: minPrice, max: maxPrice },
    });
    setShowFilters(false);
    setShowMobileFilters(false);
  };

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (product) =>
          (product.title &&
            product.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (product.description &&
            product.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (product.category &&
            product.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (appliedFilters.category !== "all") {
      filtered = filtered.filter(
        (product) => product.category === appliedFilters.category
      );
    }

    // Price range filter
    filtered = filtered.filter(
      (product) =>
        product.price >= appliedFilters.priceRange.min &&
        product.price <= appliedFilters.priceRange.max
    );

    // Sort products
    switch (sortBy) {
      case "newest":
        filtered.sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0)
        );
        break;
      case "price-low":
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "popular":
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "best-selling":
        filtered.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchTerm, sortBy, appliedFilters]);

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Get unique categories
  const categories = [
    "all",
    ...new Set(
      products
        .map((product) => product.category)
        .filter(Boolean)
        .filter((category) => category && category !== "")
    ),
  ];

  // Get max price for range slider
  const maxPrice = products.reduce(
    (max, product) => Math.max(max, product.price || 0),
    10000000
  );

  // Fetch data on mount
  useEffect(() => {
    if (storeId) {
      fetchStoreData();
    }
  }, [storeId, fetchStoreData]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setShowCategoryDropdown(false);
      }
      if (
        filtersRef.current &&
        !filtersRef.current.contains(event.target) &&
        !event.target.closest(".filter-button")
      ) {
        setShowFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Image URL helpers
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/media/") || imagePath.startsWith("/")) {
      return `http://127.0.0.1:8000${imagePath}`;
    }
    return `${API_BASE_URL.replace("/api", "")}${imagePath}`;
  };

  // Get product image
  const getProductImage = (product) => {
    if (!product) return null;

    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      const primaryImage = product.images.find((img) => img.is_primary);
      return primaryImage || product.images[0];
    }

    return null;
  };

  // Format currency
  const formatCurrency = (price) => {
    if (!price && price !== 0) return "قیمت نامعلوم";
    return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "ثبت نشده";
    try {
      return new Date(dateString).toLocaleDateString("fa-IR");
    } catch {
      return dateString;
    }
  };

  // Calculate discount percentage
  const calculateDiscount = (price, comparePrice) => {
    if (!comparePrice || comparePrice <= price) return 0;
    return Math.round((1 - price / comparePrice) * 100);
  };

  // Get category label in Persian
  const getCategoryLabel = (category) => {
    switch (category) {
      case "men":
        return "مردانه";
      case "women":
        return "زنانه";
      case "kids":
        return "کودک";
      default:
        return category || "عمومی";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            در حال دریافت اطلاعات فروشگاه...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !storeDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="h-20 w-20 text-red-400 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "فروشگاه یافت نشد"}
          </h3>
          <p className="text-gray-600 mb-6">
            متاسفانه نتوانستیم اطلاعات این فروشگاه را پیدا کنیم.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push("/")}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium flex items-center justify-center gap-2"
            >
              <Home className="h-4 w-4" />
              صفحه اصلی
            </button>
            <button
              onClick={fetchStoreData}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto sm:right-4 z-50 max-w-md mx-auto sm:mx-0">
          <div className="bg-green-50 border border-green-200 rounded-xl shadow-lg p-4 animate-fade-in">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-green-900">
                  {toast.message}
                </p>
                {toast.product && (
                  <div className="mt-2 flex items-center">
                    {toast.product.images?.[0]?.image && (
                      <img
                        src={getFullImageUrl(toast.product.images[0].image)}
                        alt={toast.product.title}
                        className="h-10 w-10 rounded-lg object-cover mr-2"
                      />
                    )}
                    <div className="text-xs text-green-700">
                      <p className="font-medium">{toast.product.title}</p>
                      <p>{formatCurrency(toast.product.price)}</p>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() =>
                  setToast({ show: false, message: "", product: null })
                }
                className="ml-4 flex-shrink-0 text-green-700 hover:text-green-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Back Button */}
      <div className="lg:hidden sticky top-0 z-40 bg-white shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold truncate max-w-[200px]">
            {storeDetails.store_name}
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Store Header */}
      <div className="bg-white shadow-lg lg:mb-6">
        <div className="relative">
          {/* Store Logo/Banner */}
          <div className="relative h-48 md:h-64 lg:h-98 bg-gradient-to-r from-blue-500 to-purple-600">
            {storeDetails.store_logo ? (
              <img
                src={getFullImageUrl(storeDetails.store_logo)}
                alt={storeDetails.store_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.parentElement.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center">
                      <Store class="h-20 w-20 text-white opacity-80" />
                    </div>
                  `;
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Store className="h-20 w-20 text-white opacity-80" />
              </div>
            )}

            {/* Store Name Overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent pt-12 pb-4 px-4">
              <div className="container mx-auto">
                <div className="flex items-end justify-between">
                  <h1 className="text-white text-xl md:text-3xl font-bold">
                    {storeDetails.store_name}
                  </h1>
                  <div className="flex items-center gap-2">
                    {storeDetails.seller_status === "approved" && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        تایید شده
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Store Stats - Mobile Optimized */}
          <div className="px-4 py-3 bg-white border-b ">
            <div className="grid grid-cols-4 gap-3 text-center ">
              <div>
                <div className="text-gray-600 text-xs mb-1">محصولات</div>
                <div className="text-lg font-bold text-gray-900">
                  {storeDetails.active_products_count || products.length}
                </div>
              </div>
              <div>
                <div className="text-gray-600 text-xs mb-1">امتیاز</div>
                <div className="text-lg font-bold text-gray-900 flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  {storeDetails.store_rating?.average?.toFixed(1) || "۰"}
                </div>
              </div>
              <div>
                <div className="text-gray-600 text-xs mb-1">عضویت</div>
                <div className="text-lg font-bold text-gray-900">
                  {formatDate(storeDetails.seller_join_date).split("/")[0]}
                </div>
              </div>
              <div>
                <div className="text-gray-600 text-xs mb-1">فروش</div>
                <div className="text-lg font-bold text-gray-900">
                  {storeDetails.total_sales || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Mobile Optimized */}
          <div className="px-4 py-3 bg-white">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`flex-1 min-w-[120px] px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2 ${
                  isFavorite
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
                />
                {isFavorite ? "حذف" : "علاقه"}
              </button>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: storeDetails.store_name,
                      text: `فروشگاه ${storeDetails.store_name}`,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert("لینک فروشگاه کپی شد!");
                  }
                }}
                className="flex-1 min-w-[120px] px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                اشتراک
              </button>

              {storeDetails.phone && storeDetails.phone !== "ثبت نشده" && (
                <a
                  href={`tel:${storeDetails.phone}`}
                  className="flex-1 min-w-[120px] px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  تماس
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter/Sort Buttons */}
      <div className="lg:hidden sticky top-14 z-30 bg-white border-b shadow-sm">
        <div className="flex">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex-1 py-3 px-4 flex items-center justify-center gap-2 border-l border-gray-200 filter-button"
          >
            <Filter className="h-5 w-5" />
            فیلتر
            {(appliedFilters.category !== "all" ||
              appliedFilters.priceRange.min > 0 ||
              appliedFilters.priceRange.max < maxPrice) && (
              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                !
              </span>
            )}
          </button>
          <button
            onClick={() => setShowMobileSort(!showMobileSort)}
            className="flex-1 py-3 px-4 flex items-center justify-center gap-2 filter-button"
          >
            <Menu className="h-5 w-5" />
            مرتب‌سازی
          </button>
        </div>
      </div>

      {/* Mobile Filters Overlay */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">فیلترها</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  دسته‌بندی
                </label>
                <div className="relative" ref={categoryDropdownRef}>
                  <button
                    onClick={() =>
                      setShowCategoryDropdown(!showCategoryDropdown)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-right flex items-center justify-between"
                  >
                    <span>
                      {selectedCategory === "all"
                        ? "همه دسته‌بندی‌ها"
                        : getCategoryLabel(selectedCategory)}
                    </span>
                    {showCategoryDropdown ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </button>

                  {showCategoryDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setSelectedCategory(category);
                            setShowCategoryDropdown(false);
                          }}
                          className={`w-full text-right px-3 py-2 hover:bg-gray-100 ${
                            selectedCategory === category
                              ? "bg-blue-50 text-blue-600"
                              : ""
                          } ${
                            category === "all" ? "border-b border-gray-200" : ""
                          }`}
                        >
                          {category === "all"
                            ? "همه دسته‌بندی‌ها"
                            : getCategoryLabel(category)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  محدوده قیمت: {formatCurrency(tempPriceRange.min)} -{" "}
                  {formatCurrency(tempPriceRange.max)}
                </label>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max={maxPrice}
                      value={tempPriceRange.min}
                      onChange={(e) =>
                        setTempPriceRange((prev) => ({
                          ...prev,
                          min: Math.min(
                            parseInt(e.target.value) || 0,
                            tempPriceRange.max
                          ),
                        }))
                      }
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-center"
                      placeholder="حداقل"
                    />
                    <span className="flex items-center">تا</span>
                    <input
                      type="number"
                      min="0"
                      max={maxPrice}
                      value={tempPriceRange.max}
                      onChange={(e) =>
                        setTempPriceRange((prev) => ({
                          ...prev,
                          max: Math.max(
                            parseInt(e.target.value) || maxPrice,
                            tempPriceRange.min
                          ),
                        }))
                      }
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-center"
                      placeholder="حداکثر"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    step="1000"
                    value={tempPriceRange.max}
                    onChange={(e) =>
                      setTempPriceRange((prev) => ({
                        ...prev,
                        max: parseInt(e.target.value),
                      }))
                    }
                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                  />
                </div>
              </div>

              {/* Reset & Apply Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-3 border border-gray-300 rounded-lg font-medium"
                >
                  حذف فیلترها
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium"
                >
                  اعمال فیلتر
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sort Overlay */}
      {showMobileSort && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-2xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">مرتب‌سازی</h3>
                <button
                  onClick={() => setShowMobileSort(false)}
                  className="p-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2">
                {[
                  { id: "newest", label: "جدیدترین" },
                  { id: "oldest", label: "قدیمی‌ترین" },
                  { id: "price-low", label: "قیمت: کم به زیاد" },
                  { id: "price-high", label: "قیمت: زیاد به کم" },
                  { id: "popular", label: "پر بازدیدترین" },
                  { id: "best-selling", label: "پرفروش‌ترین" },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSortBy(option.id);
                      setShowMobileSort(false);
                    }}
                    className={`w-full text-right py-3 px-4 rounded-lg ${
                      sortBy === option.id
                        ? "bg-blue-50 text-blue-600"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Section */}
      <div className="sticky top-14 lg:top-0 z-20 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto py-2 scrollbar-hide">
            {[
              { id: "products", label: "محصولات", count: products.length },
              { id: "info", label: "اطلاعات فروشگاه" },
              { id: "seller", label: "اطلاعات فروشنده" },
              {
                id: "reviews",
                label: "نظرات",
                count:
                  (storeDetails.store_rating?.count || 0) +
                  (storeDetails.seller_rating?.count || 0),
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2.5 md:px-4 md:py-3 rounded-lg font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Desktop Search and Filters */}
        <div className="hidden lg:block mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-6" ref={filtersRef}>
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="جستجو در محصولات فروشگاه..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-12 pl-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <div className="flex bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2.5 rounded-lg ${
                      viewMode === "grid"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500"
                    }`}
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2.5 rounded-lg ${
                      viewMode === "list"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500"
                    }`}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 filter-button ${
                      showFilters
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Filter className="h-5 w-5" />
                    فیلترها
                    {(appliedFilters.category !== "all" ||
                      appliedFilters.priceRange.min > 0 ||
                      appliedFilters.priceRange.max < maxPrice) && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        !
                      </span>
                    )}
                  </button>

                  {/* Desktop Filters Dropdown */}
                  {showFilters && (
                    <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 p-6 z-50">
                      <div className="space-y-6">
                        {/* Category Filter */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            دسته‌بندی
                          </label>
                          <div className="relative" ref={categoryDropdownRef}>
                            <button
                              onClick={() =>
                                setShowCategoryDropdown(!showCategoryDropdown)
                              }
                              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-right flex items-center justify-between hover:border-gray-400"
                            >
                              <span>
                                {selectedCategory === "all"
                                  ? "همه دسته‌بندی‌ها"
                                  : getCategoryLabel(selectedCategory)}
                              </span>
                              {showCategoryDropdown ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </button>

                            {showCategoryDropdown && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {categories.map((category) => (
                                  <button
                                    key={category}
                                    onClick={() => {
                                      setSelectedCategory(category);
                                      setShowCategoryDropdown(false);
                                    }}
                                    className={`w-full text-right px-3 py-2 hover:bg-gray-100 ${
                                      selectedCategory === category
                                        ? "bg-blue-50 text-blue-600"
                                        : ""
                                    } ${
                                      category === "all"
                                        ? "border-b border-gray-200"
                                        : ""
                                    }`}
                                  >
                                    {category === "all"
                                      ? "همه دسته‌بندی‌ها"
                                      : getCategoryLabel(category)}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Price Range */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            محدوده قیمت: {formatCurrency(tempPriceRange.min)} -{" "}
                            {formatCurrency(tempPriceRange.max)}
                          </label>
                          <div className="space-y-4">
                            <div className="flex gap-2">
                              <input
                                type="number"
                                min="0"
                                max={maxPrice}
                                value={tempPriceRange.min}
                                onChange={(e) =>
                                  setTempPriceRange((prev) => ({
                                    ...prev,
                                    min: Math.min(
                                      parseInt(e.target.value) || 0,
                                      tempPriceRange.max
                                    ),
                                  }))
                                }
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-center"
                                placeholder="حداقل"
                              />
                              <span className="flex items-center">تا</span>
                              <input
                                type="number"
                                min="0"
                                max={maxPrice}
                                value={tempPriceRange.max}
                                onChange={(e) =>
                                  setTempPriceRange((prev) => ({
                                    ...prev,
                                    max: Math.max(
                                      parseInt(e.target.value) || maxPrice,
                                      tempPriceRange.min
                                    ),
                                  }))
                                }
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-center"
                                placeholder="حداکثر"
                              />
                            </div>
                            <input
                              type="range"
                              min="0"
                              max={maxPrice}
                              step="1000"
                              value={tempPriceRange.max}
                              onChange={(e) =>
                                setTempPriceRange((prev) => ({
                                  ...prev,
                                  max: parseInt(e.target.value),
                                }))
                              }
                              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                            />
                          </div>
                        </div>

                        {/* Active Filters */}
                        {(selectedCategory !== "all" ||
                          tempPriceRange.min > 0 ||
                          tempPriceRange.max < maxPrice) && (
                          <div className="pt-4 border-t border-gray-200">
                            <div className="flex flex-wrap gap-2 mb-4">
                              {selectedCategory !== "all" && (
                                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                  {getCategoryLabel(selectedCategory)}
                                  <button
                                    onClick={() => setSelectedCategory("all")}
                                    className="hover:text-blue-900"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              )}
                              {(tempPriceRange.min > 0 ||
                                tempPriceRange.max < maxPrice) && (
                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                  {formatCurrency(tempPriceRange.min)} -{" "}
                                  {formatCurrency(tempPriceRange.max)}
                                  <button
                                    onClick={() => {
                                      const minPrice = Math.min(
                                        ...products.map((p) => p.price || 0)
                                      );
                                      const maxPrice = Math.max(
                                        ...products.map((p) => p.price || 0)
                                      );
                                      setTempPriceRange({
                                        min: minPrice,
                                        max: maxPrice,
                                      });
                                    }}
                                    className="hover:text-green-900"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                          <button
                            onClick={resetFilters}
                            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                          >
                            حذف فیلترها
                          </button>
                          <button
                            onClick={applyFilters}
                            className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                          >
                            اعمال فیلتر
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-xl px-4 py-2.5 min-w-[150px]"
                >
                  <option value="newest">جدیدترین</option>
                  <option value="oldest">قدیمی‌ترین</option>
                  <option value="price-low">قیمت: کم به زیاد</option>
                  <option value="price-high">قیمت: زیاد به کم</option>
                  <option value="popular">پر بازدیدترین</option>
                  <option value="best-selling">پرفروش‌ترین</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Mobile Search */}
            <div className="lg:hidden mb-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="جستجو..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl bg-white"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Active Filters Display */}
            {(appliedFilters.category !== "all" ||
              appliedFilters.priceRange.min > 0 ||
              appliedFilters.priceRange.max < maxPrice) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {appliedFilters.category !== "all" && (
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm">
                    {getCategoryLabel(appliedFilters.category)}
                    <button
                      onClick={() => {
                        setSelectedCategory("all");
                        applyFilters();
                      }}
                      className="hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {(appliedFilters.priceRange.min > 0 ||
                  appliedFilters.priceRange.max < maxPrice) && (
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm">
                    {formatCurrency(appliedFilters.priceRange.min)} -{" "}
                    {formatCurrency(appliedFilters.priceRange.max)}
                    <button
                      onClick={() => {
                        const minPrice = Math.min(
                          ...products.map((p) => p.price || 0)
                        );
                        const maxPrice = Math.max(
                          ...products.map((p) => p.price || 0)
                        );
                        setTempPriceRange({ min: minPrice, max: maxPrice });
                        applyFilters();
                      }}
                      className="hover:text-green-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={resetFilters}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  حذف همه فیلترها
                </button>
              </div>
            )}

            {/* Results Info */}
            <div className="text-sm text-gray-600 mb-4">
              <span>
                {filteredProducts.length} محصول
                {searchTerm && ` برای "${searchTerm}"`}
              </span>
            </div>

            {/* Products Grid/List View */}
            {currentProducts.length > 0 ? (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
                      : "space-y-4"
                  }
                >
                  {currentProducts.map((product) => {
                    const productImage = getProductImage(product);
                    const imageUrl = productImage?.image;
                    const fullImageUrl = getFullImageUrl(imageUrl);
                    const isAvailable =
                      product.stock > 0 && product.is_in_stock;
                    const discount = calculateDiscount(
                      product.price,
                      product.compare_price
                    );
                    const isAdding = addingToCart[product.id] || false;
                    const productRating = product.rating?.average || 0;

                    if (viewMode === "list") {
                      return (
                        <div
                          key={product.id}
                          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex flex-col md:flex-row">
                            {/* Product Image */}
                            <div
                              className="relative md:w-48 lg:w-56 h-48 md:h-72 sm:h-72 bg-gray-100 cursor-pointer"
                              onClick={() => handleViewProduct(product.id)}
                            >
                              {fullImageUrl ? (
                                <img
                                  src={fullImageUrl}
                                  alt={product.title}
                                  className="w-full h-full  object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = "none";
                                    e.target.parentElement.innerHTML = `
                                      <div class="w-full h-full flex items-center justify-center bg-gray-200">
                                        <ShoppingBag class="h-12 w-12 text-gray-400" />
                                      </div>
                                    `;
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <ShoppingBag className="h-12 w-12 text-gray-400" />
                                </div>
                              )}

                              {/* Discount Badge */}
                              {discount > 0 && (
                                <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                                  {discount}%
                                </div>
                              )}

                              {/* Stock Status */}
                              {!isAvailable && (
                                <div className="absolute top-3 right-3 bg-gray-500 text-white px-2 py-1 rounded text-xs">
                                  ناموجود
                                </div>
                              )}
                            </div>

                            {/* Product Info - List View */}
                            <div className="flex-1 p-4 md:p-6">
                              <div className="flex flex-col h-full">
                                <div className="mb-4">
                                  <h3
                                    className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600"
                                    onClick={() =>
                                      handleViewProduct(product.id)
                                    }
                                  >
                                    {product.title}
                                  </h3>
                                  {product.description && (
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                      {product.description}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center justify-between mb-4">
                                  {/* Rating */}
                                  {productRating > 0 && (
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                      <span className="text-sm font-medium">
                                        {productRating.toFixed(1)}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        ({product.views || 0} بازدید)
                                      </span>
                                    </div>
                                  )}

                                  {/* Category */}
                                  {product.category && (
                                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                                      {getCategoryLabel(product.category)}
                                    </span>
                                  )}
                                </div>

                                {/* Price and Actions */}
                                <div className="mt-auto">
                                  <div className="flex items-center justify-between mb-4">
                                    <div>
                                      <div className="text-xl font-bold text-gray-900">
                                        {formatCurrency(product.price)}
                                      </div>
                                      {product.compare_price &&
                                        product.compare_price >
                                          product.price && (
                                          <div className="text-sm text-gray-500 line-through">
                                            {formatCurrency(
                                              product.compare_price
                                            )}
                                          </div>
                                        )}
                                    </div>
                                  </div>

                                  <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                      onClick={() =>
                                        handleViewProduct(product.id)
                                      }
                                      className="flex-1 py-2.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                                    >
                                      <Eye className="h-4 w-4" />
                                      مشاهده جزئیات
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddToCart(product);
                                      }}
                                      disabled={!isAvailable || isAdding}
                                      className={`flex-1 py-2.5 rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2 ${
                                        isAvailable
                                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                      }`}
                                    >
                                      {isAdding ? (
                                        <>
                                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                          در حال اضافه کردن...
                                        </>
                                      ) : (
                                        <>
                                          <ShoppingCart className="h-4 w-4" />
                                          {isAvailable
                                            ? "افزودن به سبد خرید"
                                            : "ناموجود"}
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      // Grid View
                      return (
                        <div
                          key={product.id}
                          className="bg-white w-auto rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
                          onClick={() => handleViewProduct(product.id)}
                        >
                          {/* Product Image */}
                          <div className="relative h-96 bg-gray-100">
                            {fullImageUrl ? (
                              <img
                                src={fullImageUrl}
                                alt={product.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = "none";
                                  e.target.parentElement.innerHTML = `
                                    <div class="w-full h-full flex items-center justify-center bg-gray-200">
                                      <ShoppingBag class="h-8 w-8 text-gray-400" />
                                    </div>
                                  `;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <ShoppingBag className="h-8 w-8 text-gray-400" />
                              </div>
                            )}

                            {/* Discount Badge */}
                            {discount > 0 && (
                              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                                {discount}%
                              </div>
                            )}

                            {/* Stock Status */}
                            {!isAvailable && (
                              <div className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-1 rounded text-xs">
                                ناموجود
                              </div>
                            )}

                            {/* Quick Actions */}
                            <div className="absolute bottom-2 left-2 right-2">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-xs">
                                  <Eye className="h-3 w-3" />
                                  {product.views || 0}
                                </div>
                                {product.category && (
                                  <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                                    {getCategoryLabel(product.category)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Product Info */}
                          <div className="py-3 px-1">
                            {/* Add to Cart Button and wishlist */}
                            <div className="flex flex-col sm:flex-row gap-3">
                              <button
                                onClick={() => handleViewProduct(product.id)}
                                className="flex-1 py-2.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                مشاهده جزئیات
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(product);
                                }}
                                disabled={!isAvailable || isAdding}
                                className={`flex-1 py-2.5 rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2 ${
                                  isAvailable
                                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                              >
                                {isAdding ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    در حال اضافه کردن...
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart className="h-4 w-4" />
                                    {isAvailable ? "افزودن به سبد" : "ناموجود"}
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-1 mt-8">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = index + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = index + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + index;
                      } else {
                        pageNumber = currentPage - 2 + index;
                      }

                      if (pageNumber < 1 || pageNumber > totalPages)
                        return null;

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium text-sm ${
                            currentPage === pageNumber
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  محصولی یافت نشد
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  {searchTerm ||
                  appliedFilters.category !== "all" ||
                  appliedFilters.priceRange.min > 0 ||
                  appliedFilters.priceRange.max < maxPrice
                    ? "نتیجه‌ای برای جستجوی شما پیدا نشد."
                    : "هنوز محصولی در این فروشگاه ثبت نشده است."}
                </p>
                {(searchTerm ||
                  appliedFilters.category !== "all" ||
                  appliedFilters.priceRange.min > 0 ||
                  appliedFilters.priceRange.max < maxPrice) && (
                  <button
                    onClick={resetFilters}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium"
                  >
                    مشاهده همه محصولات
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Other Tabs remain the same */}
        {activeTab === "info" && (
          <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
              اطلاعات فروشگاه
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                {[
                  { label: "نام فروشگاه", value: storeDetails.store_name },
                  {
                    label: "نوع فروشگاه",
                    value:
                      storeDetails.store_type === "single-vendor"
                        ? "فروشگاه اختصاصی"
                        : "بازارچه",
                  },
                  { label: "شهر", value: storeDetails.city || "ثبت نشده" },
                  {
                    label: "وضعیت",
                    value:
                      storeDetails.seller_status === "approved"
                        ? "تایید شده"
                        : "در انتظار تایید",
                    color:
                      storeDetails.seller_status === "approved"
                        ? "text-green-600"
                        : "text-yellow-600",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-gray-100"
                  >
                    <span className="text-gray-600">{item.label}:</span>
                    <span className={`font-medium ${item.color || ""}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {[
                  {
                    label: "تعداد محصولات",
                    value:
                      storeDetails.active_products_count || products.length,
                  },
                  { label: "تعداد فروش", value: storeDetails.total_sales || 0 },
                  {
                    label: "تاریخ عضویت",
                    value: formatDate(storeDetails.seller_join_date),
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-gray-100"
                  >
                    <span className="text-gray-600">{item.label}:</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "seller" && (
          <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
              اطلاعات فروشنده
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 mb-3">
                  اطلاعات شخصی
                </h4>
                {[
                  { label: "نام کامل", value: storeDetails.full_name },
                  { label: "تلفن همراه", value: storeDetails.phone },
                  ...(storeDetails.email && storeDetails.email !== "ثبت نشده"
                    ? [{ label: "ایمیل", value: storeDetails.email }]
                    : []),
                  { label: "شهر", value: storeDetails.city || "ثبت نشده" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-gray-100"
                  >
                    <span className="text-gray-600">{item.label}:</span>
                    <span className="font-medium text-left max-w-xs">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 mb-3">
                  اطلاعات حرفه‌ای
                </h4>
                {[
                  { label: "نام فروشگاه", value: storeDetails.store_name },
                  {
                    label: "امتیاز فروشنده",
                    value:
                      storeDetails.seller_rating?.average > 0
                        ? `${storeDetails.seller_rating.average.toFixed(1)} (${
                            storeDetails.seller_rating.count
                          } نظر)`
                        : "بدون امتیاز",
                  },
                  {
                    label: "امتیاز فروشگاه",
                    value:
                      storeDetails.store_rating?.average > 0
                        ? `${storeDetails.store_rating.average.toFixed(1)} (${
                            storeDetails.store_rating.count
                          } نظر)`
                        : "بدون امتیاز",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-gray-100"
                  >
                    <span className="text-gray-600">{item.label}:</span>
                    <span className="font-medium text-left max-w-xs">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-6">
              نظرات مشتریان
            </h3>

            {storeDetails.store_rating?.count > 0 ||
            storeDetails.seller_rating?.count > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-gray-50 rounded-2xl p-4 md:p-6">
                    <div className="text-center">
                      <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        {storeDetails.store_rating?.average?.toFixed(1) || "۰"}
                      </div>
                      <div className="flex items-center justify-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 md:h-6 md:w-6 ${
                              i <
                              Math.floor(
                                storeDetails.store_rating?.average || 0
                              )
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="font-medium text-gray-900 mb-1">
                        امتیاز فروشگاه
                      </div>
                      <div className="text-sm text-gray-600">
                        {storeDetails.store_rating?.count || 0} نظر
                      </div>
                    </div>
                  </div>

                  {storeDetails.seller_rating?.count > 0 && (
                    <div className="bg-gray-50 rounded-2xl p-4 md:p-6">
                      <div className="text-center">
                        <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                          {storeDetails.seller_rating.average.toFixed(1)}
                        </div>
                        <div className="flex items-center justify-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 md:h-6 md:w-6 ${
                                i <
                                Math.floor(storeDetails.seller_rating.average)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="font-medium text-gray-900 mb-1">
                          امتیاز فروشنده
                        </div>
                        <div className="text-sm text-gray-600">
                          {storeDetails.seller_rating.count} نظر
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="font-medium text-gray-900 mb-2">
                  هنوز نظری ثبت نشده است
                </h4>
                <p className="text-gray-600">
                  اولین نفری باشید که برای این فروشگاه نظر می‌دهد.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreDetailPage;
