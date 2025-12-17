// app/user/dashboard/addresses/add/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Save, X } from "lucide-react";
import { toast } from "react-hot-toast";

const BASE_API = process.env.NEXT_PUBLIC_API_URL;

const cities = [
  "تهران",
  "مشهد",
  "اصفهان",
  "شیراز",
  "تبریز",
  "کرج",
  "قم",
  "اهواز",
  "کرمانشاه",
  "ارومیه",
  "رشت",
  "زاهدان",
  "کرمان",
  "همدان",
  "یزد",
  "اردبیل",
  "بندرعباس",
  "اسلام‌شهر",
  "قدس",
  "خرم‌آباد",
  "ساری",
  "گرگان",
];

export default function AddAddressPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    name: "",
    phone: "",
    city: "",
    address: "",
    postal_code: "",
    is_default: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");

      // Validation
      if (
        !formData.title ||
        !formData.name ||
        !formData.phone ||
        !formData.city ||
        !formData.address ||
        !formData.postal_code
      ) {
        toast.error("لطفا تمام فیلدهای الزامی را پر کنید");
        setLoading(false);
        return;
      }

      if (!/^09\d{9}$/.test(formData.phone.replace(/\s/g, ""))) {
        toast.error("شماره تماس معتبر نیست");
        setLoading(false);
        return;
      }

      // API call to add address
      // const response = await fetch(`${BASE_API}/addresses/`, {
      //   method: "POST",
      //   headers: {
      //     "Authorization": `Bearer ${token}`,
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(formData),
      // });

      // Mock success
      setTimeout(() => {
        toast.success("آدرس با موفقیت اضافه شد");
        router.push("/user/dashboard/addresses");
      }, 1000);
    } catch (error) {
      console.error("Add address error:", error);
      toast.error("خطا در اضافه کردن آدرس");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Link
              href="/user/dashboard/addresses"
              className="text-gray-500 hover:text-gray-700"
            >
              آدرس‌ها
            </Link>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <h1 className="text-2xl font-bold text-gray-900">
              افزودن آدرس جدید
            </h1>
          </div>
          <p className="text-gray-600 mt-1">
            اطلاعات آدرس تحویل جدید را وارد کنید
          </p>
        </div>
        <Link
          href="/user/dashboard/addresses"
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
        >
          <X className="w-4 h-4 ml-2" />
          انصراف
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            اطلاعات آدرس
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عنوان آدرس <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="مثال: منزل، محل کار"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                برای شناسایی آدرس استفاده می‌شود
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نام کامل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="نام و نام خانوادگی"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                شماره تماس <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="09123456789"
                required
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                شهر <span className="text-red-500">*</span>
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">انتخاب شهر</option>
                {/* {cities.map((city, index) => (
                  <option key={index} value={city}>
                    {city}
                  </option>
                ))} */}
              </select>
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                کد پستی <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="۱۰ رقمی"
                maxLength="10"
                required
              />
            </div>

            {/* Address Details */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                آدرس کامل <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="خیابان، کوچه، پلاک، طبقه، واحد"
                required
              ></textarea>
            </div>

            {/* Default Address Checkbox */}
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_default"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="is_default"
                  className="mr-2 block text-sm text-gray-900"
                >
                  تنظیم به عنوان آدرس پیش‌فرض
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                آدرس پیش‌فرض برای سفارشات جدید استفاده می‌شود
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                در حال ذخیره...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 ml-2" />
                ذخیره آدرس
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
