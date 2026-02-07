// app/store-owner/dashboard/orders/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  Package,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  RefreshCw,
  Loader2,
  AlertCircle,
  Calendar,
  CreditCard,
  MapPin,
  Edit,
  MoreVertical,
  Copy,
  Trash2,
  Save,
  X,
  Mail,
  Phone,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  User,
  DollarSign,
  TrendingUp,
  Store,
  MessageSquare,
  Hash,
  AlertTriangle,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const MEDIA_BASE_URL = "http://127.0.0.1:8000";

// Utility functions
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
};

const formatPrice = (price) => {
  if (!price && price !== 0) return "۰ تومان";
  const numPrice = parseFloat(price) || 0;
  return new Intl.NumberFormat("fa-IR").format(numPrice) + " تومان";
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getRelativeTime = (dateString) => {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins} دقیقه قبل`;
  } else if (diffHours < 24) {
    return `${diffHours} ساعت قبل`;
  } else if (diffDays < 30) {
    return `${diffDays} روز قبل`;
  } else {
    return formatDate(dateString);
  }
};

const getOrderStatus = (status) => {
  const statusMap = {
    pending: "در انتظار پرداخت",
    paid: "پرداخت شده",
    shipped: "ارسال شده",
    delivered: "تحویل داده شده",
    cancelled: "لغو شده",
  };
  return statusMap[status] || status;
};

const getStatusColor = (status) => {
  const colorMap = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    paid: "bg-blue-100 text-blue-800 border-blue-200",
    shipped: "bg-purple-100 text-purple-800 border-purple-200",
    delivered: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
  };
  return colorMap[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

const getStatusIcon = (status) => {
  const iconMap = {
    pending: Clock,
    paid: CreditCard,
    shipped: Truck,
    delivered: CheckCircle,
    cancelled: XCircle,
  };
  return iconMap[status] || Package;
};

const getPaymentMethodText = (method) => {
  const methodMap = {
    online: "پرداخت آنلاین",
    cash: "پرداخت در محل",
    bank_transfer: "کارت به کارت",
  };
  return methodMap[method] || method || "—";
};

const statusFilters = [
  { id: "all", label: "همه سفارشات", status: null },
  { id: "pending", label: "در انتظار پرداخت", status: "pending" },
  { id: "paid", label: "پرداخت شده", status: "paid" },
  { id: "shipped", label: "ارسال شده", status: "shipped" },
  { id: "delivered", label: "تحویل داده شده", status: "delivered" },
  { id: "cancelled", label: "لغو شده", status: "cancelled" },
];

// Payment method options
const paymentMethods = [
  { value: "online", label: "پرداخت آنلاین" },
  { value: "cash", label: "پرداخت در محل" },
  { value: "bank_transfer", label: "کارت به کارت" },
];

export default function StoreOwnerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0,
  });
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [showTrackingModal, setShowTrackingModal] = useState(null);

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editForm, setEditForm] = useState({
    status: "",
    tracking_number: "",
    payment_method: "",
    shipping_address: {
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      postalCode: "",
      phone: "",
      note: "",
    },
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      toast.error("لطفا ابتدا وارد حساب کاربری خود شوید");
      router.push("/auth/store-owner-login");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/orders/store-orders/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("accessToken");
          toast.error("لطفا مجددا وارد حساب کاربری خود شوید");
          router.push("/auth/store-owner-login");
          return;
        }
        if (response.status === 404) {
          setOrders([]);
          setTotalOrders(0);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Store orders data received:", data);

      // Handle array response
      let ordersData = Array.isArray(data) ? data : [];

      // Apply filters
      let filteredOrders = ordersData;
      if (statusFilter !== "all") {
        const statusObj = statusFilters.find((f) => f.id === statusFilter);
        if (statusObj?.status) {
          filteredOrders = ordersData.filter(
            (order) => order.status === statusObj.status
          );
        }
      }

      if (searchQuery) {
        filteredOrders = filteredOrders.filter(
          (order) =>
            order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.tracking_number
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            order.user?.full_name
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            order.shipping_address?.phone
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase())
        );
      }

      setOrders(filteredOrders);
      setTotalOrders(filteredOrders.length);
      calculateOrderStats(ordersData);
    } catch (error) {
      console.error("Error fetching store orders:", error);
      toast.error("خطا در دریافت سفارشات");
    } finally {
      setLoading(false);
    }
  }, [router, statusFilter, searchQuery]);

  // Calculate order statistics
  const calculateOrderStats = useCallback((ordersList) => {
    const stats = {
      total: ordersList.length,
      pending: ordersList.filter((o) => o.status === "pending").length,
      paid: ordersList.filter((o) => o.status === "paid").length,
      shipped: ordersList.filter((o) => o.status === "shipped").length,
      delivered: ordersList.filter((o) => o.status === "delivered").length,
      cancelled: ordersList.filter((o) => o.status === "cancelled").length,
      totalRevenue: ordersList.reduce(
        (sum, order) => sum + (parseFloat(order.total_amount) || 0),
        0
      ),
    };
    setOrderStats(stats);
  }, []);

  // Update order status via dedicated endpoint
  const handleUpdateStatus = async (orderId, newStatus) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      setUpdatingOrder(orderId);

      const response = await fetch(
        `${API_BASE_URL}/orders/${orderId}/update-status/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        await fetchOrders();
        toast.success("وضعیت سفارش با موفقیت به‌روزرسانی شد");
        setShowStatusDropdown(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || "خطا در به‌روزرسانی وضعیت");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setUpdatingOrder(null);
    }
  };

  // Add tracking number
  const handleAddTracking = async (orderId) => {
    if (!trackingNumber.trim()) {
      toast.error("لطفا کد رهگیری را وارد کنید");
      return;
    }

    const token = getAuthToken();
    if (!token) return;

    try {
      setUpdatingOrder(orderId);

      const response = await fetch(
        `${API_BASE_URL}/orders/${orderId}/add-tracking/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tracking_number: trackingNumber }),
        }
      );

      if (response.ok) {
        await fetchOrders();
        setTrackingNumber("");
        setShowTrackingModal(null);
        toast.success("کد رهگیری با موفقیت اضافه شد");
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || "خطا در اضافه کردن کد رهگیری");
      }
    } catch (error) {
      console.error("Error adding tracking:", error);
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setUpdatingOrder(null);
    }
  };

  // Open edit modal
  const handleEditClick = (order) => {
    setEditingOrder(order);
    setEditForm({
      status: order.status,
      tracking_number: order.tracking_number || "",
      payment_method: order.payment_method,
      shipping_address: {
        firstName: order.shipping_address?.firstName || "",
        lastName: order.shipping_address?.lastName || "",
        address: order.shipping_address?.address || "",
        city: order.shipping_address?.city || "",
        postalCode: order.shipping_address?.postalCode || "",
        phone: order.shipping_address?.phone || "",
        note: order.shipping_address?.note || "",
      },
    });
    setShowEditModal(true);
  };

  // Handle edit form changes
  const handleEditChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setEditForm((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setEditForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Update order (PUT - full update)
  const handleUpdateOrder = async (orderId) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      setUpdatingOrder(orderId);

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        await fetchOrders();
        setShowEditModal(false);
        setEditingOrder(null);
        toast.success("سفارش با موفقیت به‌روزرسانی شد");
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || "خطا در به‌روزرسانی سفارش");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setUpdatingOrder(null);
    }
  };

  // Partial update order (PATCH)
  const handlePartialUpdate = async (orderId, data) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      setUpdatingOrder(orderId);

      const response = await fetch(`${API_BASE_URL}orders/${orderId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchOrders();
        toast.success("سفارش با موفقیت به‌روزرسانی شد");
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || "خطا در به‌روزرسانی سفارش");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setUpdatingOrder(null);
    }
  };

  // Delete order
  const handleDeleteOrder = async (orderId) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      setUpdatingOrder(orderId);

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchOrders();
        setShowDeleteConfirm(null);
        toast.success("سفارش با موفقیت حذف شد");
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || "خطا در حذف سفارش");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setUpdatingOrder(null);
    }
  };

  // Cancel order
  const handleCancelOrder = async (orderId) => {
    await handleUpdateStatus(orderId, "cancelled");
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  // Handle filter change
  const handleFilterChange = (filterId) => {
    setStatusFilter(filterId);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchOrders();
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("کپی شد");
  };

  // Get product image URL
  const getProductImageUrl = (product) => {
    if (!product) return null;

    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      const imagePath = product.images[0];
      if (imagePath.startsWith("/media/")) {
        return `${MEDIA_BASE_URL}${imagePath}`;
      }
      return `${MEDIA_BASE_URL}/media/${imagePath}`;
    }

    return null;
  };

  // Status update options for dropdown
  const getStatusUpdateOptions = (currentStatus) => {
    const options = {
      pending: [
        {
          value: "paid",
          label: "علامت‌گذاری به عنوان پرداخت شده",
          color: "text-blue-600",
        },
        { value: "cancelled", label: "لغو سفارش", color: "text-red-600" },
      ],
      paid: [
        { value: "shipped", label: "شروع ارسال", color: "text-purple-600" },
        { value: "cancelled", label: "لغو سفارش", color: "text-red-600" },
      ],
      shipped: [
        {
          value: "delivered",
          label: "تحویل داده شده",
          color: "text-green-600",
        },
      ],
      delivered: [],
      cancelled: [],
    };
    return options[currentStatus] || [];
  };

  // Get store info from first order (assuming all orders belong to same store)
  const getStoreInfo = () => {
    if (orders.length > 0 && orders[0].store) {
      return orders[0].store;
    }
    return null;
  };

  // Initialize
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Loading state
  if (loading && !orders.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">در حال بارگذاری سفارشات...</p>
        </div>
      </div>
    );
  }

  // No auth state
  if (!getAuthToken()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            نیاز به ورود به حساب فروشگاه
          </h2>
          <p className="text-gray-600 mb-8">
            برای مشاهده سفارشات فروشگاه، لطفا وارد حساب کاربری فروشگاه خود شوید
          </p>
          <button
            onClick={() => router.push("/auth/store-owner-login")}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full"
          >
            ورود به حساب فروشگاه
          </button>
        </div>
      </div>
    );
  }

  const storeInfo = getStoreInfo();

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          className: "font-vazirmatn",
          style: {
            fontFamily: "var(--font-vazirmatn), sans-serif",
            direction: "rtl",
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        }}
      />

      <div className="space-y-6 font-vazirmatn" dir="rtl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              مدیریت سفارشات فروشگاه
            </h1>
            <p className="text-gray-600 mt-1">
              {storeInfo
                ? `فروشگاه: ${storeInfo.store_name}`
                : "مشاهده و مدیریت تمام سفارشات مشتریان"}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ml-2 ${loading ? "animate-spin" : ""}`}
              />
              به‌روزرسانی
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Printer className="w-4 h-4 ml-2" />
              چاپ گزارش
            </button>
          </div>
        </div>

        {/* Store Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">کل سفارشات</p>
                <p className="text-2xl font-bold mt-1">{orderStats.total}</p>
              </div>
              <Package className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">تحویل شده</p>
                <p className="text-2xl font-bold mt-1">
                  {orderStats.delivered}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  {orderStats.delivered > 0 && orderStats.total > 0
                    ? `${Math.round(
                        (orderStats.delivered / orderStats.total) * 100
                      )}%`
                    : "۰%"}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">در انتظار</p>
                <p className="text-2xl font-bold mt-1">{orderStats.pending}</p>
                <p className="text-xs opacity-75 mt-1">
                  {orderStats.paid > 0 && `${orderStats.paid} پرداخت شده`}
                </p>
              </div>
              <Clock className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">در حال ارسال</p>
                <p className="text-2xl font-bold mt-1">{orderStats.shipped}</p>
                <p className="text-xs opacity-75 mt-1">کد رهگیری اضافه کنید</p>
              </div>
              <Truck className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">لغو شده</p>
                <p className="text-2xl font-bold mt-1">
                  {orderStats.cancelled}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  {orderStats.cancelled > 0 && orderStats.total > 0
                    ? `${Math.round(
                        (orderStats.cancelled / orderStats.total) * 100
                      )}%`
                    : "۰%"}
                </p>
              </div>
              <XCircle className="w-8 h-8 opacity-80" />
            </div>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">درآمد کل فروشگاه</p>
              <p className="text-3xl font-bold mt-1">
                {formatPrice(orderStats.totalRevenue)}
              </p>
              <p className="text-xs opacity-75 mt-1">
                از {orderStats.total} سفارش
              </p>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <DollarSign className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex-1 max-w-md"
            >
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="جستجو بر اساس شماره سفارش، کد رهگیری، نام مشتری یا شماره تماس..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </form>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">
                فیلتر بر اساس وضعیت:
              </span>
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {statusFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleFilterChange(filter.id)}
                className={`px-3 py-2 rounded-lg text-sm transition-all border ${
                  filter.id === statusFilter
                    ? `${getStatusColor(filter.status)} font-medium`
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Grid */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                سفارشی یافت نشد
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || statusFilter !== "all"
                  ? "با فیلترهای انتخابی شما سفارشی یافت نشد"
                  : "هنوز سفارشی برای فروشگاه شما ثبت نشده است"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {orders.map((order) => {
                  const StatusIcon = getStatusIcon(order.status);
                  const itemsCount =
                    order.items_count || (order.items ? order.items.length : 0);
                  const totalAmount = parseFloat(order.total_amount) || 0;
                  const user = order.user;
                  const shippingAddress = order.shipping_address;
                  const updateOptions = getStatusUpdateOptions(order.status);

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Order Header */}
                      <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <div
                              className={`p-2 rounded-lg ${getStatusColor(
                                order.status
                              )}`}
                            >
                              <StatusIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <span className="font-medium text-gray-900">
                                  سفارش #{order.id.slice(-8).toUpperCase()}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    order.status
                                  )}`}
                                >
                                  {getOrderStatus(order.status)}
                                </span>
                              </div>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Calendar className="w-3 h-3 ml-1" />
                                <span>{getRelativeTime(order.created_at)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="text-left">
                              <div className="text-sm text-gray-500">
                                مبلغ سفارش
                              </div>
                              <div className="font-bold text-gray-900 text-lg">
                                {formatPrice(totalAmount)}
                              </div>
                            </div>

                            {/* Actions Dropdown */}
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setShowStatusDropdown(
                                    showStatusDropdown === order.id
                                      ? null
                                      : order.id
                                  )
                                }
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                              >
                                <MoreVertical className="w-5 h-5" />
                              </button>

                              {showStatusDropdown === order.id && (
                                <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                  <div className="py-1">
                                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                                      مدیریت سفارش
                                    </div>

                                    {/* Status Update Options */}
                                    {updateOptions.map((option) => (
                                      <button
                                        key={option.value}
                                        onClick={() =>
                                          handleUpdateStatus(
                                            order.id,
                                            option.value
                                          )
                                        }
                                        disabled={updatingOrder === order.id}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                      >
                                        {updatingOrder === order.id ? (
                                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                        ) : (
                                          <Edit
                                            className={`w-4 h-4 ml-2 ${option.color}`}
                                          />
                                        )}
                                        {option.label}
                                      </button>
                                    ))}

                                    {/* Add Tracking */}
                                    {(order.status === "shipped" ||
                                      order.status === "paid") &&
                                      !order.tracking_number && (
                                        <button
                                          onClick={() => {
                                            setShowTrackingModal(order.id);
                                            setShowStatusDropdown(null);
                                          }}
                                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                          <Truck className="w-4 h-4 ml-2 text-purple-600" />
                                          افزودن کد رهگیری
                                        </button>
                                      )}

                                    {/* Edit Order */}
                                    <button
                                      onClick={() => handleEditClick(order)}
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-100"
                                    >
                                      <Edit className="w-4 h-4 ml-2 text-blue-600" />
                                      ویرایش کامل سفارش
                                    </button>

                                    {/* View Details */}
                                    <Link
                                      href={`/store-owner/dashboard/orders/${order.id}`}
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <Eye className="w-4 h-4 ml-2 text-green-600" />
                                      مشاهده جزئیات
                                    </Link>

                                    {/* Cancel Order */}
                                    {order.status !== "cancelled" &&
                                      order.status !== "delivered" && (
                                        <button
                                          onClick={() => {
                                            setShowDeleteConfirm({
                                              id: order.id,
                                              action: "cancel",
                                            });
                                            setShowStatusDropdown(null);
                                          }}
                                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-red-600"
                                        >
                                          <XCircle className="w-4 h-4 ml-2" />
                                          لغو سفارش
                                        </button>
                                      )}

                                    {/* Delete Order (Admin only) */}
                                    <button
                                      onClick={() => {
                                        setShowDeleteConfirm({
                                          id: order.id,
                                          action: "delete",
                                        });
                                        setShowStatusDropdown(null);
                                      }}
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-100 text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 ml-2" />
                                      حذف سفارش
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Customer Info */}
                          <div className="space-y-3">
                            <div className="flex items-start space-x-2 space-x-reverse">
                              <User className="w-5 h-5 text-gray-400 mt-0.5" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  مشتری
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {user?.full_name ||
                                    shippingAddress?.firstName +
                                      " " +
                                      shippingAddress?.lastName ||
                                    "نامشخص"}
                                </div>
                                {shippingAddress?.phone && (
                                  <div className="text-xs text-gray-500 mt-1 flex items-center">
                                    <Phone className="w-3 h-3 ml-1" />
                                    {shippingAddress.phone}
                                    <button
                                      onClick={() =>
                                        copyToClipboard(shippingAddress.phone)
                                      }
                                      className="p-1 text-gray-400 hover:text-gray-600 mr-1"
                                      title="کپی شماره"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Shipping Info */}
                          <div className="space-y-3">
                            <div className="flex items-start space-x-2 space-x-reverse">
                              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  آدرس تحویل
                                </div>
                                <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {shippingAddress?.address || "آدرس مشخص نشده"}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {shippingAddress?.city &&
                                    `شهر: ${shippingAddress.city}`}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Order Summary */}
                          <div className="space-y-3">
                            <div>
                              <div className="text-sm font-medium text-gray-900 mb-2">
                                خلاصه سفارش
                              </div>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    تعداد محصولات:
                                  </span>
                                  <span className="text-gray-900">
                                    {itemsCount} قلم
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    روش پرداخت:
                                  </span>
                                  <span className="text-gray-900">
                                    {getPaymentMethodText(order.payment_method)}
                                  </span>
                                </div>
                                {order.tracking_number && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      کد رهگیری:
                                    </span>
                                    <div className="flex items-center">
                                      <span className="text-gray-900 font-mono text-xs">
                                        {order.tracking_number}
                                      </span>
                                      <button
                                        onClick={() =>
                                          copyToClipboard(order.tracking_number)
                                        }
                                        className="p-1 text-gray-400 hover:text-gray-600 mr-1"
                                        title="کپی کد"
                                      >
                                        <Copy className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order Items Preview */}
                        {order.items && order.items.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="text-sm font-medium text-gray-900 mb-2">
                              محصولات سفارش:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {order.items.slice(0, 3).map((item, index) => {
                                const product = item.product;
                                return (
                                  <div
                                    key={index}
                                    className="flex items-center space-x-2 space-x-reverse p-2 bg-gray-50 rounded-lg border border-gray-200"
                                  >
                                    {product?.images?.[0] && (
                                      <div className="w-8 h-8 rounded border border-gray-300 overflow-hidden flex-shrink-0">
                                        <img
                                          src={getProductImageUrl(product)}
                                          alt={item.title}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )}
                                    <div className="text-xs">
                                      <div className="font-medium text-gray-900 truncate max-w-[120px]">
                                        {item.title || product?.name || "محصول"}
                                      </div>
                                      <div className="text-gray-500">
                                        تعداد: {item.quantity || 1}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                              {order.items.length > 3 && (
                                <div className="text-xs text-gray-500 flex items-center">
                                  و {order.items.length - 3} محصول دیگر...
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Customer Note */}
                        {shippingAddress?.note && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-start space-x-2 space-x-reverse">
                              <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                              <div className="text-sm">
                                <div className="font-medium text-gray-900 mb-1">
                                  یادداشت مشتری:
                                </div>
                                <div className="text-gray-600 bg-gray-50 p-2 rounded-lg">
                                  {shippingAddress.note}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Quick Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 pt-4 border-t border-gray-200 space-y-3 sm:space-y-0">
                          <div className="text-sm text-gray-600">
                            شناسه سفارش:{" "}
                            <span className="font-mono">
                              {order.id.slice(-8).toUpperCase()}
                            </span>
                          </div>

                          <div className="flex items-center space-x-3 space-x-reverse">
                            <button
                              onClick={() => handleEditClick(order)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
                            >
                              <Edit className="w-4 h-4 ml-1" />
                              ویرایش سفارش
                            </button>
                            <Link
                              href={`/store-owner/dashboard/orders/${order.id}`}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center text-sm"
                            >
                              <Eye className="w-4 h-4 ml-1" />
                              جزئیات کامل
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {orders.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="text-sm text-gray-700 mb-4 md:mb-0">
                      نمایش <span className="font-medium">{orders.length}</span>{" "}
                      از <span className="font-medium">{totalOrders}</span>{" "}
                      سفارش
                    </div>

                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <span className="px-4 py-2 text-sm text-gray-700">
                        صفحه {currentPage}
                      </span>

                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={orders.length < 10}
                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Tracking Modal */}
      {showTrackingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  افزودن کد رهگیری
                </h3>
                <button
                  onClick={() => {
                    setShowTrackingModal(null);
                    setTrackingNumber("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                لطفا کد رهگیری سفارش #
                {showTrackingModal.slice(-8).toUpperCase()} را وارد کنید:
              </p>

              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="مثال: TRK123456789"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              />

              <div className="flex space-x-3 space-x-reverse">
                <button
                  onClick={() => {
                    setShowTrackingModal(null);
                    setTrackingNumber("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  انصراف
                </button>
                <button
                  onClick={() => handleAddTracking(showTrackingModal)}
                  disabled={
                    !trackingNumber.trim() ||
                    updatingOrder === showTrackingModal
                  }
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {updatingOrder === showTrackingModal ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      در حال افزودن...
                    </>
                  ) : (
                    "افزودن کد"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditModal && editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full my-8">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  ویرایش سفارش #{editingOrder.id.slice(-8).toUpperCase()}
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingOrder(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Status and Payment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      وضعیت سفارش
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) =>
                        handleEditChange("status", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">در انتظار پرداخت</option>
                      <option value="paid">پرداخت شده</option>
                      <option value="shipped">ارسال شده</option>
                      <option value="delivered">تحویل داده شده</option>
                      <option value="cancelled">لغو شده</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      روش پرداخت
                    </label>
                    <select
                      value={editForm.payment_method}
                      onChange={(e) =>
                        handleEditChange("payment_method", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {paymentMethods.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tracking Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    کد رهگیری
                  </label>
                  <input
                    type="text"
                    value={editForm.tracking_number}
                    onChange={(e) =>
                      handleEditChange("tracking_number", e.target.value)
                    }
                    placeholder="کد رهگیری پستی"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Shipping Address */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    آدرس تحویل
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نام
                      </label>
                      <input
                        type="text"
                        value={editForm.shipping_address.firstName}
                        onChange={(e) =>
                          handleEditChange(
                            "shipping_address.firstName",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نام خانوادگی
                      </label>
                      <input
                        type="text"
                        value={editForm.shipping_address.lastName}
                        onChange={(e) =>
                          handleEditChange(
                            "shipping_address.lastName",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        آدرس کامل
                      </label>
                      <textarea
                        value={editForm.shipping_address.address}
                        onChange={(e) =>
                          handleEditChange(
                            "shipping_address.address",
                            e.target.value
                          )
                        }
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        شهر
                      </label>
                      <input
                        type="text"
                        value={editForm.shipping_address.city}
                        onChange={(e) =>
                          handleEditChange(
                            "shipping_address.city",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        کد پستی
                      </label>
                      <input
                        type="text"
                        value={editForm.shipping_address.postalCode}
                        onChange={(e) =>
                          handleEditChange(
                            "shipping_address.postalCode",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        شماره تماس
                      </label>
                      <input
                        type="tel"
                        value={editForm.shipping_address.phone}
                        onChange={(e) =>
                          handleEditChange(
                            "shipping_address.phone",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        یادداشت
                      </label>
                      <textarea
                        value={editForm.shipping_address.note}
                        onChange={(e) =>
                          handleEditChange(
                            "shipping_address.note",
                            e.target.value
                          )
                        }
                        rows="2"
                        placeholder="یادداشت مشتری"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Order Items (Read-only) */}
                {editingOrder.items && editingOrder.items.length > 0 && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      محصولات سفارش
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {editingOrder.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
                        >
                          <div className="flex items-center">
                            {item.product?.images?.[0] && (
                              <img
                                src={getProductImageUrl(item.product)}
                                alt={item.product?.name}
                                className="w-10 h-10 rounded border border-gray-300 object-cover ml-3"
                              />
                            )}
                            <div>
                              <div className="font-medium">
                                {item.title || item.product?.name || "محصول"}
                              </div>
                              <div className="text-sm text-gray-500">
                                تعداد: {item.quantity} | قیمت:{" "}
                                {formatPrice(item.price)}
                              </div>
                            </div>
                          </div>
                          <div className="font-medium">
                            {formatPrice(
                              parseFloat(item.price) * item.quantity
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between pt-4 border-t border-gray-200 mt-2">
                        <div className="font-bold">جمع کل:</div>
                        <div className="font-bold text-lg">
                          {formatPrice(editingOrder.total_amount)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 space-x-reverse mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingOrder(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  انصراف
                </button>
                <button
                  onClick={() => handleUpdateOrder(editingOrder.id)}
                  disabled={updatingOrder === editingOrder.id}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {updatingOrder === editingOrder.id ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      در حال ذخیره...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 ml-2" />
                      ذخیره تغییرات
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete/Cancel Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                {showDeleteConfirm.action === "cancel"
                  ? "لغو سفارش"
                  : "حذف سفارش"}
              </h3>

              <p className="text-sm text-gray-600 text-center mb-6">
                {showDeleteConfirm.action === "cancel"
                  ? `آیا مطمئن هستید که می‌خواهید سفارش #${showDeleteConfirm.id
                      .slice(-8)
                      .toUpperCase()} را لغو کنید؟`
                  : `آیا مطمئن هستید که می‌خواهید سفارش #${showDeleteConfirm.id
                      .slice(-8)
                      .toUpperCase()} را حذف کنید؟`}
                <br />
                <span className="text-red-500 font-medium">
                  {showDeleteConfirm.action === "cancel"
                    ? "پس از لغو، سفارش قابل بازگشت نیست!"
                    : "این عمل قابل بازگشت نیست!"}
                </span>
              </p>

              <div className="flex space-x-3 space-x-reverse">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  انصراف
                </button>
                <button
                  onClick={() => {
                    if (showDeleteConfirm.action === "cancel") {
                      handleCancelOrder(showDeleteConfirm.id);
                    } else {
                      handleDeleteOrder(showDeleteConfirm.id);
                    }
                  }}
                  disabled={updatingOrder === showDeleteConfirm.id}
                  className={`flex-1 px-4 py-2 ${
                    showDeleteConfirm.action === "cancel"
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "bg-red-600 hover:bg-red-700"
                  } text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
                >
                  {updatingOrder === showDeleteConfirm.id ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      {showDeleteConfirm.action === "cancel"
                        ? "در حال لغو..."
                        : "در حال حذف..."}
                    </>
                  ) : (
                    <>
                      {showDeleteConfirm.action === "cancel" ? (
                        <XCircle className="w-4 h-4 ml-2" />
                      ) : (
                        <Trash2 className="w-4 h-4 ml-2" />
                      )}
                      {showDeleteConfirm.action === "cancel"
                        ? "لغو سفارش"
                        : "حذف سفارش"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
