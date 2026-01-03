"use client";

import { useState, useEffect, useCallback } from "react";
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
  Plus,
  Minus,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

const StoreDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const storeId = params.id;

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

  // Check if user has access token
  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  };

  // Fetch store owner details directly from API
  const fetchStoreOwnerDetails = useCallback(async () => {
    try {
      const token = getAuthToken();
      // /api/products/store/{store_owner_id}/

      const response = await fetch(
        `${API_BASE_URL}/products/store/${storeId}/`,
        {
          // headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      // const response = await fetch(`${API_BASE_URL}/store-owners/${storeId}/`, {
      //   headers: token ? { Authorization: `Bearer ${token}` } : {},
      // });

      console.log(response);

      if (response.ok) {
        const data = await response.json();
        return data;
      } else if (response.status === 404) {
        // Try the store-owners endpoint without ID first
        const allResponse = await fetch(`${API_BASE_URL}/store-owners/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        console.log(allResponse);
        if (allResponse.ok) {
          const allStores = await allResponse.json();
          const store = Array.isArray(allStores)
            ? allStores.find((s) => s.id === storeId || s._id === storeId)
            : allStores.results?.find(
                (s) => s.id === storeId || s._id === storeId
              );

          if (store) return store;
        }
      }
      return null;
    } catch (error) {
      console.error("Error fetching store owner details:", error);
      return null;
    }
  }, [storeId]);

  // Fetch all products and filter by store owner
  const fetchStoreProducts = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/`);
      
      if (!response.ok) throw new Error("Failed to fetch products");

      const allProducts = await response.json();

      // Filter products by store owner ID - handle both array and paginated responses
      let productsList = [];
      if (Array.isArray(allProducts)) {
        productsList = allProducts;
      } else if (allProducts.results && Array.isArray(allProducts.results)) {
        productsList = allProducts.results;
      } else if (allProducts.data && Array.isArray(allProducts.data)) {
        productsList = allProducts.data;
      } else if (allProducts.products && Array.isArray(allProducts.products)) {
        productsList = allProducts.products;
      }

      // Filter by store owner ID
      const storeProducts = productsList.filter((product) => {
        if (!product) return false;
        // Check various possible store owner ID fields
        const storeOwnerId =
          product.store_owner?.id ||
          product.store_owner?._id ||
          product.store_owner_id ||
          product.owner_store_id;

        return storeOwnerId === storeId;
      });

      console.log(
        `Found ${storeProducts.length} products for store ${storeId}`,
        storeProducts
      );
      return storeProducts;
    } catch (error) {
      console.error("Error fetching store products:", error);
      return [];
    }
  }, [storeId]);

  // Fetch store rating statistics
  const fetchStoreRating = useCallback(async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/store-owners/me/statistics/`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching store rating:", error);
      return null;
    }
  }, []);

  // Fetch all store data
  const fetchStoreData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch store owner details
      const storeData = await fetchStoreOwnerDetails();

      // If no store found, try to fetch from products
      if (!storeData) {
        console.log(
          "No direct store data found, trying to extract from products..."
        );

        const storeProducts = await fetchStoreProducts();
        if (storeProducts.length === 0) {
          throw new Error("فروشگاه یافت نشد");
        }

        // Extract store info from first product
        const firstProduct = storeProducts[0];
        const storeOwner = firstProduct.store_owner;

        if (!storeOwner) {
          throw new Error("اطلاعات فروشگاه نامعتبر است");
        }

        setStoreDetails({
          id: storeId,
          store_name: storeOwner.store_name || "فروشگاه ناشناس",
          first_name: storeOwner.first_name || "",
          last_name: storeOwner.last_name || "",
          phone: storeOwner.phone || "ثبت نشده",
          email: storeOwner.email || "ثبت نشده",
          city: storeOwner.city || "نامشخص",
          store_logo: storeOwner.store_logo || null,
          created_at: storeOwner.created_at || new Date().toISOString(),
          store_rating: {
            average: storeOwner.store_rating?.average || 0,
            count: storeOwner.store_rating?.count || 0,
          },
        });

        setProducts(storeProducts);
        setFilteredProducts(storeProducts);
      } else {
        // Use fetched store data
        setStoreDetails({
          id: storeId,
          store_name: storeData.store_name || "فروشگاه ناشناس",
          first_name: storeData.first_name || "",
          last_name: storeData.last_name || "",
          phone: storeData.phone || "ثبت نشده",
          email: storeData.email || "ثبت نشده",
          city: storeData.city || "نامشخص",
          store_logo: storeData.store_logo || null,
          created_at: storeData.created_at || new Date().toISOString(),
          store_rating: {
            average: storeData.store_rating?.average || 0,
            count: storeData.store_rating?.count || 0,
          },
        });

        // Fetch products for this store
        const storeProducts = await fetchStoreProducts();
        setProducts(storeProducts);
        setFilteredProducts(storeProducts);
      }
    } catch (error) {
      console.error("Error fetching store data:", error);
      setError(error.message || "خطا در دریافت اطلاعات فروشگاه");
    } finally {
      setLoading(false);
    }
  }, [storeId, fetchStoreOwnerDetails, fetchStoreProducts]);

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
        alert(`محصول ${product.title} به سبد خرید اضافه شد`);

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
      router.push(`/stores/${storeId}/${productId}`);
    }
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
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Price range filter
    filtered = filtered.filter(
      (product) =>
        product.price >= priceRange.min && product.price <= priceRange.max
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
        // Sort by views or rating if available
        filtered.sort(
          (a, b) => (b.views || b.rating || 0) - (a.views || a.rating || 0)
        );
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchTerm, sortBy, selectedCategory, priceRange]);

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
    0
  );

  // Initialize price range
  useEffect(() => {
    if (products.length > 0 && maxPrice > 0) {
      setPriceRange({ min: 0, max: maxPrice });
    }
  }, [products, maxPrice]);

  // Fetch data on mount
  useEffect(() => {
    if (storeId) {
      fetchStoreData();
    }
  }, [storeId, fetchStoreData]);

  // Image URL helpers
  const getProductImageUrl = (product) => {
    if (!product) return null;

    // Check images array first
    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      const image = product.images[0];
      if (typeof image === "string") return image;
      if (image.url) return image.url;
      if (image.image) return image.image;
    }

    // Check single image field
    if (product.image) {
      if (typeof product.image === "string") return product.image;
      if (product.image.url) return product.image.url;
    }

    // Check primary_image
    if (product.primary_image) {
      if (typeof product.primary_image === "string")
        return product.primary_image;
      if (product.primary_image.url) return product.primary_image.url;
    }

    return null;
  };

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/media/") || imagePath.startsWith("/")) {
      return `http://127.0.0.1:8000${imagePath}`;
    }
    return `${API_BASE_URL.replace("/api", "")}${imagePath}`;
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
      {/* Store Header */}
      <div className="bg-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 md:py-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Store Logo and Basic Info */}
              <div className="flex items-start gap-6 flex-1">
                <div className="relative">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl ring-4 ring-white overflow-hidden">
                    {storeDetails.store_logo ? (
                      <img
                        src={getFullImageUrl(storeDetails.store_logo)}
                        alt={storeDetails.store_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML =
                            '<Store className="h-12 w-12 md:h-16 md:w-16 text-white" />';
                        }}
                      />
                    ) : (
                      <Store className="h-12 w-12 md:h-16 md:w-16 text-white" />
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                      {storeDetails.store_name}
                    </h1>
                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      className={`p-2 rounded-full transition-all duration-200 ${
                        isFavorite
                          ? "bg-red-50 text-red-500"
                          : "bg-gray-100 text-gray-400 hover:text-red-500"
                      }`}
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          isFavorite ? "fill-current" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <p className="text-gray-600 text-base md:text-lg mb-4">
                    {products.length > 0
                      ? `فروشگاه تخصصی با ${products.length} محصول با کیفیت`
                      : "فروشگاه تخصصی با خدمات عالی"}
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm">
                      <Star className="h-4 w-4 ml-1" />
                      {storeDetails.store_rating?.average > 0
                        ? `${storeDetails.store_rating.average.toFixed(
                            1
                          )} امتیاز`
                        : "جدید"}
                    </span>
                    <span className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm">
                      <Package className="h-4 w-4 ml-1" />
                      {products.length} محصول
                    </span>
                    {storeDetails.city && storeDetails.city !== "نامشخص" && (
                      <span className="inline-flex items-center bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-sm">
                        <MapPin className="h-4 w-4 ml-1" />
                        {storeDetails.city}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Seller Info */}
              <div className="flex flex-col gap-4 min-w-[280px]">
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gray-200">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <User className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {storeDetails.first_name} {storeDetails.last_name}
                    </p>
                    <p className="text-gray-600 text-sm">فروشنده</p>
                  </div>
                </div>

                <div className="flex gap-2">
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
                    className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    اشتراک
                  </button>
                  {storeDetails.phone && storeDetails.phone !== "ثبت نشده" && (
                    <a
                      href={`tel:${storeDetails.phone}`}
                      className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      تماس
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm p-1 mb-8 border border-gray-200">
          <nav className="flex space-x-1 rtl:space-x-reverse overflow-x-auto">
            {[
              { id: "products", label: "محصولات", count: products.length },
              { id: "info", label: "اطلاعات فروشگاه" },
              { id: "seller", label: "اطلاعات فروشنده" },
              {
                id: "reviews",
                label: "نظرات",
                count: storeDetails.store_rating?.count || 0,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 md:px-6 md:py-3 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      activeTab === tab.id
                        ? "bg-white text-blue-600"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="جستجو در محصولات فروشگاه..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-12 pl-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
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

                <div className="flex flex-wrap gap-3">
                  {/* View Mode Toggle */}
                  <div className="flex bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2.5 rounded-lg transition-all duration-200 ${
                        viewMode === "grid"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-500"
                      }`}
                    >
                      <Grid className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2.5 rounded-lg transition-all duration-200 ${
                        viewMode === "list"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-500"
                      }`}
                    >
                      <List className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Filters Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                      showFilters
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Filter className="h-5 w-5" />
                    فیلترها
                    {(selectedCategory !== "all" ||
                      priceRange.min > 0 ||
                      priceRange.max < maxPrice) && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        !
                      </span>
                    )}
                  </button>

                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-w-[150px]"
                  >
                    <option value="newest">جدیدترین</option>
                    <option value="oldest">قدیمی‌ترین</option>
                    <option value="price-low">قیمت: کم به زیاد</option>
                    <option value="price-high">قیمت: زیاد به کم</option>
                    <option value="popular">محبوب‌ترین</option>
                  </select>
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        دسته‌بندی
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="all">همه دسته‌بندی‌ها</option>
                        {categories
                          .filter((cat) => cat !== "all")
                          .map((category) => (
                            <option key={category} value={category}>
                              {category === "men"
                                ? "مردانه"
                                : category === "women"
                                ? "زنانه"
                                : category === "kids"
                                ? "کودک"
                                : category}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        محدوده قیمت: {formatCurrency(priceRange.min)} -{" "}
                        {formatCurrency(priceRange.max)}
                      </label>
                      <div className="space-y-4">
                        <input
                          type="range"
                          min="0"
                          max={maxPrice}
                          value={priceRange.max}
                          onChange={(e) =>
                            setPriceRange((prev) => ({
                              ...prev,
                              max: parseInt(e.target.value),
                            }))
                          }
                          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{formatCurrency(0)}</span>
                          <span>{formatCurrency(maxPrice)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reset Filters Button */}
                  {(selectedCategory !== "all" ||
                    priceRange.min > 0 ||
                    priceRange.max < maxPrice) && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <button
                        onClick={() => {
                          setSelectedCategory("all");
                          setPriceRange({ min: 0, max: maxPrice });
                        }}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                      >
                        <X className="h-4 w-4" />
                        حذف همه فیلترها
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Results Info */}
              <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-gray-600">
                <span>
                  نمایش{" "}
                  {Math.min(currentProducts.length, filteredProducts.length)} از{" "}
                  {filteredProducts.length} محصول
                  {searchTerm && ` برای "${searchTerm}"`}
                </span>
                {(searchTerm ||
                  selectedCategory !== "all" ||
                  priceRange.min > 0 ||
                  priceRange.max < maxPrice) && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                      setPriceRange({ min: 0, max: maxPrice });
                    }}
                    className="text-blue-600 hover:text-blue-700 transition-colors mt-2 sm:mt-0"
                  >
                    حذف فیلترها
                  </button>
                )}
              </div>
            </div>

            {/* Products Grid/List */}
            {currentProducts.length > 0 ? (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      : "space-y-4"
                  }
                >
                  {currentProducts.map((product) => {
                    const imageUrl = getProductImageUrl(product);
                    const fullImageUrl = getFullImageUrl(imageUrl);
                    const isAvailable = product.stock > 0;
                    const discount = calculateDiscount(
                      product.price,
                      product.compare_price
                    );
                    const isAdding = addingToCart[product.id] || false;

                    return (
                      <div
                        key={product.id}
                        className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl group ${
                          viewMode === "list" ? "flex flex-col md:flex-row" : ""
                        }`}
                      >
                        {/* Product Image */}
                        <div
                          className={`relative cursor-pointer ${
                            viewMode === "list"
                              ? "md:w-48 md:h-48 w-full h-48"
                              : "aspect-square"
                          } bg-gray-100`}
                          onClick={() => handleViewProduct(product.id)}
                        >
                          {fullImageUrl ? (
                            <img
                              src={fullImageUrl}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = "none";
                                e.target.parentElement.innerHTML = `
                                  <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                                    <ShoppingBag class="h-12 w-12 text-gray-400" />
                                  </div>
                                `;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                              <ShoppingBag className="h-12 w-12 text-gray-400" />
                            </div>
                          )}

                          {/* Discount Badge */}
                          {discount > 0 && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
                              {discount}%
                            </div>
                          )}

                          {/* Stock Status */}
                          {!isAvailable ? (
                            <div className="absolute top-3 right-3">
                              <span className="bg-gray-500 text-white px-2.5 py-1 rounded-full text-xs font-bold">
                                ناموجود
                              </span>
                            </div>
                          ) : (
                            product.stock <= 10 && (
                              <div className="absolute top-3 right-3">
                                <span className="bg-yellow-500 text-white px-2.5 py-1 rounded-full text-xs font-bold">
                                  {product.stock} عدد
                                </span>
                              </div>
                            )
                          )}

                          {/* Quick View Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProduct(product.id);
                              }}
                              className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 shadow-lg"
                            >
                              <Eye className="h-4 w-4" />
                              مشاهده سریع
                            </button>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div
                          className={`p-4 flex-1 flex flex-col ${
                            viewMode === "list" ? "md:justify-between" : ""
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <h3
                                className="font-semibold text-gray-900 line-clamp-2 text-base cursor-pointer hover:text-blue-600 transition-colors flex-1"
                                onClick={() => handleViewProduct(product.id)}
                              >
                                {product.title}
                              </h3>
                            </div>

                            {product.description && (
                              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                {product.description}
                              </p>
                            )}

                            {product.category && (
                              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full mb-3">
                                {product.category === "men"
                                  ? "مردانه"
                                  : product.category === "women"
                                  ? "زنانه"
                                  : product.category === "kids"
                                  ? "کودک"
                                  : product.category}
                              </span>
                            )}

                            <div className="mb-4">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-gray-900">
                                  {formatCurrency(product.price)}
                                </span>
                                {product.compare_price &&
                                  product.compare_price > product.price && (
                                    <span className="text-sm text-gray-500 line-through">
                                      {formatCurrency(product.compare_price)}
                                    </span>
                                  )}
                              </div>
                            </div>

                            {/* Product Details */}
                            <div className="space-y-2 mb-4">
                              {product.colors && product.colors.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    رنگ:
                                  </span>
                                  <div className="flex gap-1">
                                    {product.colors
                                      .slice(0, 3)
                                      .map((color, index) => (
                                        <div
                                          key={index}
                                          className="w-4 h-4 rounded-full border border-gray-300"
                                          style={{ backgroundColor: color }}
                                          title={color}
                                        />
                                      ))}
                                    {product.colors.length > 3 && (
                                      <span className="text-xs text-gray-400">
                                        +{product.colors.length - 3}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {product.sizes && product.sizes.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    سایز:
                                  </span>
                                  <div className="flex gap-1">
                                    {product.sizes
                                      .slice(0, 3)
                                      .map((size, index) => (
                                        <span
                                          key={index}
                                          className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                                        >
                                          {size}
                                        </span>
                                      ))}
                                    {product.sizes.length > 3 && (
                                      <span className="text-xs text-gray-400">
                                        +{product.sizes.length - 3}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewProduct(product.id)}
                              className="flex-1 border border-gray-300 text-gray-700 py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              مشاهده
                            </button>
                            <button
                              onClick={() => handleAddToCart(product)}
                              disabled={!isAvailable || isAdding}
                              className={`flex-1 py-2.5 px-3 rounded-xl transition-all duration-200 font-medium text-sm flex items-center justify-center gap-1 ${
                                isAvailable
                                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
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
                                  {isAvailable ? "خرید" : "ناموجود"}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
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
                          className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                            currentPage === pageNumber
                              ? "bg-blue-600 text-white shadow-lg"
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
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                <ShoppingBag className="h-20 w-20 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  محصولی یافت نشد
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  {searchTerm ||
                  selectedCategory !== "all" ||
                  priceRange.min > 0 ||
                  priceRange.max < maxPrice
                    ? "نتیجه‌ای برای جستجوی شما پیدا نشد. می‌توانید با تغییر فیلترها دوباره جستجو کنید."
                    : "هنوز محصولی در این فروشگاه ثبت نشده است."}
                </p>
                {(searchTerm ||
                  selectedCategory !== "all" ||
                  priceRange.min > 0 ||
                  priceRange.max < maxPrice) && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                      setPriceRange({ min: 0, max: maxPrice });
                    }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    مشاهده همه محصولات
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Store Information Tab */}
        {activeTab === "info" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Store Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Store className="h-5 w-5 text-blue-600" />
                اطلاعات فروشگاه
              </h3>
              <div className="space-y-4">
                {[
                  {
                    label: "نام فروشگاه",
                    value: storeDetails.store_name,
                    icon: Store,
                  },
                  {
                    label: "شهر",
                    value: storeDetails.city || "ثبت نشده",
                    icon: MapPin,
                  },
                  { label: "تلفن", value: storeDetails.phone, icon: Phone },
                  { label: "ایمیل", value: storeDetails.email, icon: Mail },
                  {
                    label: "امتیاز فروشگاه",
                    value: `${
                      storeDetails.store_rating?.average?.toFixed(1) || "۰"
                    } (${storeDetails.store_rating?.count || "۰"} نظر)`,
                    icon: Star,
                  },
                  {
                    label: "تعداد محصولات",
                    value: products.length,
                    icon: Package,
                  },
                  {
                    label: "تاریخ عضویت",
                    value: formatDate(storeDetails.created_at),
                    icon: Calendar,
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <span className="text-gray-600 flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.label}:
                    </span>
                    <span className="font-medium text-left max-w-xs text-gray-900">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Store Features */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                امکانات فروشگاه
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {[
                  {
                    icon: Shield,
                    label: "تضمین اصالت کالا",
                    color: "bg-green-100 text-green-600",
                    description: "کلیه محصولات دارای اصالت و گارانتی می‌باشند",
                  },
                  {
                    icon: Truck,
                    label: "ارسال به سراسر کشور",
                    color: "bg-blue-100 text-blue-600",
                    description: "ارسال سریع به تمام نقاط ایران",
                  },
                  {
                    icon: Clock,
                    label: "پشتیبانی 24 ساعته",
                    color: "bg-purple-100 text-purple-600",
                    description: "پشتیبانی آنلاین در تمام ساعات",
                  },
                  {
                    icon: Award,
                    label: "کیفیت عالی",
                    color: "bg-orange-100 text-orange-600",
                    description: "محصولات با کیفیت بالا و تضمین شده",
                  },
                  {
                    icon: TrendingUp,
                    label: "رضایت مشتری",
                    color: "bg-yellow-100 text-yellow-600",
                    description: `رضایت ${
                      storeDetails.store_rating?.average
                        ? (storeDetails.store_rating.average * 20).toFixed(0)
                        : "۱۰۰"
                    }% از مشتریان`,
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div
                      className={`p-2 rounded-lg ${feature.color} flex-shrink-0`}
                    >
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900 block mb-1">
                        {feature.label}
                      </span>
                      <span className="text-sm text-gray-600">
                        {feature.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Seller Information Tab */}
        {activeTab === "seller" && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              اطلاعات فروشنده
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">
                  اطلاعات شخصی
                </h4>
                {[
                  {
                    label: "نام کامل",
                    value: `${storeDetails.first_name} ${storeDetails.last_name}`,
                    icon: User,
                  },
                  {
                    label: "تلفن همراه",
                    value: storeDetails.phone,
                    icon: Phone,
                  },
                  ...(storeDetails.email
                    ? [
                        {
                          label: "ایمیل",
                          value: storeDetails.email,
                          icon: Mail,
                        },
                      ]
                    : []),
                  {
                    label: "شهر",
                    value: storeDetails.city || "ثبت نشده",
                    icon: MapPin,
                  },
                  {
                    label: "تاریخ عضویت",
                    value: formatDate(storeDetails.created_at),
                    icon: Calendar,
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-3 border-b border-gray-100"
                  >
                    <span className="text-gray-600 flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.label}:
                    </span>
                    <span className="font-medium text-gray-900 max-w-xs text-left">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">
                  اطلاعات فروشگاه
                </h4>
                {[
                  {
                    label: "نام فروشگاه",
                    value: storeDetails.store_name,
                    icon: Store,
                  },
                  {
                    label: "امتیاز فروشگاه",
                    value: `${
                      storeDetails.store_rating?.average?.toFixed(1) || "۰"
                    } (${storeDetails.store_rating?.count || "۰"} نظر)`,
                    icon: Star,
                  },
                  {
                    label: "تعداد محصولات",
                    value: products.length,
                    icon: Package,
                  },
                  {
                    label: "وضعیت فروشگاه",
                    value: "فعال",
                    icon: CheckCircle,
                    color: "text-green-600",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-start py-3 border-b border-gray-100"
                  >
                    <span className="text-gray-600 flex items-center gap-2 flex-shrink-0">
                      <item.icon className="h-4 w-4" />
                      {item.label}:
                    </span>
                    <span
                      className={`font-medium text-left max-w-xs ${
                        item.color || "text-gray-900"
                      }`}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              نظرات مشتریان
            </h3>

            {storeDetails.store_rating?.count > 0 ? (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900">
                        {storeDetails.store_rating.average.toFixed(1)}
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-6 w-6 ${
                              i < Math.floor(storeDetails.store_rating.average)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {storeDetails.store_rating.count} نظر
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center py-8">
                  <p className="text-gray-600">
                    سیستم نمایش نظرات به زودی راه‌اندازی خواهد شد.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
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
