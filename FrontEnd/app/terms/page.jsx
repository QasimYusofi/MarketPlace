"use client";
import React, { useState } from "react";
import {
  Shield,
  FileText,
  ShoppingCart,
  UserCheck,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function Terms() {
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    {
      icon: UserCheck,
      title: "قوانین عمومی",
      content: `
        <p>با استفاده از پلتفرم آوینا، شما موافقت می‌کنید که این قوانین و شرایط را رعایت کنید.</p>
        <ul class="space-y-2 mt-4">
          <li>• کاربران باید حداقل ۱۸ سال سن داشته باشند</li>
          <li>• ارائه اطلاعات نادرست ممنوع است</li>
          <li>• هرگونه سوء استفاده از پلتفرم پیگرد قانونی دارد</li>
        </ul>
      `,
    },
    {
      icon: ShoppingCart,
      title: "قوانین خرید",
      content: `
        <p>قوانین و مقررات مربوط به فرآیند خرید در آوینا:</p>
        <ul class="space-y-2 mt-4">
          <li>• قیمت‌ها به ریال و شامل مالیات بر ارزش افزوده است</li>
          <li>• پس از ثبت سفارش، امکان لغو آن وجود ندارد</li>
          <li>• کالاهای آسیب‌دیده در حین حمل قابل مرجوع هستند</li>
        </ul>
      `,
    },
    {
      icon: Shield,
      title: "حریم خصوصی",
      content: `
        <p>سیاست حفظ حریم خصوصی آوینا:</p>
        <ul class="space-y-2 mt-4">
          <li>• اطلاعات شخصی کاربران محرمانه باقی می‌ماند</li>
          <li>• از اطلاعات فقط برای اهداف مجاز استفاده می‌شود</li>
          <li>• کاربران می‌توانند درخواست حذف اطلاعات خود را دهند</li>
        </ul>
      `,
    },
    {
      icon: AlertTriangle,
      title: "مسئولیت‌ها",
      content: `
        <p>محدوده مسئولیت‌های آوینا:</p>
        <ul class="space-y-2 mt-4">
          <li>• آوینا واسطه بین خریدار و فروشنده است</li>
          <li>• مسئولیت کیفیت کالا با فروشنده است</li>
          <li>• در صورت بروز اختلاف، آوینا میانجی‌گری می‌کند</li>
        </ul>
      `,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-2xl shadow-blue-500/25 mb-6">
            <FileText className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            قوانین و مقررات
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            لطفاً قبل از استفاده از پلتفرم آوینا، این قوانین و شرایط را به دقت
            مطالعه کنید
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                فهرست مطالب
              </h3>
              <nav className="space-y-3">
                {sections.map((section, index) => {
                  const IconComponent = section.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => setActiveSection(index)}
                      className={`w-full text-right p-4 rounded-2xl transition-all duration-300 flex items-center space-x-3 space-x-reverse ${
                        activeSection === index
                          ? "bg-blue-50 text-blue-600 border-2 border-blue-200"
                          : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                      }`}
                    >
                      <IconComponent className="h-5 w-5 flex-shrink-0" />
                      <span className="flex-1">{section.title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
              <div className="flex items-center space-x-4 space-x-reverse mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                  {React.createElement(sections[activeSection].icon, {
                    className: "h-6 w-6 text-white",
                  })}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {sections[activeSection].title}
                </h2>
              </div>

              <div
                className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: sections[activeSection].content,
                }}
              />

              {/* Important Notes */}
              <div className="mt-8 p-6 bg-yellow-50 rounded-2xl border border-yellow-200">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-yellow-800 mb-2">توجه مهم</h4>
                    <p className="text-yellow-700 text-sm">
                      این قوانین ممکن است در طول زمان به روزرسانی شوند. لطفاً
                      periodically این صفحه را بررسی کنید تا از تغییرات مطلع
                      شوید.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Acceptance Section */}
            <div className="mt-8 bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-8 text-white shadow-2xl">
              <div className="flex items-center space-x-4 space-x-reverse mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
                <h3 className="text-xl font-bold">تأیید قوانین</h3>
              </div>
              <p className="text-green-100 mb-6">
                با استفاده از پلتفرم آوینا، شما تأیید می‌کنید که این قوانین و
                شرایط را به طور کامل خوانده و درک کرده‌اید و با تمام بندهای آن
                موافق هستید.
              </p>
              <div className="flex items-center space-x-3 space-x-reverse text-green-200">
                <span>آخرین به‌روزرسانی:</span>
                <span className="font-bold">۱۴۰۲/۱۰/۱۵</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
