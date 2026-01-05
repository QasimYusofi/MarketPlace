// components/Header.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  User,
  Heart,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Plus,
  Minus,
  Store,
  Package,
  Clock,
  Shield,
} from "lucide-react";

const Header = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  const cartRef = useRef(null);
  const userMenuRef = useRef(null);

  // Sample cart data - replace with your actual cart state
  useEffect(() => {
    // Mock cart items
    setCartItems([
      {
        id: 1,
        name: "گوشی موبایل سامسونگ گلکسی S24",
        price: 25000000,
        quantity: 1,
        image: "/api/placeholder/80/80",
        stock: 10,
        store: "دیجی کالا",
      },
      {
        id: 2,
        name: "هدفون بی سیم Sony WH-1000XM4",
        price: 12000000,
        quantity: 2,
        image: "/api/placeholder/80/80",
        stock: 5,
        store: "فروشگاه صوتی",
      },
    ]);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsCartOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCheckout = () => {
    router.push("/checkout");
    setIsCartOpen(false);
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 rtl:space-x-reverse">
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Shield className="h-4 w-4" />
                <span>تضمین بهترین قیمت</span>
              </div>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Package className="h-4 w-4" />
                <span>ارسال رایگان برای خریدهای بالای 500 هزار تومان</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
              <span>پشتیبانی: 021-12345678</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-lg shadow-2xl border-b border-gray-200"
            : "bg-white shadow-lg"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => router.push("/")}
                className="flex items-center space-x-2 rtl:space-x-reverse"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  فروشگاه
                </span>
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8 rtl:space-x-reverse">
              {[
                { name: "خانه", href: "/" },
                { name: "فروشگاه‌ها", href: "/stores" },
                { name: "دسته‌بندی‌ها", href: "/categories" },
                { name: "تخفیف‌ها", href: "/offers" },
                { name: "پرفروش‌ها", href: "/best-sellers" },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                </button>
              ))}
            </nav>

            {/* Right Section - Search, Cart, User */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Wishlist */}
              <button
                onClick={() => router.push("/wishlist")}
                className="hidden sm:flex p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 relative"
              >
                <Heart className="h-5 w-5" />
                <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  ۳
                </span>
              </button>

              {/* Cart */}
              <div className="relative" ref={cartRef}>
                <button
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  className="flex items-center p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 relative"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -left-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>

                {/* Cart Dropdown */}
                {isCartOpen && (
                  <div className="absolute left-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg text-gray-900">
                          سبد خرید
                        </h3>
                        <span className="text-sm text-gray-600">
                          {totalItems} کالا
                        </span>
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {cartItems.length === 0 ? (
                        <div className="p-8 text-center">
                          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 mb-4">
                            سبد خرید شما خالی است
                          </p>
                          <button
                            onClick={() => router.push("/products")}
                            className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                          >
                            مشاهده محصولات
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Cart Items */}
                          <div className="p-4 space-y-4">
                            {cartItems.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center space-x-3 rtl:space-x-reverse bg-gray-50 rounded-xl p-3"
                              >
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                                    {item.name}
                                  </h4>
                                  <p className="text-xs text-gray-500 mb-2">
                                    {item.store}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-gray-900">
                                      {item.price.toLocaleString()} تومان
                                    </span>
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                      {/* Quantity Controls */}
                                      <div className="flex items-center space-x-1 rtl:space-x-reverse bg-white rounded-lg border border-gray-300">
                                        <button
                                          onClick={() =>
                                            updateQuantity(
                                              item.id,
                                              item.quantity - 1
                                            )
                                          }
                                          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                          disabled={item.quantity <= 1}
                                        >
                                          <Minus className="h-3 w-3" />
                                        </button>
                                        <span className="px-2 text-sm font-medium min-w-8 text-center">
                                          {item.quantity}
                                        </span>
                                        <button
                                          onClick={() =>
                                            updateQuantity(
                                              item.id,
                                              item.quantity + 1
                                            )
                                          }
                                          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                          disabled={item.quantity >= item.stock}
                                        >
                                          <Plus className="h-3 w-3" />
                                        </button>
                                      </div>

                                      {/* Remove Button */}
                                      <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Cart Summary */}
                          <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-gray-600">جمع کل:</span>
                              <span className="text-2xl font-bold text-gray-900">
                                {cartTotal.toLocaleString()} تومان
                              </span>
                            </div>

                            <div className="space-y-2">
                              <button
                                onClick={handleCheckout}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                              >
                                ادامه فرآیند خرید
                              </button>
                              <button
                                onClick={() => router.push("/cart")}
                                className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                              >
                                مشاهده سبد خرید
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 rtl:space-x-reverse p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                >
                  <User className="h-5 w-5" />
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                    <div className="p-2">
                      {[
                        { name: "پروفایل من", href: "/profile", icon: User },
                        { name: "سفارشات من", href: "/orders", icon: Package },
                        {
                          name: "لیست علاقه‌مندی‌ها",
                          href: "/wishlist",
                          icon: Heart,
                        },
                        {
                          name: "تاریخچه بازدید",
                          href: "/history",
                          icon: Clock,
                        },
                      ].map((item) => (
                        <button
                          key={item.name}
                          onClick={() => {
                            router.push(item.href);
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center space-x-2 rtl:space-x-reverse w-full px-4 py-3 text-right text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </button>
                      ))}

                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <button className="flex items-center space-x-2 rtl:space-x-reverse w-full px-4 py-3 text-right text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
                          <X className="h-4 w-4" />
                          <span>خروج از حساب</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {isSearchOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="flex-1 relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="چه محصولی دنبال می‌گردید؟..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                </div>
              </div>

              {/* Search Suggestions */}
              <div className="p-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 mb-3">
                    پربحث‌ترین جستجوها
                  </h4>
                  {[
                    "گوشی موبایل",
                    "لپ تاپ",
                    "هدفون",
                    "کفش ورزشی",
                    "لباس مردانه",
                  ].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchQuery(term);
                        // Perform search
                      }}
                      className="flex items-center space-x-2 rtl:space-x-reverse w-full p-3 text-right hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Search className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden">
            <div className="bg-white h-full w-80 max-w-full rtl:right-0 ltr:left-0 shadow-2xl">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => router.push("/")}
                    className="flex items-center space-x-2 rtl:space-x-reverse"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Store className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      فروشگاه
                    </span>
                  </button>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <nav className="p-4 space-y-2">
                {[
                  { name: "خانه", href: "/" },
                  { name: "فروشگاه‌ها", href: "/stores" },
                  { name: "دسته‌بندی‌ها", href: "/categories" },
                  { name: "تخفیف‌ها", href: "/offers" },
                  { name: "پرفروش‌ها", href: "/best-sellers" },
                  { name: "پروفایل من", href: "/profile" },
                  { name: "سفارشات من", href: "/orders" },
                  { name: "لیست علاقه‌مندی‌ها", href: "/wishlist" },
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      router.push(item.href);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 rtl:space-x-reverse w-full p-4 text-right text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors duration-200 border border-gray-100"
                  >
                    <span className="font-medium">{item.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
