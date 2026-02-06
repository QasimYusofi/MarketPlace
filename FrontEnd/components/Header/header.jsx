"use client";
import navigationData from "../../data/navigationData.json";
import siteConfig from "../../data/siteConfig.json";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";

import {
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiX,
  FiHeart,
  FiChevronDown,
  FiUserPlus,
  FiStore,
  FiLogOut,
  FiSettings,
  FiShoppingBag,
  FiHome,
  FiClock,
  FiTrendingUp,
  FiPackage,
} from "react-icons/fi";

import { Store, LogIn, User, Search, X } from "lucide-react";
const BASE_API = `${process.env.NEXT_PUBLIC_API_URL}`;

export default function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [storeOwner, setStoreOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);

  // Initialize recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Save recent searches to localStorage
  const saveSearchToRecent = (query) => {
    if (!query.trim()) return;

    const updatedSearches = [
      query.trim(),
      ...recentSearches.filter((item) => item !== query.trim()),
    ].slice(0, 5); // Keep only last 5 searches

    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  // Fetch cart count from API
  const fetchCartCount = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      // Check localStorage for cached count
      const cachedCount = localStorage.getItem("cartCount");
      if (cachedCount) {
        setCartCount(parseInt(cachedCount));
      }
      return;
    }

    try {
      const response = await fetch(`${BASE_API}/carts/me/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const cartData = await response.json();
        const count = cartData.items?.length || 0;
        setCartCount(count);
        localStorage.setItem("cartCount", count.toString());
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      // Fallback to localStorage
      const cachedCount = localStorage.getItem("cartCount");
      if (cachedCount) {
        setCartCount(parseInt(cachedCount));
      }
    }
  }, []);

  // Fetch wishlist count from API
  const fetchWishlistCount = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      // Check localStorage for cached count
      const cachedCount = localStorage.getItem("wishlistCount");
      if (cachedCount) {
        setWishlistCount(parseInt(cachedCount));
      }
      return;
    }

    try {
      const response = await fetch(`${BASE_API}/wishlists/me/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("wishlist: ");

      if (response.ok) {
        const wishlistData = await response.json();
        console.log(wishlistData);
        const count = wishlistData.item_count || 0;
        setWishlistCount(count);
        localStorage.setItem("wishlistCount", count.toString());
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      // Fallback to localStorage
      const cachedCount = localStorage.getItem("wishlistCount");
      if (cachedCount) {
        setWishlistCount(parseInt(cachedCount));
      }
    }
  }, []);

  // Search products
  const searchProducts = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `${BASE_API}/products/?search=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || data);
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim().length > 1) {
      searchProducts(value);
      setShowSearchDropdown(true);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveSearchToRecent(searchQuery);
      setIsSearchOpen(false);
      setShowSearchDropdown(false);
      // Navigate to search results page or show results
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  // Handle click outside search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch cart and wishlist counts on mount and when user changes
  useEffect(() => {
    fetchCartCount();
    fetchWishlistCount();

    // Set up interval to refresh counts
    const interval = setInterval(() => {
      fetchCartCount();
      fetchWishlistCount();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [fetchCartCount, fetchWishlistCount, user, storeOwner]);

  // Check if user or store owner is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setLoading(false);
          return;
        }

        const userResponse = await fetch(`${BASE_API}/users/me/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // Check for user session
        if (userResponse.ok) {
          const userResult = await userResponse.json();
          if (userResult.status === "active") {
            setUser(userResult);
            setLoading(false);
            return;
          }
        }

        // Check for store owner session
        const storeResponse = await fetch(`${BASE_API}/store-owners/me/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (storeResponse.ok) {
          const storeResult = await storeResponse.json();
          if (storeResult || storeResult.status === "active") {
            setStoreOwner(storeResult);
          }
        }
      } catch (error) {
        console.error("Error checking auth session:", error);
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem("accessToken");
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  // Listen for cart/wishlist updates from other components
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "cartCount") {
        setCartCount(parseInt(e.newValue || "0"));
      } else if (e.key === "wishlistCount") {
        setWishlistCount(parseInt(e.newValue || "0"));
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Custom event listener for cart/wishlist updates
    const handleCartUpdate = () => fetchCartCount();
    const handleWishlistUpdate = () => fetchWishlistCount();

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("wishlistUpdated", handleWishlistUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
    };
  }, [fetchCartCount, fetchWishlistCount]);

  const handleSignupChoice = (userType) => {
    setIsSignupModalOpen(false);
  };

  const handleLogoutConfirm = async () => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("cartCount");
      localStorage.removeItem("wishlistCount");

      setUser(null);
      setStoreOwner(null);
      setCartCount(0);
      setWishlistCount(0);
      setIsProfileDropdownOpen(false);
      setIsLogoutModalOpen(false);

      // Dispatch events to notify other components
      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(new Event("wishlistUpdated"));

      showToast("با موفقیت از حساب کاربری خارج شدید", "success");

      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      console.error("Error logging out:", error);
      showToast("خطا در خروج از حساب کاربری", "error");
    }
  };

  const openLogoutModal = () => {
    setIsProfileDropdownOpen(false);
    setIsLogoutModalOpen(true);
  };

  // Helper function to get display name
  const getDisplayName = () => {
    if (user) {
      return user.first_name || user.full_name || "کاربر";
    } else if (storeOwner) {
      return storeOwner.first_name || storeOwner.full_name || "فروشنده";
    }
    return "";
  };

  // Helper function to get display initial
  const getDisplayInitial = () => {
    if (user) {
      return user.first_name?.[0] || user.full_name?.[0] || "U";
    } else if (storeOwner) {
      return storeOwner.first_name?.[0] || storeOwner.full_name?.[0] || "S";
    }
    return "";
  };

  // Helper function to get user type for styling
  const getUserType = () => {
    if (user) return "user";
    if (storeOwner) return "storeOwner";
    return null;
  };

  // Helper function to get dashboard URL
  const getDashboardUrl = () => {
    if (user) return "/user/dashboard";
    if (storeOwner) return "/dashboard";
    return "/";
  };

  // Helper function to get profile URL
  const getProfileUrl = () => {
    if (user) return "/user/profile";
    return "/dashboard";
  };

  const handleProductsPage = (provider) => {
    showToast(`ورود به ${provider} در حال توسعه است...`, "error");
    console.log(`Toast for ${provider}: در حال توسعه است...`);
  };

  const showToast = (message, type = "success") => {
    // Using react-hot-toast
    if (type === "success") {
      toast.success(message, {
        duration: 3000,
        position: "top-center",
        style: {
          background: "#10B981",
          color: "white",
          borderRadius: "12px",
        },
      });
    } else {
      toast.error(message, {
        duration: 3000,
        position: "top-center",
        style: {
          background: "#EF4444",
          color: "white",
          borderRadius: "12px",
        },
      });
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const removeRecentSearch = (index) => {
    const updatedSearches = recentSearches.filter((_, i) => i !== index);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <Toaster />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center space-x-12">
            <Link
              href="/"
              className="flex flex-col items-center space-x-3 group"
            >
              <div className="flex gap-x-2 mb-1">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-500 text-center rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-white font-bold text-2xl">A</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {siteConfig.site.name}
                  </h1>
                </div>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block">
                پل مد و فیش روز
              </p>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationData.mainMenu.map((item) => (
                <div
                  key={item.id}
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(item.id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    type="button"
                    onClick={() => handleProductsPage(item.title + "")}
                    className="flex items-center space-x-1 px-4 py-2 text-gray-700 hover:text-gray-900 transition-all duration-200 rounded-lg hover:bg-gray-50 group-hover:bg-gray-50/80"
                  >
                    <span className="font-medium text-sm">{item.title}</span>
                    {item.subcategories && (
                      <FiChevronDown className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform duration-200" />
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {item.subcategories && (
                    <div
                      className={`absolute top-full right-0 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 ${
                        activeDropdown === item.id
                          ? "opacity-100 visible translate-y-0"
                          : ""
                      }`}
                    >
                      <div className="mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-4">
                        <div className="space-y-2">
                          {item.subcategories.map((sub) => (
                            <button
                              type="button"
                              key={item.id + Math.random(0, 2)}
                              onClick={() => handleProductsPage(sub.title + "")}
                              className="block px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
                            >
                              {sub.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            {/* Enhanced Search Bar with Results Dropdown */}
            <div className="hidden lg:block relative">
              <div className="relative">
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center bg-gray-50/80 backdrop-blur-sm rounded-2xl px-4 py-3 border border-gray-200 hover:border-gray-300 transition-all duration-300 group focus-within:bg-white focus-within:border-purple-500 focus-within:shadow-lg"
                >
                  <button
                    type="submit"
                    className="text-gray-400 ml-3 group-focus-within:text-purple-500 transition-colors duration-200"
                  >
                    <FiSearch className="w-5 h-5" />
                  </button>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setShowSearchDropdown(true)}
                    placeholder="جستجو در محصولات..."
                    className="bg-transparent border-none outline-none text-sm w-64 placeholder-gray-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                </form>

                {/* Search Results Dropdown */}
                {showSearchDropdown && (
                  <div
                    ref={searchResultsRef}
                    className="absolute top-full right-0 mt-2 w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50"
                  >
                    {/* Recent Searches */}
                    {searchQuery.length <= 1 && recentSearches.length > 0 && (
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <FiClock className="w-4 h-4" />
                            جستجوهای اخیر
                          </h4>
                          <button
                            onClick={clearRecentSearches}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            پاک کردن همه
                          </button>
                        </div>
                        <div className="space-y-2">
                          {recentSearches.map((term, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between group"
                            >
                              <button
                                onClick={() => {
                                  setSearchQuery(term);
                                  saveSearchToRecent(term);
                                  searchProducts(term);
                                }}
                                className="flex-1 text-right py-2 px-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200 text-sm"
                              >
                                {term}
                              </button>
                              <button
                                onClick={() => removeRecentSearch(index)}
                                className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
                              >
                                <FiX className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Search Results */}
                    {searchQuery.length > 1 && (
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <FiSearch className="w-4 h-4" />
                            نتایج جستجو برای {searchQuery}
                          </h4>
                          {searchResults.length > 0 && (
                            <span className="text-xs text-gray-500">
                              {searchResults.length} نتیجه
                            </span>
                          )}
                        </div>

                        {isSearching ? (
                          <div className="py-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                            <p className="text-gray-500 mt-2 text-sm">
                              در حال جستجو...
                            </p>
                          </div>
                        ) : searchResults.length > 0 ? (
                          <div className="space-y-3">
                            {searchResults.slice(0, 5).map((product) => (
                              <Link
                                key={product.id}
                                href={`/product/${product.id}`}
                                onClick={() => {
                                  setShowSearchDropdown(false);
                                  setSearchQuery("");
                                  saveSearchToRecent(searchQuery);
                                }}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                              >
                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                  {product.primary_image ? (
                                    <img
                                      src={product.primary_image}
                                      alt={product.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <FiPackage className="w-6 h-6" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 text-right">
                                  <h5 className="text-sm font-medium text-gray-900 group-hover:text-purple-600 line-clamp-1">
                                    {product.title}
                                  </h5>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-gray-500">
                                      {product.category}
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900">
                                      {product.price.toLocaleString()} تومان
                                    </span>
                                  </div>
                                </div>
                              </Link>
                            ))}
                            {searchResults.length > 5 && (
                              <Link
                                href={`/search?q=${encodeURIComponent(
                                  searchQuery
                                )}`}
                                onClick={() => {
                                  setShowSearchDropdown(false);
                                  saveSearchToRecent(searchQuery);
                                }}
                                className="block text-center py-3 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-200 font-medium"
                              >
                                مشاهده همه نتایج ({searchResults.length})
                              </Link>
                            )}
                          </div>
                        ) : (
                          <div className="py-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                              <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-700 font-medium">
                              محصولی یافت نشد
                            </p>
                            <p className="text-gray-500 text-sm mt-1">
                              {searchQuery} را با کلمات دیگری جستجو کنید
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Popular Searches */}
                    {searchQuery.length <= 1 && (
                      <div className="p-4 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                          <FiTrendingUp className="w-4 h-4" />
                          پرجستجوترین‌ها
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {["تیشرت", "شلوار جین", "کفش", "مانتو"].map(
                            (term) => (
                              <button
                                key={term}
                                onClick={() => {
                                  setSearchQuery(term);
                                  saveSearchToRecent(term);
                                  searchProducts(term);
                                }}
                                className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors duration-200"
                              >
                                {term}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="lg:hidden p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <FiSearch className="w-5 h-5" />
            </button>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1">
              {/* Wishlist */}
              {/* Auth Buttons */}
              <div className="hidden md:flex items-center space-x-2 mx-4">
                {user || storeOwner ? (
                  // User or Store Owner is logged in - Show profile dropdown
                  <div className="relative">
                    <button
                      onClick={() =>
                        setIsProfileDropdownOpen(!isProfileDropdownOpen)
                      }
                      className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                          getUserType() === "user"
                            ? "bg-gradient-to-r from-purple-500 to-pink-500"
                            : "bg-gradient-to-r from-blue-500 to-cyan-500"
                        }`}
                      >
                        {getDisplayInitial()}
                      </div>
                      <span className="text-sm font-medium">
                        {getDisplayName()}
                      </span>
                      <FiChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                          isProfileDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {isProfileDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-end">
                          <p className="font-semibold text-sky-800">
                            {getDisplayName()} محترم
                          </p>
                          <div
                            className={`inline-flex items-center px-3 py-2 rounded-xl text-xs font-medium mt-1 ${
                              getUserType() === "user"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {getUserType() === "user" ? "مشتری" : "فروشنده"}
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="space-y-1 py-2">
                          <Link
                            href={getDashboardUrl()}
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <FiHome className="w-4 h-4" />
                            <span>پنل کاربری</span>
                          </Link>
                        </div>

                        {/* Logout Button */}
                        <div className="border-t border-gray-100 pt-2">
                          <button
                            onClick={openLogoutModal}
                            className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                          >
                            <FiLogOut className="w-4 h-4" />
                            <span>خروج از حساب</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // No one is logged in - Show signup button
                  <button
                    onClick={() => setIsSignupModalOpen(true)}
                    className="hover:bg-sky-50 text-black px-6 py-3 rounded-lg font-medium hover:shadow-xl transform transition-all duration-300 flex gap-x-2"
                  >
                    ثبت نام
                    <FiUser className="w-6 h-6 transition-transform duration-200" />
                  </button>
                )}
              </div>

              {/* Cart with Enhanced Design */}
              <div className="relative group">
                <Link href="/cart">
                  <button className="flex items-center justify-center w-12 h-12 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 relative">
                    <FiShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute top-1 right-0 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-lg transform group-hover:scale-110 transition-transform duration-200">
                        {cartCount > 99 ? "99+" : cartCount}
                      </span>
                    )}
                  </button>
                </Link>

                {/* Cart Tooltip */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                  سبد خرید ({cartCount} محصول)
                </div>
              </div>

              {/* Wishlist with Enhanced Design */}
              <div className="relative group">
                <Link href="/user/dashboard/wishlist">
                  <button className="flex items-center justify-center w-12 h-12 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 relative">
                    <FiHeart className="w-5 h-5" />
                    {wishlistCount > 0 && (
                      <span className="absolute top-1 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-lg transform group-hover:scale-110 transition-transform duration-200">
                        {wishlistCount > 99 ? "99+" : wishlistCount}
                      </span>
                    )}
                  </button>
                </Link>

                {/* Wishlist Tooltip */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                  علاقه‌مندی‌ها ({wishlistCount} محصول)
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden flex items-center justify-center w-12 h-12 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                {isMenuOpen ? (
                  <FiX className="w-6 h-6" />
                ) : (
                  <FiMenu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 backdrop-blur-md h-screen">
            <div className="py-6 space-y-6">
              {/* Mobile Auth Buttons */}
              <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
                {user || storeOwner ? (
                  // Mobile - User or Store Owner is logged in
                  <>
                    <div className="px-4 py-3 bg-gray-50 rounded-xl">
                      <p className="font-semibold text-gray-900">
                        {getDisplayName()}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {user?.phone ||
                          user?.email ||
                          storeOwner?.sellerPhone ||
                          storeOwner?.sellerEmail}
                      </p>
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          getUserType() === "user"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {getUserType() === "user" ? "مشتری" : "فروشنده"}
                      </div>
                    </div>
                    <Link
                      href={getDashboardUrl()}
                      className="flex items-center space-x-2 py-3 px-4 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FiHome className="w-4 h-4" />
                      <span>پنل کاربری</span>
                    </Link>
                    <Link
                      href={getProfileUrl()}
                      className="flex items-center space-x-2 py-3 px-4 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FiUser className="w-4 h-4" />
                      <span>پروفایل من</span>
                    </Link>
                    {storeOwner && (
                      <Link
                        href="/store/manage"
                        className="flex items-center space-x-2 py-3 px-4 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FiShoppingBag className="w-4 h-4" />
                        <span>مدیریت فروشگاه</span>
                      </Link>
                    )}
                    <button
                      onClick={openLogoutModal}
                      className="flex items-center space-x-2 py-3 px-4 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium text-right"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span>خروج از حساب</span>
                    </button>
                  </>
                ) : (
                  // Mobile - No one is logged in
                  <>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsSignupModalOpen(true);
                      }}
                      className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white py-3 px-4 rounded-xl font-medium text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-x-3"
                    >
                      <FiUser className="w-5 h-5" />
                      <span>ورود به حساب کاربری</span>
                    </button>
                  </>
                )}
              </div>

              {/* Mobile Quick Actions */}
              <div className="flex flex-col gap-y-2 space-x-4 pt-4 border-t border-gray-200">
                <Link
                  href="/user/dashboard/wishlist"
                  className="flex-1 flex items-center justify-center space-x-2 py-3 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiHeart className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    علاقه‌مندی‌ها
                    {wishlistCount > 0 && (
                      <span className="mr-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                        {wishlistCount}
                      </span>
                    )}
                  </span>
                </Link>
                <Link
                  href="/cart"
                  className="flex-1 flex items-center justify-center space-x-2 py-3 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiShoppingCart className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    سبد خرید
                    {cartCount > 0 && (
                      <span className="mr-2 bg-purple-100 text-purple-600 text-xs px-2 py-0.5 rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Search Overlay */}
        {isSearchOpen && (
          <div className="lg:hidden fixed inset-0 bg-white/95 backdrop-blur-md z-50">
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-center space-x-4 mb-6">
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 text-gray-600 hover:text-gray-900 rounded-lg"
                >
                  <FiX className="w-6 h-6" />
                </button>
                <h3 className="text-lg font-semibold text-gray-900">جستجو</h3>
              </div>

              <form onSubmit={handleSearchSubmit} className="mb-6">
                <div className="flex items-center bg-gray-50 rounded-2xl px-4 py-4 border border-gray-200">
                  <button type="submit">
                    <FiSearch className="text-gray-400 ml-3" />
                  </button>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="چه محصولی دنبالش هستید؟"
                    className="flex-1 bg-transparent border-none outline-none text-lg placeholder-gray-400"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </form>

              {/* Search Results */}
              {isSearching ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">در حال جستجو...</p>
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="flex-1 overflow-y-auto">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    نتایج جستجو
                  </h4>
                  <div className="space-y-3">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery("");
                          saveSearchToRecent(searchQuery);
                        }}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 border border-gray-100"
                      >
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.primary_image ? (
                            <img
                              src={product.primary_image}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <FiPackage className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 text-right">
                          <h5 className="text-sm font-medium text-gray-900">
                            {product.title}
                          </h5>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {product.category}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              {product.price.toLocaleString()} تومان
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && !searchQuery && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">
                          جستجوهای اخیر
                        </h4>
                        <button
                          onClick={clearRecentSearches}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          پاک کردن همه
                        </button>
                      </div>
                      <div className="space-y-2">
                        {recentSearches.map((term, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <button
                              onClick={() => {
                                setSearchQuery(term);
                                saveSearchToRecent(term);
                                searchProducts(term);
                              }}
                              className="flex-1 text-right py-3 px-4 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                            >
                              {term}
                            </button>
                            <button
                              onClick={() => removeRecentSearch(index)}
                              className="p-2 text-gray-400 hover:text-red-500"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Searches */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      پرجستجوترین‌ها
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {["تیشرت", "شلوار جین", "کفش", "مانتو", "لباس ورزشی"].map(
                        (term) => (
                          <button
                            key={term}
                            onClick={() => {
                              setSearchQuery(term);
                              saveSearchToRecent(term);
                              searchProducts(term);
                            }}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors duration-200 text-sm"
                          >
                            {term}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Signup Modal */}
        {isSignupModalOpen && (
          <div className="w-screen h-screen fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-95 hover:scale-100">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    انتخاب نوع حساب
                  </h3>
                  <button
                    onClick={() => setIsSignupModalOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors duration-200"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-gray-600 mt-2">
                  لطفاً نوع حساب کاربری خود را انتخاب کنید
                </p>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* Customer Option */}
                <Link
                  href="/auth/user-login"
                  onClick={() => handleSignupChoice("customer")}
                  className="flex items-center space-x-4 p-4 border-2 border-gray-200 hover:border-purple-500 rounded-xl transition-all duration-300 hover:shadow-lg group cursor-pointer"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-300">
                    <FiUserPlus className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">مشتری</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      برای خرید محصولات و استفاده از خدمات
                    </p>
                  </div>
                  <FiChevronDown className="w-5 h-5 text-gray-400 transform -rotate-90 group-hover:text-purple-600 transition-colors duration-200" />
                </Link>

                {/* Owner Option */}
                <Link
                  href="/auth/owner-login"
                  onClick={() => handleSignupChoice("owner")}
                  className="flex items-center space-x-4 p-4 border-2 border-gray-200 hover:border-blue-500 rounded-xl transition-all duration-300 hover:shadow-lg group cursor-pointer"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center group-hover:from-blue-200 group-hover:to-cyan-200 transition-all duration-300">
                    <Store className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">فروشنده</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      برای فروش محصولات و مدیریت فروشگاه
                    </p>
                  </div>
                  <FiChevronDown className="w-5 h-5 text-gray-400 transform -rotate-90 group-hover:text-blue-600 transition-colors duration-200" />
                </Link>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                <p className="text-gray-600 text-center text-sm">
                  قبلاً حساب دارید؟{" "}
                  <Link
                    href="/auth/user-login"
                    className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200"
                    onClick={() => setIsSignupModalOpen(false)}
                  >
                    وارد شوید
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Logout Confirmation Modal */}
        {isLogoutModalOpen && (
          <div className="w-screen h-screen fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-95 hover:scale-100">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    تأیید خروج
                  </h3>
                  <button
                    onClick={() => setIsLogoutModalOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors duration-200"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-gray-600 mt-2">
                  آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟
                </p>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-orange-100 rounded-full flex items-center justify-center">
                    <FiLogOut className="w-8 h-8 text-red-500" />
                  </div>
                </div>
                <p className="text-center text-gray-700">
                  پس از خروج، برای دسترسی به امکانات حساب کاربری باید مجدداً
                  وارد شوید.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex space-x-3">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-all duration-200"
                >
                  انصراف
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>بله، خارج می‌شوم</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
