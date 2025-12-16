"use client";
import {
  Shield,
  Lock,
  Eye,
  CreditCard,
  Smartphone,
  Zap,
  CheckCircle,
} from "lucide-react";

export default function SecurePayment() {
  const securityFeatures = [
    {
      icon: Lock,
      title: "رمزنگاری SSL",
      description: "کلیه اطلاعات با استاندارد SSL رمزنگاری می‌شوند",
      details: "استاندارد ۲۵۶ بیتی",
    },
    {
      icon: Shield,
      title: "تأیید دو مرحله‌ای",
      description: "پرداخت با تأیید دو مرحله‌ای انجام می‌شود",
      details: "پیامک و ایمیل",
    },
    {
      icon: Eye,
      title: "نظارت مستمر",
      description: "کلیه تراکنش‌ها به صورت ۲۴ ساعته نظارت می‌شوند",
      details: "سیستم هوشمند",
    },
    {
      icon: CreditCard,
      title: "درگاه‌های معتبر",
      description: "استفاده از درگاه‌های بانکی رسمی و معتبر",
      details: "شاپرک و...",
    },
  ];

  const paymentMethods = [
    {
      icon: CreditCard,
      name: "کارت‌های بانکی",
      description: "کلیه کارت‌های عضو شتاب",
      supported: true,
    },
    {
      icon: Smartphone,
      name: "کیف پول الکترونیکی",
      description: "سامان، آی‌پی‌پی و...",
      supported: true,
    },
    {
      icon: Zap,
      name: "پرداخت آنی",
      description: "پرداخت فوری بدون نیاز به ثبت‌نام",
      supported: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-2xl shadow-blue-500/25 mb-6">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            پرداخت امن آوینا
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            با خیال راحت خرید کنید. سیستم پرداخت آوینا با بالاترین استانداردهای
            امنیتی طراحی شده است
          </p>
        </div>

        {/* Security Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {securityFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 text-center hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="inline-flex p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {feature.description}
                </p>
                <span className="text-xs text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
                  {feature.details}
                </span>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Payment Methods */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              روش‌های پرداخت
            </h2>
            <div className="space-y-4">
              {paymentMethods.map((method, index) => {
                const IconComponent = method.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center space-x-4 space-x-reverse p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300"
                  >
                    <div className="p-3 bg-blue-50 rounded-2xl">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{method.name}</h3>
                      <p className="text-gray-600 text-sm">
                        {method.description}
                      </p>
                    </div>
                    {method.supported && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Security Badge */}
            <div className="mt-8 p-6 bg-green-50 rounded-2xl border border-green-200">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Shield className="h-6 w-6 text-green-600" />
                <div>
                  <h4 className="font-bold text-green-800">
                    تأیید شده توسط بانک مرکزی
                  </h4>
                  <p className="text-green-700 text-sm mt-1">
                    کلیه پرداخت‌ها تحت نظارت بانک مرکزی جمهوری اسلامی ایران
                    انجام می‌شود
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Guidelines */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                راهنمای امنیت پرداخت
              </h2>
              <div className="space-y-4">
                {[
                  "هرگز اطلاعات کارت بانکی خود را در اختیار دیگران قرار ندهید",
                  "از شبکه‌های Wi-Fi عمومی برای پرداخت استفاده نکنید",
                  "پس از پرداخت، از حساب کاربری خود خارج شوید",
                  "رمز عبور قوی و یکتا برای حساب کاربری خود انتخاب کنید",
                  "گزارش تراکنش‌های خود را regularly بررسی کنید",
                ].map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 space-x-reverse"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Info */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
              <h3 className="text-xl font-bold mb-4">در صورت بروز مشکل</h3>
              <p className="text-blue-100 mb-4">
                اگر در حین پرداخت با مشکل مواجه شدید، نگران نباشید. تیم پشتیبانی
                آوینا آماده کمک به شماست.
              </p>
              <div className="space-y-2 text-blue-200">
                <div>📞 تلفن پشتیبانی: ۰۲۱-۱۲۳۴۵۶۷۸</div>
                <div>📧 ایمیل: support@avina.com</div>
                <div>🕒 پاسخگویی: ۲۴ ساعته</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
