// app/checkout/page.js
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
  ChevronDown,
  ChevronUp,
  Lock,
  RefreshCw,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

const BASE_API = process.env.NEXT_PUBLIC_API_URL;

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
    description: "تحویل ۳-۵ روز کاری",
    cost: 15000,
    freeThreshold: 300000,
    icon: <Package className="w-5 h-5" />,
  },
  {
    id: "free",
    name: "ارسال رایگان",
    description: "تحویل ۴-۷ روز کاری",
    cost: 0,
    freeThreshold: 1000000,
    icon: <CheckCircle className="w-5 h-5" />,
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Information, 2: Review, 3: Payment
  const [expandedSection, setExpandedSection] = useState("shipping");

  // Form States
  const [formData, setFormData] = useState({
    // Shipping Information
    shipping_first_name: "",
    shipping_last_name: "",
    shipping_phone: "",
    shipping_email: "",
    shipping_city: "",
    shipping_address: "",
    shipping_postal_code: "",
    shipping_note: "",

    // Billing Information
    same_as_shipping: true,
    billing_first_name: "",
    billing_last_name: "",
    billing_phone: "",
    billing_email: "",
    billing_city: "",
    billing_address: "",
    billing_postal_code: "",

    // Order Details
    shipping_method: "express",
    payment_method: "online",
    accept_terms: false,
    newsletter: false,
  });

  const [errors, setErrors] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      // Load cart items from localStorage or API
      const savedCartItems = localStorage.getItem("checkoutItems");
      if (savedCartItems) {
        setCartItems(JSON.parse(savedCartItems));
      } else {
        // If no cart items, redirect to cart
        toast.error("سبد خرید شما خالی است");
        router.push("/cart");
        return;
      }

      // Load user addresses if logged in
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const response = await fetch(`${BASE_API}/users/addresses/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const addresses = await response.json();
            setUserAddresses(addresses);

            // Select default address
            const defaultAddress = addresses.find((addr) => addr.is_default);
            if (defaultAddress) {
              setSelectedAddress(defaultAddress.id);
              populateFormFromAddress(defaultAddress);
            }
          }
        } catch (error) {
          console.error("Address fetch error:", error);
        }
      }

      // Load user info if logged in
      if (token) {
        try {
          const response = await fetch(`${BASE_API}/users/me/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const userData = await response.json();
            setFormData((prev) => ({
              ...prev,
              shipping_first_name: userData.first_name || "",
              shipping_last_name: userData.last_name || "",
              shipping_phone: userData.phone || "",
              shipping_email: userData.email || "",
            }));
          }
        } catch (error) {
          console.error("User data fetch error:", error);
        }
      }

      // Load coupon discount
      const savedDiscount = localStorage.getItem("couponDiscount") || 0;
      setCouponDiscount(parseInt(savedDiscount));
    } catch (error) {
      console.error("Checkout data load error:", error);
      toast.error("خطا در بارگذاری اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  const populateFormFromAddress = (address) => {
    setFormData((prev) => ({
      ...prev,
      shipping_city: address.city || "",
      shipping_address: address.address || "",
      shipping_postal_code: address.postal_code || "",
    }));
  };

  const calculateTotals = () => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const selectedShipping = shippingMethods.find(
      (method) => method.id === formData.shipping_method
    );
    let shippingCost = selectedShipping?.cost || 0;

    // Apply free shipping if order meets threshold
    if (subtotal >= (selectedShipping?.freeThreshold || Infinity)) {
      shippingCost = 0;
    }

    const discount =
      cartItems.reduce((sum, item) => {
        if (item.original_price > item.price) {
          return sum + (item.original_price - item.price) * item.quantity;
        }
        return sum;
      }, 0) + couponDiscount;

    const total = subtotal + shippingCost - discount;

    return {
      subtotal,
      shipping: shippingCost,
      discount,
      total,
      itemsCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      productsCount: cartItems.length,
      freeShipping: shippingCost === 0,
    };
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

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
        billing_first_name: prev.shipping_first_name,
        billing_last_name: prev.shipping_last_name,
        billing_phone: prev.shipping_phone,
        billing_email: prev.shipping_email,
        billing_city: prev.shipping_city,
        billing_address: prev.shipping_address,
        billing_postal_code: prev.shipping_postal_code,
      }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    // Shipping validation
    if (!formData.shipping_first_name.trim()) {
      newErrors.shipping_first_name = "نام الزامی است";
    }
    if (!formData.shipping_last_name.trim()) {
      newErrors.shipping_last_name = "نام خانوادگی الزامی است";
    }
    if (!formData.shipping_phone.trim()) {
      newErrors.shipping_phone = "شماره تماس الزامی است";
    } else if (!/^09\d{9}$/.test(formData.shipping_phone.replace(/\s/g, ""))) {
      newErrors.shipping_phone = "شماره تماس نامعتبر است";
    }
    if (
      formData.shipping_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.shipping_email)
    ) {
      newErrors.shipping_email = "ایمیل نامعتبر است";
    }
    if (!formData.shipping_city.trim()) {
      newErrors.shipping_city = "شهر الزامی است";
    }
    if (!formData.shipping_address.trim()) {
      newErrors.shipping_address = "آدرس الزامی است";
    }
    if (!formData.shipping_postal_code.trim()) {
      newErrors.shipping_postal_code = "کد پستی الزامی است";
    } else if (!/^\d{10}$/.test(formData.shipping_postal_code)) {
      newErrors.shipping_postal_code = "کد پستی باید ۱۰ رقم باشد";
    }

    // Billing validation if not same as shipping
    if (!formData.same_as_shipping) {
      if (!formData.billing_first_name.trim()) {
        newErrors.billing_first_name = "نام الزامی است";
      }
      if (!formData.billing_last_name.trim()) {
        newErrors.billing_last_name = "نام خانوادگی الزامی است";
      }
      if (!formData.billing_city.trim()) {
        newErrors.billing_city = "شهر الزامی است";
      }
      if (!formData.billing_address.trim()) {
        newErrors.billing_address = "آدرس الزامی است";
      }
      if (!formData.billing_postal_code.trim()) {
        newErrors.billing_postal_code = "کد پستی الزامی است";
      } else if (!/^\d{10}$/.test(formData.billing_postal_code)) {
        newErrors.billing_postal_code = "کد پستی باید ۱۰ رقم باشد";
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

  const handleSubmitOrder = async () => {
    if (!formData.accept_terms) {
      toast.error("لطفا شرایط و ضوابط را تأیید کنید");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      const { total } = calculateTotals();

      // Prepare order data
      //   const orderData = {
      //     items: cartItems.map((item) => ({
      //       product_id: item.product_id,
      //       quantity: item.quantity,
      //       price: item.price,
      //       color: item.color,
      //       size: item.size,
      //     })),
      //     shipping_info: {
      //       first_name: formData.shipping_first_name,
      //       last_name: formData.shipping_last_name,
      //       phone: formData.shipping_phone,
      //       email: formData.shipping_email,
      //       city: formData.shipping_city,
      //       address: formData.shipping_address,
      //       postal_code: formData.shipping_postal_code,
      //       note: formData.shipping_note,
      //     },
      //     billing_info: formData.same_as_shipping
      //       ? null
      //       : {
      //           first_name: formData.billing_first_name,
      //           last_name: formData.billing_last_name,
      //           phone: formData.billing_phone,
      //           email: formData.billing_email,
      //           city: formData.billing_city,
      //           address: formData.billing_address,
      //           postal_code: formData.billing_postal_code,
      //         },
      //     shipping_method: formData.shipping_method,
      //     payment_method: formData.payment_method,
      //     total_amount: total,
      //     coupon_discount: couponDiscount,
      //     notes: formData.shipping_note,
      //   };

      // Submit order to API
      //   const response = await fetch(`${BASE_API}/orders/create/`, {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //       ...(token && { Authorization: `Bearer ${token}` }),
      //     },
      //     body: JSON.stringify(orderData),
      //   });

      //   if (!response.ok) {
      //     throw new Error("خطا در ثبت سفارش");
      //   }

      //   const orderResult = await response.json();

      //   // Clear cart and redirect
      //   localStorage.removeItem("checkoutItems");
      //   localStorage.removeItem("couponDiscount");

      toast.success("سفارش با موفقیت ثبت شد!");

      // Redirect to order confirmation page
      //   orderResult.order_id
      setTimeout(() => {
        router.push(`/order-confirmation/${1}`);
      }, 1500);
    } catch (error) {
      console.error("Order submission error:", error);
      toast.error(error.message || "خطا در ثبت سفارش");
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
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
                  <h1 className="text-3xl font-bold text-gray-900">
                    تکمیل خرید
                  </h1>
                  <p className="text-gray-600 mt-1">
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
                  <div className="w-20 h-0.5 bg-gray-300 mx-4"></div>
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
                  <div className="w-20 h-0.5 bg-gray-300 mx-4"></div>
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
                        {/* Saved Addresses */}
                        {userAddresses.length > 0 && (
                          <div className="mb-6">
                            <h3 className="font-medium text-gray-900 mb-3">
                              انتخاب از آدرس‌های ذخیره شده
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {userAddresses.map((address) => (
                                <div
                                  key={address.id}
                                  onClick={() => {
                                    setSelectedAddress(address.id);
                                    populateFormFromAddress(address);
                                  }}
                                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                    selectedAddress === address.id
                                      ? "border-blue-500 bg-blue-50"
                                      : "border-gray-200 hover:border-gray-300"
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        {address.title}
                                      </p>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {address.address}
                                      </p>
                                      <div className="flex items-center mt-2 text-sm text-gray-500">
                                        <span className="ml-3">
                                          {address.city}
                                        </span>
                                        <span>
                                          کد پستی: {address.postal_code}
                                        </span>
                                      </div>
                                    </div>
                                    {address.is_default && (
                                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                        پیش‌فرض
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <button
                              onClick={() => setSelectedAddress(null)}
                              className="mt-3 text-blue-600 hover:text-blue-700 text-sm"
                            >
                              یا ثبت آدرس جدید
                            </button>
                          </div>
                        )}

                        {/* Shipping Form */}
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <User className="w-4 h-4 ml-1" />
                                نام <span className="text-red-500 mr-1">*</span>
                              </label>
                              <input
                                type="text"
                                name="shipping_first_name"
                                value={formData.shipping_first_name}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  errors.shipping_first_name
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300"
                                }`}
                                placeholder="نام"
                              />
                              {errors.shipping_first_name && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.shipping_first_name}
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
                                name="shipping_last_name"
                                value={formData.shipping_last_name}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  errors.shipping_last_name
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300"
                                }`}
                                placeholder="نام خانوادگی"
                              />
                              {errors.shipping_last_name && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.shipping_last_name}
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
                                name="shipping_phone"
                                value={formData.shipping_phone}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  errors.shipping_phone
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300"
                                }`}
                                placeholder="09123456789"
                              />
                              {errors.shipping_phone && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.shipping_phone}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <Mail className="w-4 h-4 ml-1" />
                                آدرس ایمیل
                              </label>
                              <input
                                type="email"
                                name="shipping_email"
                                value={formData.shipping_email}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  errors.shipping_email
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300"
                                }`}
                                placeholder="example@email.com"
                              />
                              {errors.shipping_email && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.shipping_email}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                شهر <span className="text-red-500 mr-1">*</span>
                              </label>
                              <input
                                type="text"
                                name="shipping_city"
                                value={formData.shipping_city}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  errors.shipping_city
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300"
                                }`}
                                placeholder="شهر"
                              />
                              {errors.shipping_city && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.shipping_city}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                کد پستی{" "}
                                <span className="text-red-500 mr-1">*</span>
                              </label>
                              <input
                                type="text"
                                name="shipping_postal_code"
                                value={formData.shipping_postal_code}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  errors.shipping_postal_code
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300"
                                }`}
                                placeholder="۱۰ رقمی"
                                maxLength="10"
                              />
                              {errors.shipping_postal_code && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.shipping_postal_code}
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
                              name="shipping_address"
                              value={formData.shipping_address}
                              onChange={handleChange}
                              rows="3"
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.shipping_address
                                  ? "border-red-500 bg-red-50"
                                  : "border-gray-300"
                              }`}
                              placeholder="خیابان، کوچه، پلاک، طبقه، واحد"
                            />
                            {errors.shipping_address && (
                              <p className="mt-2 text-sm text-red-600">
                                {errors.shipping_address}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              یادداشت برای فروشنده (اختیاری)
                            </label>
                            <textarea
                              name="shipping_note"
                              value={formData.shipping_note}
                              onChange={handleChange}
                              rows="2"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="درخواست خاص یا توضیح درباره سفارش"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Billing Information */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
                      <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                          اطلاعات صورتحساب
                        </h2>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center mb-6">
                          <input
                            type="checkbox"
                            id="same_as_shipping"
                            name="same_as_shipping"
                            checked={formData.same_as_shipping}
                            onChange={handleChange}
                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor="same_as_shipping"
                            className="mr-3 text-gray-900"
                          >
                            آدرس صورتحساب همان آدرس ارسال است
                          </label>
                        </div>

                        {!formData.same_as_shipping && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  نام{" "}
                                  <span className="text-red-500 mr-1">*</span>
                                </label>
                                <input
                                  type="text"
                                  name="billing_first_name"
                                  value={formData.billing_first_name}
                                  onChange={handleChange}
                                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.billing_first_name
                                      ? "border-red-500 bg-red-50"
                                      : "border-gray-300"
                                  }`}
                                  placeholder="نام"
                                />
                                {errors.billing_first_name && (
                                  <p className="mt-2 text-sm text-red-600">
                                    {errors.billing_first_name}
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
                                  name="billing_last_name"
                                  value={formData.billing_last_name}
                                  onChange={handleChange}
                                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.billing_last_name
                                      ? "border-red-500 bg-red-50"
                                      : "border-gray-300"
                                  }`}
                                  placeholder="نام خانوادگی"
                                />
                                {errors.billing_last_name && (
                                  <p className="mt-2 text-sm text-red-600">
                                    {errors.billing_last_name}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  شهر{" "}
                                  <span className="text-red-500 mr-1">*</span>
                                </label>
                                <input
                                  type="text"
                                  name="billing_city"
                                  value={formData.billing_city}
                                  onChange={handleChange}
                                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.billing_city
                                      ? "border-red-500 bg-red-50"
                                      : "border-gray-300"
                                  }`}
                                  placeholder="شهر"
                                />
                                {errors.billing_city && (
                                  <p className="mt-2 text-sm text-red-600">
                                    {errors.billing_city}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  کد پستی{" "}
                                  <span className="text-red-500 mr-1">*</span>
                                </label>
                                <input
                                  type="text"
                                  name="billing_postal_code"
                                  value={formData.billing_postal_code}
                                  onChange={handleChange}
                                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.billing_postal_code
                                      ? "border-red-500 bg-red-50"
                                      : "border-gray-300"
                                  }`}
                                  placeholder="۱۰ رقمی"
                                  maxLength="10"
                                />
                                {errors.billing_postal_code && (
                                  <p className="mt-2 text-sm text-red-600">
                                    {errors.billing_postal_code}
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
                                name="billing_address"
                                value={formData.billing_address}
                                onChange={handleChange}
                                rows="3"
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  errors.billing_address
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300"
                                }`}
                                placeholder="خیابان، کوچه، پلاک، طبقه، واحد"
                              />
                              {errors.billing_address && (
                                <p className="mt-2 text-sm text-red-600">
                                  {errors.billing_address}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
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
                                    {method.cost === 0 ||
                                    (subtotal >= method.freeThreshold &&
                                      method.cost > 0) ? (
                                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                        رایگان
                                      </span>
                                    ) : null}
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
                          <h3 className="font-medium text-gray-900 mb-4">
                            محصولات سفارش
                          </h3>
                          <div className="space-y-4">
                            {cartItems.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                              >
                                <div className="flex items-center">
                                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center ml-4">
                                    <div className="text-xl">🛍️</div>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {item.name}
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
                                  </div>
                                </div>
                                <div className="text-left">
                                  <p className="font-bold text-gray-900">
                                    {formatPrice(item.price * item.quantity)}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    هر عدد: {formatPrice(item.price)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shipping Information */}
                        <div className="mb-8">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium text-gray-900">
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
                              {formData.shipping_first_name}{" "}
                              {formData.shipping_last_name}
                            </p>
                            <p className="text-gray-600 mt-1">
                              {formData.shipping_address}
                            </p>
                            <div className="flex items-center mt-2 text-sm text-gray-500">
                              <span className="ml-3">
                                {formData.shipping_city}
                              </span>
                              <span>
                                کد پستی: {formData.shipping_postal_code}
                              </span>
                              <span className="mr-4">
                                تلفن: {formData.shipping_phone}
                              </span>
                            </div>
                            {formData.shipping_note && (
                              <p className="mt-2 text-sm text-gray-600">
                                <span className="font-medium">یادداشت:</span>{" "}
                                {formData.shipping_note}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Payment Method */}
                        <div className="mb-8">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium text-gray-900">
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
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
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
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 top-6">
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

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">تخفیف کالاها</span>
                        <span className="text-green-600">
                          -{formatPrice(discount - couponDiscount)}
                        </span>
                      </div>

                      {couponDiscount > 0 && (
                        <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                          <span className="text-green-700">تخفیف کد تخفیف</span>
                          <span className="text-green-700 font-medium">
                            -{formatPrice(couponDiscount)}
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
                  <h3 className="font-semibold text-gray-900 mb-4">
                    نیاز به راهنمایی دارید؟
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-400 ml-2" />
                      <div>
                        <p className="font-medium text-gray-900">
                          ۰۲۱-۱۲۳۴۵۶۷۸
                        </p>
                        <p className="text-sm text-gray-500">پشتیبانی تلفنی</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                      <Clock className="w-5 h-5 text-gray-400 ml-2" />
                      <div>
                        <p className="font-medium text-gray-900">
                          هر روز ۹ صبح تا ۹ شب
                        </p>
                        <p className="text-sm text-gray-500">ساعات کاری</p>
                      </div>
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
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-white rounded-full ml-2"></div>
                      <span>ضمانت بازگشت وجه</span>
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
