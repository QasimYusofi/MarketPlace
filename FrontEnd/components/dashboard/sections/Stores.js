"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  Store,
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  X,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Users,
  ShoppingBag,
  Star,
  CheckCircle,
  Clock,
  Search,
  Filter,
  MoreVertical,
  ArrowRight,
  Building2,
  FileText,
  Globe,
  Tag,
} from "lucide-react";

export default function Stores() {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await fetch("/api/stores?owner=me");
      const result = await response.json();

      if (result.success) {
        setStores(result.data);
      } else {
        toast.error("خطا در دریافت فروشگاه‌ها");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setStores((prev) => [...prev, result.data]);

        toast.success("🎉 فروشگاه با موفقیت ایجاد شد");
        reset();
      } else {
        toast.error(result.message || "خطا در ایجاد فروشگاه");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsCreating(false);
    }
  };

  const deleteStore = async (storeId) => {
    if (!confirm("آیا از حذف این فروشگاه اطمینان دارید؟")) return;

    try {
      const response = await fetch(`/api/stores/${storeId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setStores((prev) => prev.filter((store) => store._id !== storeId));
        toast.success("✅ فروشگاه با موفقیت حذف شد");
      } else {
        toast.error(result.message || "خطا در حذف فروشگاه");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    }
  };

  // Filter stores based on search and active filter
  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "active" && store.isActive) ||
      (activeFilter === "inactive" && !store.isActive);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: stores.length,
    active: stores.filter((store) => store.isActive).length,
    products: stores.reduce((sum, store) => sum + (store.productCount || 0), 0),
    revenue: stores.reduce((sum, store) => sum + (store.revenue || 0), 0),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-gray-600 flex items-center">
            <Clock className="ml-2 animate-pulse" />
            در حال بارگذاری فروشگاه‌ها...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Building2 className="ml-3 text-blue-600" />
            فروشگاه‌های من
          </h1>
          <p className="text-gray-600 mt-2">
            مدیریت و پیگیری تمام فروشگاه‌های شما در یک مکان
          </p>
        </div>

        <div className="flex items-center space-x-3 space-x-reverse">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center">
            <Filter className="ml-2 w-4 h-4" />
            فیلترها
          </button>
          <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center">
            <Plus className="ml-2 w-5 h-5" />
            فروشگاه جدید
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">کل فروشگاه‌ها</p>
              <p className="text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <Store className="w-8 h-8 text-black" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">فعال</p>
              <p className="text-3xl font-bold mt-2">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-black" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">محصولات</p>
              <p className="text-3xl font-bold mt-2">{stats.products}</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <Package className="w-8 h-8 text-black" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">درآمد کل</p>
              <p className="text-3xl font-bold mt-2">
                {stats.revenue.toLocaleString()} ریال
              </p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-black" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Create Store Form */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Plus className="ml-2 text-green-500" />
                ایجاد فروشگاه جدید
              </h2>
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <Store className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Tag className="ml-1 w-4 h-4" />
                  نام فروشگاه
                </label>
                <input
                  type="text"
                  {...register("name", { required: "نام فروشگاه الزامی است" })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="نام فروشگاه خود را وارد کنید"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FileText className="ml-1 w-4 h-4" />
                  توضیحات
                </label>
                <textarea
                  {...register("description", {
                    required: "توضیحات فروشگاه الزامی است",
                  })}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="توضیحات کامل درباره فروشگاه"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Mail className="ml-1 w-4 h-4" />
                    ایمیل تماس
                  </label>
                  <input
                    type="email"
                    {...register("contactEmail", {
                      required: "ایمیل تماس الزامی است",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "ایمیل معتبر نیست",
                      },
                    })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="email@example.com"
                  />
                  {errors.contactEmail && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.contactEmail.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Phone className="ml-1 w-4 h-4" />
                    شماره تماس
                  </label>
                  <input
                    type="tel"
                    {...register("phone", {
                      required: "شماره تماس الزامی است",
                    })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="09XXXXXXXXX"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <MapPin className="ml-1 w-4 h-4" />
                  آدرس
                </label>
                <textarea
                  {...register("address", {
                    required: "آدرس فروشگاه الزامی است",
                  })}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="آدرس کامل فروشگاه"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                {isCreating ? (
                  <>
                    <Clock className="ml-2 w-5 h-5 animate-spin" />
                    در حال ایجاد...
                  </>
                ) : (
                  <>
                    <Plus className="ml-2 w-5 h-5" />
                    ایجاد فروشگاه
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Stores List */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <ShoppingBag className="ml-2 text-purple-500" />
                فروشگاه‌های شما
                <span className="mr-2 text-sm font-normal text-gray-500">
                  ({filteredStores.length} فروشگاه)
                </span>
              </h2>

              <div className="flex items-center space-x-3 space-x-reverse gap-x-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="جستجو در فروشگاه‌ها..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 pr-10 pl-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
                  />
                </div>

                {/* Filter Buttons */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {[
                    { key: "all", label: "همه", icon: Store },
                    { key: "active", label: "فعال", icon: CheckCircle },
                    { key: "inactive", label: "غیرفعال", icon: Clock },
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setActiveFilter(key)}
                      className={`px-3 py-1 rounded-md text-sm font-medium flex items-center transition-all duration-200 ${
                        activeFilter === key
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="ml-1 w-3 h-3" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredStores.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Store className="text-gray-400 text-3xl" />
                </div>
                <p className="text-gray-500 text-lg mb-2">
                  هنوز فروشگاهی ایجاد نکرده‌اید.
                </p>
                <p className="text-gray-400 text-sm">
                  برای شروع، اولین فروشگاه خود را ایجاد کنید
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredStores.map((store) => (
                  <div
                    key={store._id}
                    className="border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 group cursor-pointer bg-gradient-to-br from-white to-gray-50 hover:from-blue-50 hover:to-blue-100"
                    onClick={() => setSelectedStore(store)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3 space-x-reverse gap-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <Store className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                            {store.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                            {store.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 space-x-reverse">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteStore(store._id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex text-sm font-semibold gap-y-1 flex-col justify-en p-2 items-start">
                          <span className="flex items-center text-gray-600">
                            <Mail className="ml-1 w-3 h-3" />
                            {store.contactEmail}
                          </span>
                          <span className="flex items-center text-gray-600">
                            <Phone className="ml-1 w-3 h-3" />
                            {store.phone}
                          </span>
                        </div>

                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            store.isActive
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          {store.isActive ? (
                            <>
                              <CheckCircle className="ml-1 w-3 h-3" />
                              فعال
                            </>
                          ) : (
                            <>
                              <Clock className="ml-1 w-3 h-3" />
                              غیرفعال
                            </>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(store.createdAt).toLocaleDateString(
                              "fa-IR"
                            )}
                          </span>
                        </div>

                        <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
                          مشاهده جزئیات
                          <ArrowRight className="mr-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Store Details Modal */}
      {selectedStore && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm ">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-sky-300">
            <div className="p-8 ">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                    <Store className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedStore.name}
                    </h2>
                    <p className="text-gray-600 mt-1">جزئیات کامل فروشگاه</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStore(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  <X className="w-6 h-6 text-red-400 font-bold" />
                </button>
              </div>

              {/* Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="ml-2 text-blue-600" />
                      توضیحات فروشگاه
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedStore.description}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <MapPin className="ml-2 text-gray-600" />
                      آدرس فروشگاه
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedStore.address}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Users className="ml-2 text-green-600" />
                      اطلاعات تماس
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-700">
                        <Mail className="ml-2 w-4 h-4 text-green-600" />
                        {selectedStore.contactEmail}
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Phone className="ml-2 w-4 h-4 text-green-600" />
                        {selectedStore.phone}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Calendar className="ml-2 text-purple-600" />
                      اطلاعات زمانی
                    </h3>
                    <div className="space-y-2 text-gray-700">
                      <div>
                        تاریخ ایجاد:{" "}
                        {new Date(selectedStore.createdAt).toLocaleDateString(
                          "fa-IR"
                        )}
                      </div>
                      <div>
                        آخرین به‌روزرسانی:{" "}
                        {new Date(selectedStore.updatedAt).toLocaleDateString(
                          "fa-IR"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex space-x-3 space-x-reverse gap-x-4">
                <button
                  onClick={() => {
                    window.location.href = `/dashboard/products?store=${selectedStore._id}`;
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <Package className="ml-2 w-5 h-5" />
                  مشاهده محصولات
                </button>
                <button
                  onClick={() => setSelectedStore(null)}
                  className="px-6 py-4 bg-red-300 font-bold text-black rounded-xl hover:bg-red-500 transition-all duration-200 flex items-center"
                >
                  <X className="ml-2 w-5 h-5 text-black" />
                  بستن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
