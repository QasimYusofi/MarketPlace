"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Store,
  Package,
  ClipboardList,
  Star,
  Heart,
  ShoppingCart,
  LogOut,
  Settings,
  X,
  HelpCircle,
  CreditCard,
  HomeIcon,
} from "lucide-react";

const menuItems = [
  {
    id: "overview",
    label: "داشبورد",
    icon: LayoutDashboard,
    color: "text-blue-600",
  },
  { id: "profile", label: "پروفایل", icon: User, color: "text-emerald-600" },
  // { id: "stores", label: "فروشگاه من", icon: Store, color: "text-violet-600" },
  { id: "products", label: "محصولات", icon: Package, color: "text-amber-600" },
  {
    id: "orders",
    label: "سفارشات",
    icon: ClipboardList,
    color: "text-indigo-600",
  },
  // {
  //   id: "subscriptions",
  //   label: "تیک من",
  //   icon: Star,
  //   color: "text-yellow-600",
  // },
  // { id: "wishlist", label: "علاقه‌مندی", icon: Heart, color: "text-rose-600" },
  // { id: "cart", label: "سبد خرید", icon: ShoppingCart, color: "text-cyan-600" },
];

export default function MobileDrawer({
  isOpen,
  onClose,
  currentSection,
  user,
}) {
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleNavigation = (section) => {
    router.push(`/dashboard${section === "overview" ? "" : `/${section}`}`);
    onClose();
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/session", {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        router.push("/auth/login");
        onClose();
      }
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/auth/login");
    }
  };

  const getImageUrl = (imageData) => {
    if (!imageData || !imageData.data) return null;

    try {
      // Handle different buffer formats
      let bufferData;

      if (Buffer.isBuffer(imageData)) {
        // If it's already a Buffer
        bufferData = imageData;
      } else if (imageData.type === "Buffer" && Array.isArray(imageData.data)) {
        // If it's stored as Buffer object from MongoDB
        bufferData = Buffer.from(imageData.data);
      } else {
        console.warn("Unknown image data format:", imageData);
        return null;
      }

      const base64 = bufferData.toString("base64");
      return `data:${imageData.contentType};base64,${base64}`;
    } catch (error) {
      console.error("Error creating image URL:", error);
      return null;
    }
  };

  const profileImageUrl = user?.sellerProfileImage?.data
    ? getImageUrl(user.sellerProfileImage)
    : null;

  // Get user display name based on your schema
  const getUserDisplayName = () => {
    if (!user) return "";
    return `${user.sellerFirstName || ""} ${user.sellerLastName || ""}`.trim();
  };

  // Get user contact info
  const getUserContactInfo = () => {
    if (!user) return "";
    return user.sellerEmail || user.sellerPhone || "";
  };

  // Get user role based on your schema
  const getUserRole = () => {
    if (!user) return "کاربر";

    if (user.storeType === "multi-vendor") {
      return "مدیر سیستم";
    } else if (user.storeType === "single-vendor") {
      return "مالک فروشگاه";
    }

    return user.sellerStatus === "approved" ? "کاربر تایید شده" : "کاربر";
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur effect */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 lg:hidden transform transition-transform duration-300 ease-out border-l border-gray-200">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">منو</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info */}
          <div className="flex items-center gap-x-4 space-x-4 space-x-reverse">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error("Profile image load error");
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="absolute bottom-2  w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">
                {getUserDisplayName()}
              </p>
              <p className="text-gray-600 text-xs truncate mt-1">
                {getUserContactInfo()}
              </p>
              {user.storeName && (
                <p className="text-blue-600 text-xs truncate mt-1">
                  {user.storeName}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">{getUserRole()}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`gap-x-3 w-full flex items-center space-x-3 space-x-reverse p-4 rounded-xl text-right transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 border border-blue-200 shadow-sm"
                    : "hover:bg-gray-200 hover:border-gray-200 border border-transparent"
                }`}
              >
                <div
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isActive ? "bg-blue-500 shadow-sm" : "bg-gray-100"
                  }`}
                >
                  <IconComponent
                    className={`w-5 h-5 ${
                      isActive ? "text-white" : item.color
                    }`}
                  />
                </div>

                <span
                  className={`flex-1 font-medium ${
                    isActive ? "text-blue-700" : "text-gray-700"
                  }`}
                >
                  {item.label}
                </span>

                {isActive && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 space-y-2 bg-gray-50">
          <button
            onClick={() => {
              router.push("/");
              onClose();
            }}
            className="w-full flex items-center space-x-3 space-x-reverse p-3 text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl transition-colors gap-x-3"
          >
            <div className="p-2 rounded-lg bg-gray-200">
              <HomeIcon className="w-5 h-5" />
            </div>
            <span className="flex-1 text-right font-medium">صفحه اصلی</span>
          </button>

          <button
            onClick={() => {
              router.push("/dashboard/settings");
              onClose();
            }}
            className="gap-x-3 w-full flex items-center space-x-3 space-x-reverse p-3 text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl transition-colors"
          >
            <div className="p-2 rounded-lg bg-gray-200">
              <Settings className="w-5 h-5" />
            </div>
            <span className="flex-1 text-right font-medium">تنظیمات</span>
          </button>
          <button
            onClick={handleLogout}
            className="gap-x-3 w-full flex items-center space-x-3 space-x-reverse p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
          >
            <div className="p-2 rounded-lg bg-red-100">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="flex-1 text-right font-medium">خروج از سیستم</span>
          </button>
        </div>
      </div>
    </>
  );
}
