// app/user/dashboard/addresses/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, MapPin, Edit, Trash2, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";

const BASE_API = process.env.NEXT_PUBLIC_API_URL;

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    const token = localStorage.getItem("accessToken");

    try {
      // Mock data - replace with actual API call
      const mockAddresses = [
        {
          id: 1,
          title: "منزل",
          name: "علی محمدی",
          address: "تهران، خیابان ولیعصر، پلاک ۱۲۳، طبقه ۲، واحد ۴",
          city: "تهران",
          postal_code: "1234567890",
          phone: "09123456789",
          is_default: true,
        },
        {
          id: 2,
          title: "محل کار",
          name: "علی محمدی",
          address: "تهران، میدان ونک، خیابان ملاصدرا، پلاک ۴۵",
          city: "تهران",
          postal_code: "9876543210",
          phone: "09187654321",
          is_default: false,
        },
        {
          id: 3,
          title: "خانه پدری",
          name: "علی محمدی",
          address: "مشهد، بلوار وکیل آباد، کوچه گلستان، پلاک ۱۲",
          city: "مشهد",
          postal_code: "4567890123",
          phone: "05131234567",
          is_default: false,
        },
      ];

      setAddresses(mockAddresses);
    } catch (error) {
      console.error("Addresses fetch error:", error);
      toast.error("خطا در دریافت آدرس‌ها");
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      // API call to set default address
      toast.success("آدرس پیش‌فرض با موفقیت تغییر کرد");
      setAddresses(
        addresses.map((addr) => ({
          ...addr,
          is_default: addr.id === addressId,
        }))
      );
    } catch (error) {
      toast.error("خطا در تغییر آدرس پیش‌فرض");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm("آیا از حذف این آدرس مطمئن هستید؟")) return;

    try {
      // API call to delete address
      setAddresses(addresses.filter((addr) => addr.id !== addressId));
      toast.success("آدرس با موفقیت حذف شد");
    } catch (error) {
      toast.error("خطا در حذف آدرس");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">آدرس‌های من</h1>
          <p className="text-gray-600 mt-1">مدیریت آدرس‌های تحویل و صورتحساب</p>
        </div>
        <Link
          href="/user/dashboard/addresses/add"
          className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 ml-2" />
          افزودن آدرس جدید
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            هیچ آدرسی ثبت نشده است
          </h3>
          <p className="text-gray-500 mb-6">
            برای ثبت سفارش نیاز به ثبت آدرس دارید
          </p>
          <Link
            href="/user/dashboard/addresses/add"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 ml-2" />
            افزودن اولین آدرس
          </Link>
        </div>
      ) : (
        <>
          {/* Addresses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`bg-white rounded-xl shadow-sm border p-6 relative transition-all duration-200 hover:shadow-md ${
                  address.is_default
                    ? "border-blue-300 border-2"
                    : "border-gray-200"
                }`}
              >
                {address.is_default && (
                  <div className="absolute -top-2 -right-2">
                    <div className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full flex items-center">
                      <CheckCircle className="w-3 h-3 ml-1" />
                      پیش‌فرض
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="mr-3">
                      <h3 className="font-medium text-gray-900">
                        {address.title}
                      </h3>
                      <p className="text-sm text-gray-500">{address.name}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      آدرس
                    </label>
                    <p className="text-gray-900 text-sm">{address.address}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        شهر
                      </label>
                      <p className="text-gray-900 text-sm">{address.city}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        کد پستی
                      </label>
                      <p className="text-gray-900 text-sm">
                        {address.postal_code}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      شماره تماس
                    </label>
                    <p className="text-gray-900 text-sm">{address.phone}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className={`text-sm ${
                        address.is_default
                          ? "text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      disabled={address.is_default}
                    >
                      {address.is_default
                        ? "پیش‌فرض"
                        : "انتخاب به عنوان پیش‌فرض"}
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Link
                      href={`/user/dashboard/addresses/edit/${address.id}`}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Address Card */}
            <Link
              href="/user/dashboard/addresses/add"
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <Plus className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">
                افزودن آدرس جدید
              </h3>
              <p className="text-sm text-gray-500 text-center">
                برای سفارشات جدید و آسان‌تر کردن خرید
              </p>
            </Link>
          </div>

          {/* Address Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              نکات مهم درباره آدرس‌ها
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 ml-2"></div>
                <span>آدرس پیش‌فرض برای سفارشات جدید استفاده می‌شود</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 ml-2"></div>
                <span>می‌توانید حداکثر ۵ آدرس ثبت کنید</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 ml-2"></div>
                <span>اطلاعات تماس باید معتبر و به روز باشد</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 ml-2"></div>
                <span>کد پستی صحیح تحویل سریع‌تر را تضمین می‌کند</span>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
