"use client";
import React from "react";
import {
  Target,
  Users,
  Award,
  TrendingUp,
  Shield,
  Globe,
  Heart,
} from "lucide-react";

export default function About() {
  const features = [
    {
      icon: Target,
      title: "ماموریت ما",
      description:
        "ایجاد بستری امن و قابل اعتماد برای تجارت الکترونیک در ایران",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Users,
      title: "جامعه بزرگ",
      description: "بیش از ۱۰۰۰ فروشنده و هزاران خریدار راضی در پلتفرم ما",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Award,
      title: "تضمین کیفیت",
      description: "کلیه محصولات قبل از عرضه از نظر کیفیت بررسی می‌شوند",
      color: "from-yellow-500 to-yellow-600",
    },
    {
      icon: Shield,
      title: "امنیت بالا",
      description: "پرداخت‌های امن با استفاده از درگاه‌های بانکی معتبر",
      color: "from-purple-500 to-purple-600",
    },
  ];

  const stats = [
    { number: "۱۰۰۰+", label: "فروشنده فعال" },
    { number: "۵۰,۰۰۰+", label: "محصول" },
    { number: "۹۹%", label: "رضایت مشتریان" },
    { number: "۲۴/۷", label: "پشتیبانی" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-2xl shadow-blue-500/25 mb-6">
            <Heart className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            تاریخچه و معرفی آوینا
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            آوینا با هدف ایجاد تحول در تجارت الکترونیک ایران در سال ۱۴۰۲ تأسیس
            شد و امروز به یکی از پلتفرم‌های پیشرو در زمینه خرید و فروش آنلاین
            تبدیل شده است
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-6 text-center shadow-2xl border border-gray-100"
            >
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} mb-6`}
                >
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Story */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white shadow-2xl mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-6">داستان ما</h2>
              <p className="text-blue-100 leading-relaxed mb-4">
                آوینا با این باور متولد شد که هر ایرانی باید بتواند به راحتی و
                با اطمینان خرید و فروش آنلاین انجام دهد. ما با تیمی جوان و
                پرانرژی شروع کردیم و امروز با افتخار در خدمت جامعه بزرگ کاربران
                خود هستیم.
              </p>
              <p className="text-blue-100 leading-relaxed">
                تمرکز ما بر سه اصل اساسی است: امنیت، کیفیت و رضایت کاربران. این
                اصول، پایه و اساس تمام تصمیم‌گیری‌ها و توسعه‌های پلتفرم آوینا
                هستند.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="bg-white/20 rounded-2xl p-6 backdrop-blur-sm">
                <Globe className="h-24 w-24 text-white opacity-80" />
              </div>
            </div>
          </div>
        </div>

        {/* Team Values */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            ارزش‌های تیم آوینا
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "شفافیت",
                description: "همواره با کاربران خود صادق و شفاف هستیم",
              },
              {
                title: "تعهد",
                description: "به تعهدات خود در قبال کاربران پایبندیم",
              },
              {
                title: "نوآوری",
                description: "همواره در حال بهبود و توسعه پلتفرم هستیم",
              },
            ].map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100"
              >
                <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
