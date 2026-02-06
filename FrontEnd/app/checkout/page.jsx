// app/checkout/page.js - UPDATED VERSION
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Wallet,
  Building,
  MapPin,
  User,
  Phone,
  Mail,
  Truck,
  Shield,
  CheckCircle,
  Clock,
  Package,
  AlertCircle,
  Lock,
  Loader2,
  Store,
  Home,
  ClipboardList,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

const paymentMethods = [
  {
    id: "online",
    name: "پرداخت آنلاین",
    description: "پرداخت امن با درگاه بانکی",
    icon: <CreditCard className="w-6 h-6" />,
    popular: true,
  },
  {
    id: "wallet",
    name: "کیف پول",
    description: "پرداخت از موجودی کیف پول",
    icon: <Wallet className="w-6 h-6" />,
    popular: false,
  },
  {
    id: "cash",
    name: "پرداخت در محل",
    description: "پرداخت نقدی هنگام تحویل",
    icon: <Building className="w-6 h-6" />,
    popular: false,
  },
];

const shippingMethods = [
  {
    id: "express",
    name: "پست پیشتاز",
    description: "تحویل ۱-۲ روز کاری",
    cost: 25000,
    freeThreshold: 500000,
    icon: <Truck className="w-5 h-5" />,
  },
  {
    id: "regular",
    name: "پست معمولی",
    description: "تحویل ３-۵ روز کاری",
    cost: 15000,
    freeThreshold: 300000,
    icon: <Package className="w-5 h-5" />,
  },
  {
    id: "free",
    name: "ارسال رایگان",
    description: "تحویل ４-۷ روز کاری",
    cost: 0,
    freeThreshold: 1000000,
    icon: <CheckCircle className="w-5 h-5" />,
  },
];

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
    return parseFloat(price.replace(/,/g, ""));
  }
  return price || 0;
};

// Function to parse API errors
const parseAPIError = (errorData) => {
  console.log("Raw error data:", errorData);

  if (typeof errorData === "string") {
    return errorData;
  }

  if (Array.isArray(errorData)) {
    // Handle array of errors (like your example: ['محصول Foodd موجود نیست یا موجودی کافی ندارد'])
    return errorData
      .map((err) => {
        if (typeof err === "string") return err;
        if (err.message) return err.message;
        if (err.detail) return err.detail;
        return JSON.stringify(err);
      })
      .join(" | ");
  }

  if (typeof errorData === "object") {
    if (errorData.detail) {
      return errorData.detail;
    }

    if (errorData.message) {
      return errorData.message;
    }

    if (errorData.non_field_errors) {
      if (Array.isArray(errorData.non_field_errors)) {
        return errorData.non_field_errors.join(" | ");
      }
      return errorData.non_field_errors;
    }

    // Handle field-specific errors
    const fieldErrors = [];
    for (const [field, errors] of Object.entries(errorData)) {
      if (Array.isArray(errors)) {
        fieldErrors.push(`${field}: ${errors.join(", ")}`);
      } else if (typeof errors === "string") {
        fieldErrors.push(`${field}: ${errors}`);
      }
    }

    if (fieldErrors.length > 0) {
      return fieldErrors.join(" | ");
    }

    return JSON.stringify(errorData);
  }

  return "خطای ناشناخته سرور";
};

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Information, 2: Review, 3: Payment
  const [expandedSection, setExpandedSection] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    // Shipping Information
    shipping_address: {
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      postalCode: "",
      phone: "",
      note: "",
    },
    // Billing Information
    same_as_shipping: true,
    billing_address: {
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      postalCode: "",
      phone: "",
    },
    // Order Details
    shipping_method: "express",
    payment_method: "online",
    accept_terms: false,
    newsletter: false,
  });

  const [errors, setErrors] = useState({});
  const [checkoutData, setCheckoutData] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("لطفا ابتدا وارد حساب کاربری خود شوید");
        router.push("/auth/user-login");
        return;
      }

      // Load checkout data from localStorage
      const savedCheckoutData = localStorage.getItem("checkoutData");
      if (!savedCheckoutData) {
        toast.error("سبد خرید شما خالی است");
        router.push("/cart");
        return;
      }

      const parsedData = JSON.parse(savedCheckoutData);
      console.log("Checkout data loaded:", parsedData);
      setCheckoutData(parsedData);

      // Load user info from API
      try {
        const response = await fetch(`${API_BASE_URL}/users/me/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          console.log("User data loaded:", userData);
          setUserInfo(userData);

          // Pre-fill form with user info
          setFormData((prev) => ({
            ...prev,
            shipping_address: {
              ...prev.shipping_address,
              firstName: userData.first_name || "",
              lastName: userData.last_name || "",
              phone: userData.phone || "",
              city: userData.city || "",
              postalCode: userData.post_code || "",
            },
          }));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    } catch (error) {
      console.error("Checkout data load error:", error);
      toast.error("خطا در بارگذاری اطلاعات");
      router.push("/cart");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    if (!checkoutData?.totals) {
      return {
        subtotal: 0,
        shipping: 0,
        discount: 0,
        total: 0,
        itemsCount: 0,
        productsCount: 0,
      };
    }

    const { subtotal, discount, itemsCount, productsCount } =
      checkoutData.totals;

    const selectedShipping = shippingMethods.find(
      (method) => method.id === formData.shipping_method
    );
    let shippingCost = selectedShipping?.cost || 0;

    // Apply free shipping if order meets threshold
    if (subtotal >= (selectedShipping?.freeThreshold || Infinity)) {
      shippingCost = 0;
    }

    const total = Math.max(0, subtotal + shippingCost - discount);

    return {
      subtotal,
      shipping: shippingCost,
      discount,
      total,
      itemsCount,
      productsCount,
      freeShipping: shippingCost === 0,
    };
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [section, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // If "same as shipping" is checked, copy shipping to billing
    if (name === "same_as_shipping" && checked) {
      setFormData((prev) => ({
        ...prev,
        billing_address: { ...prev.shipping_address },
      }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    const shipping = formData.shipping_address;

    // Shipping validation
    if (!shipping.firstName.trim()) {
      newErrors["shipping_address.firstName"] = "نام الزامی است";
    }
    if (!shipping.lastName.trim()) {
      newErrors["shipping_address.lastName"] = "نام خانوادگی الزامی است";
    }
    if (!shipping.phone.trim()) {
      newErrors["shipping_address.phone"] = "شماره تماس الزامی است";
    } else if (!/^09\d{9}$/.test(shipping.phone.replace(/\s/g, ""))) {
      newErrors["shipping_address.phone"] = "شماره تماس نامعتبر است";
    }
    if (!shipping.city.trim()) {
      newErrors["shipping_address.city"] = "شهر الزامی است";
    }
    if (!shipping.address.trim()) {
      newErrors["shipping_address.address"] = "آدرس الزامی است";
    }
    if (!shipping.postalCode.trim()) {
      newErrors["shipping_address.postalCode"] = "کد پستی الزامی است";
    } else if (!/^\d{10}$/.test(shipping.postalCode)) {
      newErrors["shipping_address.postalCode"] = "کد پستی باید ۱۰ رقم باشد";
    }

    // Billing validation if not same as shipping
    if (!formData.same_as_shipping) {
      const billing = formData.billing_address;
      if (!billing.firstName.trim()) {
        newErrors["billing_address.firstName"] = "نام الزامی است";
      }
      if (!billing.lastName.trim()) {
        newErrors["billing_address.lastName"] = "نام خانوادگی الزامی است";
      }
      if (!billing.city.trim()) {
        newErrors["billing_address.city"] = "شهر الزامی است";
      }
      if (!billing.address.trim()) {
        newErrors["billing_address.address"] = "آدرس الزامی است";
      }
      if (!billing.postalCode.trim()) {
        newErrors["billing_address.postalCode"] = "کد پستی الزامی است";
      } else if (!/^\d{10}$/.test(billing.postalCode)) {
        newErrors["billing_address.postalCode"] = "کد پستی باید ۱۰ رقم باشد";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && !validateStep1()) {
      toast.error("لطفا اطلاعات ضروری را تکمیل کنید");
      return;
    }

    if (step === 2 && !formData.accept_terms) {
      toast.error("لطفا شرایط و ضوابط را تأیید کنید");
      return;
    }

    setStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Function to remove products from cart after successful order
  const removeProductsFromCart = async (productIds) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      // Remove each product from cart
      for (const productId of productIds) {
        try {
          const response = await fetch(
            `${API_BASE_URL}/carts/me/remove-item/${productId}/`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            console.warn(`Failed to remove product ${productId} from cart`);
          }
        } catch (error) {
          console.error(
            `Error removing product ${productId} from cart:`,
            error
          );
        }
      }

      // Also clear the entire cart as a backup
      try {
        await fetch(`${API_BASE_URL}/carts/me/clear/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Error clearing cart:", error);
      }
    } catch (error) {
      console.error("Error in removeProductsFromCart:", error);
    }
  };

  const handleSubmitOrder = async () => {
    if (!formData.accept_terms) {
      toast.error("لطفا شرایط و ضوابط را تأیید کنید");
      return;
    }

    setSubmitting(true);

    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("لطفا ابتدا وارد حساب کاربری خود شوید");
        return;
      }

      if (!checkoutData?.items || checkoutData.items.length === 0) {
        toast.error("سبد خرید شما خالی است");
        return;
      }

      const { total } = calculateTotals();

      // Extract product IDs to remove from cart later
      const productIdsToRemove = checkoutData.items.map(
        (item) => item.product_id
      );

      // Prepare order data according to your API
      const orderData = {
        cart_items: checkoutData.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price_snapshot: item.price_snapshot,
          color: item.color,
          size: item.size,
        })),
        shipping_address: formData.shipping_address,
        payment_method: formData.payment_method,
        total_amount: total,
        note: formData.shipping_address.note || "",
      };

      console.log("Submitting order:", orderData);

      // Submit order to API
      const response = await fetch(`${API_BASE_URL}/orders/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        let errorMessage = "خطا در ثبت سفارش";

        try {
          const errorData = await response.json();
          console.error("Order submission error data:", errorData);

          // Parse the API error message
          const parsedError = parseAPIError(errorData);
          errorMessage = parsedError;

          // Show specific error in toast
          toast.error(parsedError, {
            duration: 5000,
            style: {
              maxWidth: "500px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            },
          });

          // Log detailed error for debugging
          console.error("Order submission error:", parsedError);

          // If it's a stock/product availability error, redirect to cart
          if (
            parsedError.includes("موجودی") ||
            parsedError.includes("موجود نیست")
          ) {
            setTimeout(() => {
              router.push("/cart");
            }, 3000);
          }

          throw new Error(parsedError);
        } catch (jsonError) {
          // If we can't parse JSON, use HTTP status
          console.error("Error parsing error response:", jsonError);
          errorMessage = `خطای سرور: ${response.status} ${response.statusText}`;
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      }

      const orderResult = await response.json();
      console.log("Order created successfully:", orderResult);

      // ✅ CRITICAL: Remove ordered products from cart
      try {
        await removeProductsFromCart(productIdsToRemove);
        console.log("Products removed from cart successfully");
        toast.success("محصولات با موفقیت از سبد خرید حذف شدند");
      } catch (cartError) {
        console.error("Error removing products from cart:", cartError);
        toast.error("خطا در حذف محصولات از سبد خرید");
        // Continue even if cart cleanup fails - order is already created
      }

      // Clear checkout data from localStorage
      localStorage.removeItem("checkoutData");

      // Also clear any cart data from localStorage
      localStorage.removeItem("cartData");

      toast.success("سفارش با موفقیت ثبت شد!", {
        duration: 4000,
      });

      // Redirect to order confirmation page
      setTimeout(() => {
        router.push(`/order-confirmation/${orderResult.data[0].id}`);
      }, 1500);
    } catch (error) {
      console.error("Order submission catch error:", error);
      // Don't show another toast here since we already showed it above
      // unless it's a different error
      if (
        !error.message?.includes("خطا در ثبت سفارش") &&
        !error.message?.includes("موجودی") &&
        !error.message?.includes("موجود نیست")
      ) {
        toast.error(error.message || "خطای ناشناخته در ثبت سفارش");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getError = (fieldName) => {
    return errors[fieldName];
  };

  const {
    subtotal,
    shipping,
    discount,
    total,
    itemsCount,
    productsCount,
    freeShipping,
  } = calculateTotals();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!getAuthToken()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            نیاز به ورود به حساب کاربری
          </h2>
          <p className="text-gray-600 mb-8">
            برای تکمیل خرید، لطفا وارد حساب کاربری خود شوید
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

      <div className="min-h-screen bg-gray-50 py-12 font-vazirmatn" dir="rtl">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    تکمیل خرید
                  </h1>
                  <p className="text-gray-600 mt-2">
                    لطفا اطلاعات خود را تکمیل و سفارش را نهایی کنید
                  </p>
                </div>
                <Link
                  href="/cart"
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <ArrowLeft className="w-4 h-4 ml-1" />
                  بازگشت به سبد خرید
                </Link>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center">
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 ${
                        step >= 1 ? "bg-blue-600" : "bg-gray-300"
                      } text-white rounded-full flex items-center justify-center`}
                    >
                      {step > 1 ? <CheckCircle className="w-5 h-5" /> : "۱"}
                    </div>
                    <span
                      className={`mr-2 font-medium ${
                        step >= 1 ? "text-blue-600" : "text-gray-500"
                      }`}
                    >
                      اطلاعات ارسال
                    </span>
                  </div>
                  <div className="w-16 h-0.5 bg-gray-300 mx-4"></div>
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 ${
                        step >= 2 ? "bg-blue-600" : "bg-gray-300"
                      } text-white rounded-full flex items-center justify-center`}
                    >
                      {step > 2 ? <CheckCircle className="w-5 h-5" /> : "۲"}
                    </div>
                    <span
                      className={`mr-2 font-medium ${
                        step >= 2 ? "text-blue-600" : "text-gray-500"
                      }`}
                    >
                      بازبینی سفارش
                    </span>
                  </div>
                  <div className="w-16 h-0.5 bg-gray-300 mx-4"></div>
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 ${
                        step >= 3 ? "bg-blue-600" : "bg-gray-300"
                      } text-white rounded-full flex items-center justify-center`}
                    >
                      ۳
                    </div>
                    <span
                      className={`mr-2 font-medium ${
                        step >= 3 ? "text-blue-600" : "text-gray-500"
                      }`}
                    >
                      پرداخت
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Main Form */}
              <div className="lg:col-span-2">
                {step === 1 && (
                  <>
                    {/* Shipping Information */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
                      <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                            <MapPin className="w-5 h-5 ml-2" />
                            اطلاعات ارسال
                          </h2>
                          <span className="text-sm text-blue-600">
                            مرحله ۱ از ۳
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <User className="w-4 h-4 ml-1" />
                                نام <span className="text-red-500 mr-1">*</span>
                              </label>
                              <input
                                type="text"
                                name="shipping_address.firstName"
                                value={formData.shipping_address.firstName}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  getError("shipping_address.firstName")
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300"
                                }`}
                                placeholder="نام"
                              />
                              {getError("shipping_address.firstName") && (
                                <p className="mt-2 text-sm text-red-600">
                                  {getError("shipping_address.firstName")}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                نام خانوادگی{" "}
                                <span className="text-red-500 mr-1">*</span>
                              </label>
                              <input
                                type="text"
                                name="shipping_address.lastName"
                                value={formData.shipping_address.lastName}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  getError("shipping_address.lastName")
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300"
                                }`}
                                placeholder="نام خانوادگی"
                              />
                              {getError("shipping_address.lastName") && (
                                <p className="mt-2 text-sm text-red-600">
                                  {getError("shipping_address.lastName")}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <Phone className="w-4 h-4 ml-1" />
                                شماره تماس{" "}
                                <span className="text-red-500 mr-1">*</span>
                              </label>
                              <input
                                type="tel"
                                name="shipping_address.phone"
                                value={formData.shipping_address.phone}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  getError("shipping_address.phone")
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300"
                                }`}
                                placeholder="09123456789"
                              />
                              {getError("shipping_address.phone") && (
                                <p className="mt-2 text-sm text-red-600">
                                  {getError("shipping_address.phone")}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                شهر <span className="text-red-500 mr-1">*</span>
                              </label>
                              <input
                                type="text"
                                name="shipping_address.city"
                                value={formData.shipping_address.city}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  getError("shipping_address.city")
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300"
                                }`}
                                placeholder="شهر"
                              />
                              {getError("shipping_address.city") && (
                                <p className="mt-2 text-sm text-red-600">
                                  {getError("shipping_address.city")}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                کد پستی{" "}
                                <span className="text-red-500 mr-1">*</span>
                              </label>
                              <input
                                type="text"
                                name="shipping_address.postalCode"
                                value={formData.shipping_address.postalCode}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  getError("shipping_address.postalCode")
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300"
                                }`}
                                placeholder="۱۰ رقمی"
                                maxLength="10"
                              />
                              {getError("shipping_address.postalCode") && (
                                <p className="mt-2 text-sm text-red-600">
                                  {getError("shipping_address.postalCode")}
                                </p>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              آدرس کامل{" "}
                              <span className="text-red-500 mr-1">*</span>
                            </label>
                            <textarea
                              name="shipping_address.address"
                              value={formData.shipping_address.address}
                              onChange={handleChange}
                              rows="3"
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                getError("shipping_address.address")
                                  ? "border-red-500 bg-red-50"
                                  : "border-gray-300"
                              }`}
                              placeholder="خیابان، کوچه، پلاک، طبقه، واحد"
                            />
                            {getError("shipping_address.address") && (
                              <p className="mt-2 text-sm text-red-600">
                                {getError("shipping_address.address")}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              یادداشت برای فروشنده (اختیاری)
                            </label>
                            <textarea
                              name="shipping_address.note"
                              value={formData.shipping_address.note}
                              onChange={handleChange}
                              rows="2"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="درخواست خاص یا توضیح درباره سفارش"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Method */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
                      <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                          <Truck className="w-5 h-5 ml-2" />
                          روش ارسال
                        </h2>
                      </div>

                      <div className="p-6">
                        <div className="space-y-4">
                          {shippingMethods.map((method) => (
                            <label
                              key={method.id}
                              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                                formData.shipping_method === method.id
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  name="shipping_method"
                                  value={method.id}
                                  checked={
                                    formData.shipping_method === method.id
                                  }
                                  onChange={handleChange}
                                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <div className="mr-3">
                                  <div className="flex items-center">
                                    {method.icon}
                                    <span className="font-medium text-gray-900 mr-2">
                                      {method.name}
                                    </span>
                                    {(method.cost === 0 ||
                                      (subtotal >= method.freeThreshold &&
                                        method.cost > 0)) && (
                                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                        رایگان
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {method.description}
                                  </p>
                                </div>
                              </div>
                              <div className="text-left">
                                {method.cost === 0 ||
                                (subtotal >= method.freeThreshold &&
                                  method.cost > 0) ? (
                                  <span className="text-green-600 font-medium">
                                    رایگان
                                  </span>
                                ) : (
                                  <span className="font-medium text-gray-900">
                                    {formatPrice(method.cost)}
                                  </span>
                                )}
                                {subtotal < method.freeThreshold &&
                                  method.freeThreshold &&
                                  method.cost > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      رایگان برای سفارشات بالای{" "}
                                      {formatPrice(method.freeThreshold)}
                                    </p>
                                  )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Next Step Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={handleNextStep}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      >
                        ادامه به مرحله بعد
                        <ArrowLeft className="w-5 h-5 mr-2" />
                      </button>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    {/* Order Review */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
                      <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-semibold text-gray-900">
                            بازبینی سفارش
                          </h2>
                          <span className="text-sm text-blue-600">
                            مرحله ۲ از ۳
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        {/* Order Items */}
                        <div className="mb-8">
                          <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                            <ClipboardList className="w-5 h-5 ml-2" />
                            محصولات سفارش
                          </h3>
                          <div className="space-y-4">
                            {checkoutData?.items?.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                              >
                                <div className="flex items-center">
                                  {item.product?.images?.[0] ? (
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden ml-4">
                                      <img
                                        src={
                                          item.product.images[0].url ||
                                          item.product.images[0]
                                        }
                                        alt={item.product.title}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center ml-4">
                                      <Package className="w-8 h-8 text-gray-400" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {item.product?.title || "محصول"}
                                    </p>
                                    <div className="flex items-center mt-1 text-sm text-gray-600">
                                      {item.color && (
                                        <span className="ml-3">
                                          رنگ: {item.color}
                                        </span>
                                      )}
                                      {item.size && (
                                        <span>سایز: {item.size}</span>
                                      )}
                                      <span className="mr-4">
                                        تعداد: {item.quantity}
                                      </span>
                                    </div>
                                    <div className="flex items-center mt-1 text-xs text-gray-500">
                                      <Store className="w-3 h-3 ml-1" />
                                      <span>
                                        {item.store?.store_name ||
                                          item.store?.full_name ||
                                          "فروشگاه"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-left">
                                  <p className="font-bold text-gray-900">
                                    {formatPrice(
                                      item.price_snapshot * item.quantity
                                    )}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    هر عدد: {formatPrice(item.price_snapshot)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shipping Information */}
                        <div className="mb-8">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium text-gray-900 flex items-center">
                              <MapPin className="w-5 h-5 ml-2" />
                              اطلاعات ارسال
                            </h3>
                            <button
                              onClick={() => setStep(1)}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              ویرایش
                            </button>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="font-medium text-gray-900">
                              {formData.shipping_address.firstName}{" "}
                              {formData.shipping_address.lastName}
                            </p>
                            <p className="text-gray-600 mt-1">
                              {formData.shipping_address.address}
                            </p>
                            <div className="flex items-center mt-2 text-sm text-gray-500">
                              <span className="ml-3">
                                {formData.shipping_address.city}
                              </span>
                              <span>
                                کد پستی: {formData.shipping_address.postalCode}
                              </span>
                              <span className="mr-4">
                                تلفن: {formData.shipping_address.phone}
                              </span>
                            </div>
                            {formData.shipping_address.note && (
                              <p className="mt-2 text-sm text-gray-600">
                                <span className="font-medium">یادداشت:</span>{" "}
                                {formData.shipping_address.note}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Payment Method */}
                        <div className="mb-8">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium text-gray-900 flex items-center">
                              <CreditCard className="w-5 h-5 ml-2" />
                              روش پرداخت
                            </h3>
                            <button
                              onClick={() =>
                                setExpandedSection(
                                  expandedSection === "payment"
                                    ? null
                                    : "payment"
                                )
                              }
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              {expandedSection === "payment" ? "بستن" : "تغییر"}
                            </button>
                          </div>

                          {expandedSection === "payment" ? (
                            <div className="space-y-4">
                              {paymentMethods.map((method) => (
                                <label
                                  key={method.id}
                                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                                    formData.payment_method === method.id
                                      ? "border-blue-500 bg-blue-50"
                                      : "border-gray-200 hover:border-gray-300"
                                  }`}
                                >
                                  <div className="flex items-center">
                                    <input
                                      type="radio"
                                      name="payment_method"
                                      value={method.id}
                                      checked={
                                        formData.payment_method === method.id
                                      }
                                      onChange={handleChange}
                                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <div className="mr-3">
                                      <div className="flex items-center">
                                        {method.icon}
                                        <span className="font-medium text-gray-900 mr-2">
                                          {method.name}
                                        </span>
                                        {method.popular && (
                                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                            محبوب
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {method.description}
                                      </p>
                                    </div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-center">
                                {
                                  paymentMethods.find(
                                    (m) => m.id === formData.payment_method
                                  )?.icon
                                }
                                <span className="mr-2 font-medium">
                                  {
                                    paymentMethods.find(
                                      (m) => m.id === formData.payment_method
                                    )?.name
                                  }
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Terms and Conditions */}
                        <div className="border-t border-gray-200 pt-6">
                          <div className="flex items-start">
                            <input
                              type="checkbox"
                              id="accept_terms"
                              name="accept_terms"
                              checked={formData.accept_terms}
                              onChange={handleChange}
                              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                            />
                            <label
                              htmlFor="accept_terms"
                              className="mr-3 text-gray-900"
                            >
                              <span className="font-medium">شرایط و ضوابط</span>{" "}
                              را مطالعه کرده‌ام و با آن‌ها موافقم. این شامل{" "}
                              <Link
                                href="/terms"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                شرایط استفاده
                              </Link>
                              ،{" "}
                              <Link
                                href="/privacy"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                حریم خصوصی
                              </Link>{" "}
                              و{" "}
                              <Link
                                href="/return-policy"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                سیاست بازگشت کالا
                              </Link>{" "}
                              می‌شود.
                            </label>
                          </div>
                          {step === 2 && !formData.accept_terms && (
                            <p className="mt-2 text-sm text-red-600">
                              برای ادامه باید شرایط و ضوابط را تأیید کنید
                            </p>
                          )}
                        </div>

                        {/* Newsletter */}
                        <div className="mt-6">
                          <div className="flex items-start">
                            <input
                              type="checkbox"
                              id="newsletter"
                              name="newsletter"
                              checked={formData.newsletter}
                              onChange={handleChange}
                              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                            />
                            <label
                              htmlFor="newsletter"
                              className="mr-3 text-gray-900"
                            >
                              مایلم از اخبار و پیشنهادات ویژه فروشگاه مطلع شوم.
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={handlePrevStep}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                      >
                        <ArrowRight className="w-5 h-5 ml-2" />
                        بازگشت به مرحله قبل
                      </button>
                      <button
                        onClick={handleNextStep}
                        disabled={!formData.accept_terms}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ادامه به پرداخت
                        <ArrowLeft className="w-5 h-5 mr-2" />
                      </button>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    {/* Payment */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
                      <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-semibold text-gray-900">
                            پرداخت
                          </h2>
                          <span className="text-sm text-blue-600">
                            مرحله ۳ از ۳
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        {/* Payment Method Summary */}
                        <div className="mb-8">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium text-gray-900">
                              روش پرداخت انتخاب شده
                            </h3>
                            <button
                              onClick={() => setStep(2)}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              تغییر
                            </button>
                          </div>
                          <div className="bg-gray-50 p-6 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                {
                                  paymentMethods.find(
                                    (m) => m.id === formData.payment_method
                                  )?.icon
                                }
                                <div className="mr-3">
                                  <p className="font-medium text-gray-900">
                                    {
                                      paymentMethods.find(
                                        (m) => m.id === formData.payment_method
                                      )?.name
                                    }
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {
                                      paymentMethods.find(
                                        (m) => m.id === formData.payment_method
                                      )?.description
                                    }
                                  </p>
                                </div>
                              </div>
                              <div className="text-left">
                                <p className="text-2xl font-bold text-gray-900">
                                  {formatPrice(total)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  مبلغ قابل پرداخت
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Payment Security */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                          <div className="flex items-center mb-4">
                            <Shield className="w-6 h-6 text-blue-600 ml-2" />
                            <h3 className="font-medium text-blue-900">
                              پرداخت امن
                            </h3>
                          </div>
                          <ul className="space-y-2 text-blue-800">
                            <li className="flex items-start">
                              <CheckCircle className="w-5 h-5 text-green-500 ml-2 mt-0.5" />
                              <span>
                                کلیه پرداخت‌ها با پروتکل امن SSL انجام می‌شود
                              </span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle className="w-5 h-5 text-green-500 ml-2 mt-0.5" />
                              <span>
                                اطلاعات کارت بانکی شما نزد درگاه پرداخت محفوظ
                                است
                              </span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle className="w-5 h-5 text-green-500 ml-2 mt-0.5" />
                              <span>
                                گارانتی بازگشت وجه در صورت عدم دریافت کالا
                              </span>
                            </li>
                          </ul>
                        </div>

                        {/* Final Warning */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                          <div className="flex items-center mb-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 ml-2" />
                            <h3 className="font-medium text-yellow-900">
                              توجه مهم
                            </h3>
                          </div>
                          <p className="text-yellow-800">
                            پس از کلیک بر روی دکمه پرداخت و ثبت نهایی سفارش، به
                            درگاه بانکی هدایت می‌شوید. لطفا تا تکمیل عملیات
                            پرداخت، صفحه را ترک نکنید.
                          </p>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between">
                          <button
                            onClick={handlePrevStep}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                          >
                            <ArrowRight className="w-5 h-5 ml-2" />
                            بازگشت به مرحله قبل
                          </button>
                          <button
                            onClick={handleSubmitOrder}
                            disabled={submitting || !formData.accept_terms}
                            className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                                در حال پردازش...
                              </>
                            ) : (
                              <>
                                <Lock className="w-5 h-5 ml-2" />
                                پرداخت و ثبت نهایی سفارش
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
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
                            freeShipping ? "text-green-600" : "text-gray-900"
                          }
                        >
                          {freeShipping ? "رایگان" : formatPrice(shipping)}
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
                        هزینه نهایی پس از تأیید پرداخت محاسبه می‌شود
                      </p>
                    </div>

                    {/* Order Benefits */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                          <span>
                            تحویل رایگان برای سفارش‌های بالای ۵۰۰ هزار تومان
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                          <span>گارانتی بازگشت وجه ۷ روزه</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                          <span>پشتیبانی ۲۴ ساعته</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Need Help */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Phone className="w-5 h-5 ml-2" />
                    نیاز به راهنمایی دارید؟
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <p className="font-medium text-gray-900">۰۲۱-۱۲۳۴۵۶۷۸</p>
                      <p className="text-sm text-gray-500">پشتیبانی تلفنی</p>
                    </div>
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <p className="font-medium text-gray-900">
                        هر روز ۹ صبح تا ۹ شب
                      </p>
                      <p className="text-sm text-gray-500">ساعات کاری</p>
                    </div>
                  </div>
                </div>

                {/* Security Badges */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center mb-4">
                    <Shield className="w-6 h-6 ml-2" />
                    <h3 className="font-semibold">خرید امن از فروشگاه ما</h3>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-white rounded-full ml-2"></div>
                      <span>گواهی نماد الکترونیکی</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-white rounded-full ml-2"></div>
                      <span>درگاه پرداخت امن بانکی</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-white rounded-full ml-2"></div>
                      <span>حریم خصوصی اطلاعات</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
