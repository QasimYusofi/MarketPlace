"use client";
import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Clock,
  MapPin,
  DollarSign,
  CheckCircle,
  MessageCircle,
} from "lucide-react";

export default function BuyerRequest() {
  const [activeTab, setActiveTab] = useState("new");

  const requests = [
    {
      id: 1,
      title: "لپ‌تاپ گیمینگ",
      description: "به دنبال لپ‌تاپ گیمینگ با کارت گرافیک RTX 4060",
      budget: "۵۰,۰۰۰,۰۰۰",
      location: "تهران",
      time: "۲ ساعت پیش",
      status: "active",
      responses: 12,
    },
    {
      id: 2,
      title: "گوشی موبایل",
      description: "گوشی سامسونگ سری S با شرایط مناسب",
      budget: "۲۰,۰۰۰,۰۰۰",
      location: "مشهد",
      time: "۵ ساعت پیش",
      status: "active",
      responses: 8,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-2xl shadow-blue-500/25 mb-6">
            <Search className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            نحوۀ ثبت درخواست
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            محصول مورد نظر خود را پیدا نکرده‌اید؟ درخواست خود را ثبت کنید تا
            فروشندگان به شما پیشنهاد دهند
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Request Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                ثبت درخواست جدید
              </h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عنوان درخواست
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                    placeholder="مثال: لپ‌تاپ گیمینگ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    توضیحات
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 resize-none"
                    placeholder="جزئیات محصول مورد نظر خود را بنویسید..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    بودجه (ریال)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                    placeholder="مثال: ۵۰,۰۰۰,۰۰۰"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    موقعیت مکانی
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                    placeholder="مثال: تهران"
                  />
                </div>

                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-bold shadow-2xl shadow-blue-500/25 hover:shadow-3xl hover:shadow-purple-500/25 flex items-center justify-center">
                  <Plus className="h-5 w-5 ml-2" />
                  ثبت درخواست
                </button>
              </form>
            </div>
          </div>

          {/* Requests List */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 mb-6">
              <div className="flex space-x-4 space-x-reverse border-b border-gray-200">
                {[
                  { id: "new", label: "درخواست‌های فعال", count: 8 },
                  { id: "responses", label: "پاسخ‌ها", count: 3 },
                  { id: "completed", label: "تکمیل شده", count: 12 },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-4 px-4 border-b-2 transition-all duration-300 font-medium ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full mr-2">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Requests */}
            <div className="space-y-6">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 hover:shadow-3xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {request.title}
                    </h3>
                    <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-medium">
                      فعال
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4">{request.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span>{request.budget} ریال</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span>{request.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span>{request.time}</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                      <MessageCircle className="h-4 w-4 text-purple-600" />
                      <span>{request.responses} پاسخ</span>
                    </div>
                  </div>

                  <div className="flex space-x-3 space-x-reverse">
                    <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl hover:bg-blue-100 transition-all duration-300 font-medium flex items-center">
                      <MessageCircle className="h-4 w-4 ml-2" />
                      مشاهده پاسخ‌ها
                    </button>
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-2xl hover:bg-gray-200 transition-all duration-300 font-medium">
                      ویرایش
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-6 text-white shadow-2xl mt-8">
              <h3 className="text-lg font-bold mb-4">نکات مهم</h3>
              <div className="space-y-2 text-blue-100">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  <span>درخواست‌های دقیق‌تر پاسخ‌های بهتری دریافت می‌کنند</span>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  <span>
                    بودجه واقعی تعیین کنید تا پیشنهادات مناسب دریافت کنید
                  </span>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  <span>موقعیت مکانی خود را دقیق مشخص کنید</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
