"use client";
import React, { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  HeadphonesIcon,
  User,
  MessageSquare,
  ArrowLeft,
  CheckCircle2,
  Star,
  Zap,
  Shield,
  Heart,
  Sparkles,
  Camera,
  Paperclip,
  Smile,
  Building,
  Globe,
  Users,
  ThumbsUp,
} from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeMethod, setActiveMethod] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Form submitted:", formData);
    setIsSubmitting(false);
    setIsSubmitted(true);

    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactMethods = [
    {
      icon: Phone,
      title: "پشتیبانی تلفنی",
      details: "۰۲۱-۱۲۳۴۵۶۷۸",
      description: "۲۴/۷ پاسخگوی شما هستیم",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-gradient-to-br from-green-500 to-emerald-600",
      textColor: "text-white",
      buttonText: "تماس فوری",
      status: "آنلاین",
      statusColor: "bg-green-400",
    },
    {
      icon: MessageCircle,
      title: "چت آنلاین",
      details: "شروع گفتگو",
      description: "پاسخ فوری در کمتر از ۲ دقیقه",
      color: "from-blue-500 to-purple-600",
      bgColor: "bg-gradient-to-br from-blue-500 to-purple-600",
      textColor: "text-white",
      buttonText: "شروع چت",
      status: "آنلاین",
      statusColor: "bg-green-400",
    },
    {
      icon: Mail,
      title: "ایمیل پشتیبانی",
      details: "support@avina.com",
      description: "پاسخ در کمتر از ۴ ساعت",
      color: "from-cyan-500 to-blue-600",
      bgColor: "bg-gradient-to-br from-cyan-500 to-blue-600",
      textColor: "text-white",
      buttonText: "ارسال ایمیل",
      status: "فعال",
      statusColor: "bg-blue-400",
    },
    {
      icon: MapPin,
      title: "دفتر مرکزی",
      details: "تهران، میرداماد",
      description: "بازدید با هماهنگی",
      color: "from-orange-500 to-red-600",
      bgColor: "bg-gradient-to-br from-orange-500 to-red-600",
      textColor: "text-white",
      buttonText: "مشاهده نقشه",
      status: "باز",
      statusColor: "bg-green-400",
    },
  ];

  const features = [
    {
      icon: Zap,
      text: "پاسخگویی سریع",
      color: "text-yellow-500",
      bg: "bg-yellow-50",
    },
    {
      icon: Shield,
      text: "پشتیبانی امن",
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      icon: Heart,
      text: "رضایت مشتری",
      color: "text-pink-500",
      bg: "bg-pink-50",
    },
    {
      icon: Star,
      text: "کیفیت بالا",
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
  ];

  const stats = [
    { number: "۹۸%", label: "رضایت مشتریان", icon: ThumbsUp },
    { number: "۲۴/۷", label: "پشتیبانی", icon: Clock },
    { number: "۵۰۰+", label: "متخصص", icon: Users },
    { number: "۵۰+", label: "شهر", icon: Globe },
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">
              پیام شما ارسال شد!
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              با تشکر از ارتباط شما. تیم پشتیبانی آوینا در اسرع وقت با شما تماس
              خواهد گرفت.
            </p>
            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={() => setIsSubmitted(false)}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-bold shadow-lg"
              >
                بازگشت
              </button>
              <button className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-2xl hover:bg-gray-200 transition-all duration-300 font-bold border border-gray-200">
                صفحه اصلی
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
            ما اینجا{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              هستیم
            </span>{" "}
            تا کمک کنیم
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            تیم پشتیبانی آوینا همواره آماده پاسخگویی به سوالات و حل مشکلات
            شماست. بهترین تجربه پشتیبانی را با ما تجربه کنید.
          </p>
          <div className="inline-flex items-center space-x-2 space-x-reverse bg-blue-50 rounded-2xl px-6 py-3 border border-blue-200 mb-6">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span className="text-blue-600 font-bold">پشتیبانی ۲۴ ساعته</span>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-black text-gray-900 mb-1">
                  {stat.number}
                </div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Features */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
            <div className="flex space-x-8 space-x-reverse">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center space-x-3 space-x-reverse"
                  >
                    <div className={`p-2 rounded-lg ${feature.bg}`}>
                      <IconComponent className={`h-5 w-5 ${feature.color}`} />
                    </div>
                    <span className="text-gray-700 font-medium">
                      {feature.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Contact Methods */}
          <div className="xl:col-span-1 space-y-6">
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon;
              const isActive = activeMethod === index;

              return (
                <div
                  key={index}
                  onClick={() => setActiveMethod(index)}
                  className={`relative bg-white rounded-3xl p-6 border-2 transition-all duration-500 cursor-pointer group hover:scale-105 shadow-lg ${
                    isActive
                      ? `border-blue-500 shadow-2xl shadow-blue-500/20`
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {/* Status Dot */}
                  <div
                    className={`absolute top-4 left-4 w-3 h-3 ${method.statusColor} rounded-full border-2 border-white`}
                  ></div>

                  <div className="flex items-start space-x-4 space-x-reverse">
                    <div
                      className={`p-4 rounded-2xl ${method.bgColor} group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-black text-gray-900">
                          {method.title}
                        </h3>
                      </div>

                      <p className="text-gray-900 font-semibold text-lg mb-2">
                        {method.details}
                      </p>
                      <p className="text-gray-600 text-sm mb-4">
                        {method.description}
                      </p>

                      <button
                        className={`w-full ${method.bgColor} text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                      >
                        {method.buttonText}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Working Hours */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg">
              <div className="flex items-center space-x-3 space-x-reverse mb-6">
                <Clock className="h-6 w-6 text-blue-200" />
                <h3 className="text-lg font-black">ساعات کاری</h3>
              </div>
              <div className="space-y-4 text-blue-100">
                <div className="flex justify-between items-center py-3 border-b border-blue-400/30">
                  <span>شنبه - چهارشنبه</span>
                  <span className="font-black">۸:۰۰ - ۱۶:۰۰</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-blue-400/30">
                  <span>پنجشنبه</span>
                  <span className="font-black">۸:۰۰ - ۱۴:۰۰</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span>جمعه</span>
                  <span className="font-black text-red-200">تعطیل</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">
                      ارسال پیام مستقیم
                    </h2>
                    <p className="text-gray-600">پاسخ در کمتر از ۲ ساعت</p>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex space-x-2 space-x-reverse">
                  <button className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300 border border-gray-300">
                    <Camera className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300 border border-gray-300">
                    <Paperclip className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-black text-gray-700 flex items-center">
                      <User className="h-4 w-4 ml-2 text-blue-600" />
                      نام و نام خانوادگی
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="نام کامل خود را وارد کنید"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-black text-gray-700 flex items-center">
                      <Mail className="h-4 w-4 ml-2 text-blue-600" />
                      آدرس ایمیل
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-black text-gray-700">
                    موضوع پیام
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="موضوع پیام خود را وارد کنید"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-black text-gray-700">
                    متن پیام
                  </label>
                  <div className="relative">
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={8}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none"
                      placeholder="پیام خود را با جزئیات کامل بنویسید..."
                      required
                    />
                    <div className="absolute bottom-4 left-4 flex space-x-2 space-x-reverse">
                      <button
                        type="button"
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-300"
                      >
                        <Smile className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        type="button"
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-300"
                      >
                        <Paperclip className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 font-black shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center space-x-2 space-x-reverse transform hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>در حال ارسال...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>ارسال پیام</span>
                    </>
                  )}
                </button>
              </form>

              {/* Additional Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>پاسخگویی معمولاً در کمتر از ۲ ساعت</span>
                  </div>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>پشتیبانی ۲۴/۷ برای موارد اضطراری</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white rounded-3xl shadow-2xl border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-gray-900">سوالات متداول</h3>
            <button className="text-blue-600 hover:text-blue-700 transition-colors font-bold">
              مشاهده همه
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              "نحوه ثبت سفارش",
              "روش‌های پرداخت",
              "زمان تحویل",
              "شرایط مرجوعی",
              "تضمین کیفیت",
              "حمل و نقل",
              "پیگیری سفارش",
              "گارانتی محصولات",
            ].map((question, index) => (
              <button
                key={index}
                className="p-4 text-right rounded-2xl border border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 text-gray-700 hover:text-blue-600 font-medium group"
              >
                <div className="flex items-center justify-between">
                  <span>{question}</span>
                  <ArrowLeft className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transform group-hover:-translate-x-1 transition-all duration-300" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
