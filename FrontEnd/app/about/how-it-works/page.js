"use client";
import React, { useState } from "react";
import {
  ShoppingBag,
  Store,
  Shield,
  Truck,
  CreditCard,
  CheckCircle,
  Search,
  UserPlus,
  Star,
  ArrowLeft,
  ArrowRight,
  Heart,
  Clock,
  MapPin,
  Phone,
  Users,
  Package,
  ThumbsUp,
} from "lucide-react";

// Sample product data
const products = [
  {
    id: 1,
    name: "پیراهن مردانه",
    emoji: "👔",
    price: "۲۹۰,۰۰۰ تومان",
    rating: 4.8,
  },
  {
    id: 2,
    name: "لباس مجلسی",
    emoji: "👗",
    price: "۴۵۰,۰۰۰ تومان",
    rating: 4.9,
  },
  {
    id: 3,
    name: "کفش ورزشی",
    emoji: "👟",
    price: "۳۲۰,۰۰۰ تومان",
    rating: 4.7,
  },
  {
    id: 4,
    name: "کیف زنانه",
    emoji: "👜",
    price: "۱۸۰,۰۰۰ تومان",
    rating: 4.6,
  },
  { id: 5, name: "ساعت مچی", emoji: "⌚", price: "۵۲۰,۰۰۰ تومان", rating: 4.9 },
  {
    id: 6,
    name: "عینک آفتابی",
    emoji: "🕶️",
    price: "۱۵۰,۰۰۰ تومان",
    rating: 4.5,
  },
];

const sellers = [
  { id: 1, name: "فروشگاه مد و پوشاک", emoji: "🏪", rating: 4.9 },
  { id: 2, name: "بوتیک لباس زنانه", emoji: "👚", rating: 4.8 },
  { id: 3, name: "فروشگاه کفش", emoji: "👞", rating: 4.7 },
  { id: 4, name: "اکسسوری مدرن", emoji: "💎", rating: 4.9 },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      icon: UserPlus,
      title: "ثبت نام و ایجاد فروشگاه",
      description:
        "فروشندگان محترم می‌توانند با ثبت نام در پلتفرم آوینا، فروشگاه اختصاصی خود را در کمتر از ۵ دقیقه ایجاد کنند. این فرآیند کاملاً رایگان بوده و نیاز به مدارک پیچیده ندارد.",
      details: [
        "ثبت نام با شماره موبایل و ایمیل",
        "تکمیل پروفایل فروشگاه",
        "بارگذاری مدارک هویتی",
        "فعال‌سازی درگاه پرداخت",
        "آغاز فروش در کمتر از ۲۴ ساعت",
      ],
      products: products.slice(0, 3),
      sellers: sellers.slice(0, 2),
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: Search,
      title: "جستجو و کشف محصولات",
      description:
        "کاربران می‌توانند از بین هزاران محصول متنوع، با استفاده از فیلترهای پیشرفته و جستجوی هوشمند، کالای مورد نظر خود را به راحتی پیدا کنند.",
      details: [
        "جستجوی پیشرفته با فیلترهای مختلف",
        "سیستم پیشنهاد هوشمند",
        "مقایسه قیمت و ویژگی‌ها",
        "نمایش نظرات کاربران",
        "امکان ذخیره محصولات مورد علاقه",
      ],
      products: products.slice(1, 4),
      sellers: sellers.slice(1, 3),
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
    },
    {
      icon: CreditCard,
      title: "پرداخت امن و مطمئن",
      description:
        "تمامی تراکنش‌های مالی از طریق درگاه‌های بانکی معتبر و با بالاترین سطح امنیت انجام می‌شود. اطلاعات محرمانه شما کاملاً محفوظ می‌ماند.",
      details: [
        "پشتیبانی از تمامی کارت‌های بانکی",
        "تایید دو مرحله‌ای امنیتی",
        "امکان پرداخت اقساطی",
        "گارانتی بازگشت وجه ۷۲ ساعته",
        "پشتیبانی مالی ۲۴ ساعته",
      ],
      products: products.slice(2, 5),
      sellers: sellers.slice(2, 4),
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
    },
    {
      icon: Truck,
      title: "بسته‌بندی و ارسال سریع",
      description:
        "سفارشات شما با بهترین روش‌های بسته‌بندی و در کوتاه‌ترین زمان ممکن آماده ارسال می‌شوند. امکان تحویل درب منزل در سراسر کشور فراهم است.",
      details: [
        "ارسال اکسپرس در تهران (۲۴ ساعته)",
        "ارسال به شهرستان (۴۸ تا ۷۲ ساعت)",
        "پشتیبانی از پیک موتوری و پست",
        "امکان رهگیری لحظه‌ای مرسوله",
        "بسته‌بندی ضد ضربه و استاندارد",
      ],
      products: products.slice(3, 6),
      sellers: sellers.slice(0, 3),
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
    },
    {
      icon: CheckCircle,
      title: "تحویل و پشتیبانی پس از خرید",
      description:
        "پس از دریافت سفارش، ۷ روز فرصت دارید تا در صورت عدم رضایت، محصول را مرجوع کنید. تیم پشتیبانی آوینا همواره پاسخگوی سوالات شماست.",
      details: [
        "گارانتی ۷ روزه بازگشت کالا",
        "پشتیبانی تلفنی و آنلاین ۲۴/۷",
        "راهنمای استفاده از محصول",
        "خدمات پس از فروش حرفه‌ای",
        "برگزاری دوره‌های آموزشی",
      ],
      products: products.slice(0, 6),
      sellers: sellers,
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-50",
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "ضمانت اصالت کالا",
      description: "تمامی محصولات دارای گارانتی اصالت هستند",
    },
    {
      icon: Clock,
      title: "تحویل سریع",
      description: "ارسال در کمترین زمان ممکن",
    },
    {
      icon: Star,
      title: "کیفیت برتر",
      description: "انتخاب از بین بهترین برندها",
    },
    {
      icon: MapPin,
      title: "پوشش سراسری",
      description: "ارسال به تمامی نقاط ایران",
    },
    {
      icon: Phone,
      title: "پشتیبانی ۲۴ ساعته",
      description: "همواره در کنار شما هستیم",
    },
    {
      icon: Heart,
      title: "رضایت مشتری",
      description: "اولویت اصلی ما رضایت شماست",
    },
  ];

  const nextStep = () => {
    setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : 0));
  };

  const prevStep = () => {
    setActiveStep((prev) => (prev > 0 ? prev - 1 : steps.length - 1));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-3xl backdrop-blur-sm mb-8">
            <ShoppingBag className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6">
            تجربه خریدی متفاوت با آوینا
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            از انتخاب محصول تا تحویل درب منزل، آوینا در تمام مراحل همراه شماست.
            با اطمینان خرید کنید و از بهترین خدمات بهره‌مند شوید.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16 -mt-10">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-4">
            {/* Steps Navigation */}
            <div className="lg:col-span-1 bg-gray-50 p-6 border-l border-gray-200">
              <div className="space-y-3">
                {steps.map((step, index) => {
                  const IconComponent = step.icon;
                  const isActive = activeStep === index;

                  return (
                    <button
                      key={index}
                      onClick={() => setActiveStep(index)}
                      className={`w-full text-right p-4 rounded-2xl transition-all duration-300 ${
                        isActive
                          ? `bg-gradient-to-r ${step.color} text-white shadow-lg`
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-bold ${
                            isActive
                              ? "bg-white/20"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <h3 className="font-bold text-sm mb-1">{step.title}</h3>
                      <p
                        className={`text-xs leading-relaxed ${
                          isActive ? "text-white/90" : "text-gray-600"
                        }`}
                      >
                        {step.description.substring(0, 60)}...
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${steps[activeStep].color} flex items-center justify-center`}
                  >
                    {React.createElement(steps[activeStep].icon, {
                      className: "h-8 w-8 text-white",
                    })}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">
                      {steps[activeStep].title}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      مرحله {activeStep + 1} از {steps.length}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 space-x-reverse">
                  <button
                    onClick={prevStep}
                    className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-300"
                  >
                    <ArrowRight className="h-5 w-5 text-gray-600" />
                  </button>
                  <button
                    onClick={nextStep}
                    className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-300"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                <p className="text-gray-700 leading-relaxed text-justify">
                  {steps[activeStep].description}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {steps[activeStep].details.map((detail, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 space-x-reverse p-4 bg-white rounded-2xl border border-gray-200"
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{detail}</span>
                  </div>
                ))}
              </div>

              {/* Products Section */}
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-4">محصولات نمونه</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {steps[activeStep].products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white border border-gray-200 rounded-2xl p-4 text-center hover:shadow-lg transition-all duration-300"
                    >
                      <div className="text-3xl mb-2">{product.emoji}</div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">
                        {product.name}
                      </h4>
                      <div className="flex items-center justify-center space-x-1 space-x-reverse mb-2">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600">
                          {product.rating}
                        </span>
                      </div>
                      <p className="text-xs text-green-600 font-bold">
                        {product.price}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sellers Section */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4">
                  فروشندگان همکار
                </h3>
                <div className="flex space-x-4 space-x-reverse overflow-x-auto pb-4">
                  {steps[activeStep].sellers.map((seller) => (
                    <div
                      key={seller.id}
                      className="flex items-center space-x-3 space-x-reverse bg-white border border-gray-200 rounded-2xl p-4 min-w-max"
                    >
                      <div className="text-2xl">{seller.emoji}</div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">
                          {seller.name}
                        </h4>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600">
                            {seller.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-12">
            چرا آوینا را انتخاب کنیم؟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group hover:border-blue-200"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-black text-gray-900 text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-12 text-white">
            <h2 className="text-3xl font-black mb-4">آماده شروع هستید؟</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              همین حالا به خانواده بزرگ آوینا بپیوندید و از تجربه‌ای متفاوت از
              خرید و فروش آنلاین لذت ببرید
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black hover:scale-105 transition-all duration-300 shadow-lg">
                شروع خرید آنلاین
              </button>
              <button className="bg-white/20 text-white px-8 py-4 rounded-2xl font-black hover:bg-white/30 transition-all duration-300 border border-white/30">
                ثبت فروشگاه جدید
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
