"use client";
import {
  UserCheck,
  Phone,
  Mail,
  IdCard,
  CheckCircle,
  Clock,
  Shield,
} from "lucide-react";

export default function BuyerVerification() {
  const verificationSteps = [
    {
      icon: UserCheck,
      title: "ثبت‌نام اولیه",
      description: "ایجاد حساب کاربری با ایمیل یا شماره موبایل",
      duration: "۲ دقیقه",
      status: "required",
    },
    {
      icon: Phone,
      title: "تأیید شماره تماس",
      description: "ارسال کد تأیید به شماره موبایل",
      duration: "۱ دقیقه",
      status: "required",
    },
    {
      icon: Mail,
      title: "تأیید ایمیل",
      description: "ارسال لینک تأیید به آدرس ایمیل",
      duration: "۳ دقیقه",
      status: "optional",
    },
    {
      icon: IdCard,
      title: "احراز هویت",
      description: "بارگذاری مدارک شناسایی",
      duration: "۵ دقیقه",
      status: "optional",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-2xl shadow-blue-500/25 mb-6">
            <UserCheck className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            نحوۀ احراز هویت خریداران
          </h1>
          <p className="text-xl text-gray-600">
            فرآیند ساده و سریع تأیید هویت برای خرید امن از آوینا
          </p>
        </div>

        {/* Verification Steps */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            مراحل احراز هویت
          </h2>
          <div className="space-y-6">
            {verificationSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={index}
                  className="flex items-start space-x-6 space-x-reverse p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300"
                >
                  <div
                    className={`p-4 rounded-2xl ${
                      step.status === "required"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <IconComponent className="h-6 w-6" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-4 space-x-reverse mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {step.title}
                      </h3>
                      {step.status === "required" && (
                        <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-medium">
                          الزامی
                        </span>
                      )}
                      {step.status === "optional" && (
                        <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                          اختیاری
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{step.description}</p>
                    <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Clock className="h-4 w-4" />
                        <span>زمان تقریبی: {step.duration}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        step.status === "required"
                          ? "bg-blue-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <span className="text-sm text-gray-500">
                      {index + 1}/{verificationSteps.length}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-6 text-white shadow-2xl">
            <CheckCircle className="h-8 w-8 mb-4" />
            <h3 className="text-lg font-bold mb-2">مزایای احراز هویت</h3>
            <ul className="space-y-2 text-green-100">
              <li>• خرید امن و مطمئن</li>
              <li>• دسترسی به تمامی امکانات</li>
              <li>• پشتیبانی ویژه</li>
              <li>• تراکنش‌های سریع‌تر</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-2xl">
            <Shield className="h-8 w-8 mb-4" />
            <h3 className="text-lg font-bold mb-2">اطلاعات امن</h3>
            <ul className="space-y-2 text-blue-100">
              <li>• اطلاعات شما محرمانه می‌ماند</li>
              <li>• رمزنگاری پیشرفته</li>
              <li>• مطابق با قوانین حریم خصوصی</li>
              <li>• حذف اطلاعات در صورت درخواست</li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-bold shadow-2xl shadow-blue-500/25 hover:shadow-3xl hover:shadow-purple-500/25">
            شروع فرآیند احراز هویت
          </button>
          <p className="text-gray-600 mt-4 text-sm">
            سوالی دارید؟ با پشتیبانی تماس بگیرید
          </p>
        </div>
      </div>
    </div>
  );
}
