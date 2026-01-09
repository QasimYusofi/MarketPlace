// api/product-details/[id]/page.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ShoppingCart,
  Heart,
  Star,
  Check,
  ShoppingBag,
  Loader2,
  Shield,
  Truck,
  RotateCcw,
  Clock,
  Share2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
  User,
  Store,
  AlertCircle,
  Home,
  MessageCircle,
  ThumbsUp,
  BookOpen,
  Users as UsersIcon,
  Plus,
  Minus,
  TrendingDown,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

// Color mapping for Persian color names
const colorMap = {
  قرمز: "#FF0000",
  آبی: "#0000FF",
  سبز: "#008000",
  مشکی: "#000000",
  سفید: "#FFFFFF",
  زرد: "#FFFF00",
  نارنجی: "#FFA500",
  بنفش: "#800080",
  صورتی: "#FFC0CB",
  قهوه‌ای: "#A52A2A",
  خاکستری: "#808080",
  نقره‌ای: "#C0C0C0",
  طلایی: "#FFD700",
  فیروزه‌ای: "#40E0D0",
  لاجوردی: "#191970",
  زیتونی: "#808000",
  بژ: "#F5F5DC",
  عنابی: "#800000",
  "آبی آسمانی": "#87CEEB",
  "سبز روشن": "#90EE90",
};

const ProductDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const productId = params.id; // Only one parameter: product ID

  // States
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageZoom, setImageZoom] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [ownerStore, setOwnerStore] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [isLiked, setIsLiked] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [user, setUser] = useState(null);

  // Get auth token
  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  };

  // Get user data from API using token
  const fetchUserData = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/me/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
        // Token might be expired, clear it
        localStorage.removeItem("accessToken");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser(null);
    }
  };

  // Format currency
  const formatCurrency = (price) => {
    if (!price && price !== 0) return "قیمت نامعلوم";
    return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
  };

  // Calculate discount percentage
  const calculateDiscount = (price, comparePrice) => {
    if (!comparePrice || comparePrice <= price) return 0;
    return Math.round((1 - price / comparePrice) * 100);
  };

  // Get product image URL
  const getProductImageUrl = (product) => {
    if (!product) return null;

    // Handle images array
    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      const image = product.images[0];
      if (typeof image === "string") return image;
      if (image.url) return image.url;
      if (image.image) return image.image;
    }

    // Handle single image
    if (product.image) {
      if (typeof product.image === "string") return product.image;
      if (product.image.url) return product.image.url;
    }

    return null;
  };

  // Get full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) {
      return `http://127.0.0.1:8000${imagePath}`;
    }
    return imagePath;
  };

  // Get HEX color for color name
  const getColorHex = (colorName) => {
    if (!colorName) return "#CCCCCC";
    if (colorName.startsWith("#")) return colorName;

    const normalizedColor = colorName.trim().toLowerCase();
    for (const [key, value] of Object.entries(colorMap)) {
      if (key.toLowerCase() === normalizedColor) {
        return value;
      }
    }

    // Generate consistent color from string
    let hash = 0;
    for (let i = 0; i < colorName.length; i++) {
      hash = colorName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"];
    return colors[Math.abs(hash) % colors.length];
  };

  // Fetch product details
  const fetchProductDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        `Fetching product from: ${API_BASE_URL}/products/${productId}/`
      );
      const response = await fetch(`${API_BASE_URL}/products/${productId}/`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("محصول یافت نشد");
        }
        throw new Error(`خطا در دریافت محصول: ${response.status}`);
      }

      const productData = await response.json();
      console.log("Product data received:", productData);
      setProduct(productData);

      // Set default selections
      if (productData.colors && productData.colors.length > 0) {
        setSelectedColor(productData.colors[0]);
      }
      if (productData.sizes && productData.sizes.length > 0) {
        setSelectedSize(productData.sizes[0]);
      }

      // Extract store owner ID and fetch store details
      const storeOwnerId =
        productData.store_owner?.id ||
        productData.store_owner_id ||
        productData.owner_store_id;
      console.log("Store Owner ID:", storeOwnerId);

      if (storeOwnerId) {
        fetchStoreOwnerDetails(storeOwnerId);
        fetchRelatedProducts(storeOwnerId);
      }

      // Fetch comments
      fetchComments();

      // Increment view count
      incrementViewCount();

      // Check if product is in wishlist
      const token = getAuthToken();
      if (token) {
        checkWishlistStatus(token);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Check wishlist status
  const checkWishlistStatus = async (token) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/wishlists/me/check/${productId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Wishlist check response:", data);
        setIsLiked(data.is_in_wishlist || false);
      }
    } catch (error) {
      console.error("Error checking wishlist:", error);
    }
  };

  // Fetch store owner details
  const fetchStoreOwnerDetails = async (storeOwnerId) => {
    try {
      console.log(
        `Fetching store owner: ${API_BASE_URL}/store-owners/${storeOwnerId}/`
      );
      const response = await fetch(
        `${API_BASE_URL}/store-owners/${storeOwnerId}/`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken() || ""}`,
          },
        }
      );

      if (response.ok) {
        const storeData = await response.json();
        console.log("Store data received:", storeData);
        setOwnerStore(storeData);
      } else {
        console.log("Trying alternative endpoint...");
        // Try /api/store-owners/me/ endpoint (might need authentication)
        try {
          const altResponse = await fetch(`${API_BASE_URL}/store-owners/me/`, {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          });
          if (altResponse.ok) {
            const storeData = await altResponse.json();
            console.log("Store data from /me endpoint:", storeData);
            setOwnerStore(storeData);
          }
        } catch (altError) {
          console.error("Error fetching store owner from /me:", altError);
        }
      }
    } catch (error) {
      console.error("Error fetching store owner:", error);
    }
  };

  // Fetch related products
  const fetchRelatedProducts = async (storeOwnerId) => {
    try {
      console.log(`Fetching related products for store: ${storeOwnerId}`);
      const response = await fetch(
        `${API_BASE_URL}/products/store/${storeOwnerId}/`
      );

      if (response.ok) {
        const products = await response.json();
        console.log("Related products received:", products);

        // Handle different response formats
        let productsArray = [];
        if (Array.isArray(products)) {
          productsArray = products;
        } else if (products.results && Array.isArray(products.results)) {
          productsArray = products.results;
        } else if (products.products && Array.isArray(products.products)) {
          productsArray = products.products;
        }

        // Filter out current product and limit to 4
        const related = productsArray
          .filter((p) => {
            const pid = p.id || p._id;
            return pid !== productId;
          })
          .slice(0, 4);

        setRelatedProducts(related);
        console.log("Filtered related products:", related);
      } else {
        console.log("No related products found or error:", response.status);
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  // Fetch comments - FIXED API ENDPOINT
  const fetchComments = async () => {
    try {
      console.log(`Fetching comments for product: ${productId}`);
      // Try both endpoints
      let response = await fetch(
        `${API_BASE_URL}/comments/?product=${productId}`
      );

      if (!response.ok) {
        // Try alternative endpoint
        response = await fetch(
          `${API_BASE_URL}/comments/product/${productId}/`
        );
      }

      if (response.ok) {
        const commentsData = await response.json();
        console.log("Comments received:", commentsData);

        // Handle different response formats
        let commentsArray = [];
        if (Array.isArray(commentsData)) {
          commentsArray = commentsData;
        } else if (
          commentsData.results &&
          Array.isArray(commentsData.results)
        ) {
          commentsArray = commentsData.results;
        } else if (
          commentsData.comments &&
          Array.isArray(commentsData.comments)
        ) {
          commentsArray = commentsData.comments;
        }

        setComments(commentsArray);
        console.log("Processed comments:", commentsArray);
      } else {
        console.log("No comments found or error:", response.status);
        setComments([]);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      setComments([]);
    }
  };

  // Increment view count
  const incrementViewCount = async () => {
    try {
      await fetch(`${API_BASE_URL}/products/${productId}/view/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error incrementing view count:", error);
    }
  };

  // Handle add to cart with toast notification
  const handleAddToCart = async () => {
    if (!product) {
      toast.error("محصول بارگذاری نشده است");
      return;
    }

    // Check authentication
    const token = getAuthToken();
    if (!token) {
      setShowLoginModal(true);
      toast.error("لطفا ابتدا وارد حساب کاربری خود شوید", {
        duration: 4000,
        position: "bottom-left",
      });
      return;
    }

    // Validate selections
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error("لطفا رنگ محصول را انتخاب کنید", {
        duration: 3000,
        position: "bottom-left",
      });
      return;
    }

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error("لطفا سایز محصول را انتخاب کنید", {
        duration: 3000,
        position: "bottom-left",
      });
      return;
    }

    if (product.stock < quantity) {
      toast.error(
        `تعداد درخواستی بیشتر از موجودی است (موجودی: ${product.stock})`,
        {
          duration: 4000,
          position: "bottom-left",
        }
      );
      return;
    }

    setAddingToCart(true);

    try {
      const cartItem = {
        product_id: product.id || product._id,
        quantity: quantity,
        price_snapshot: product.price,
        owner_store_id:
          product.store_owner?.id ||
          product.store_owner_id ||
          product.owner_store_id,
      };

      // Add color and size if available
      if (selectedColor) cartItem.color = selectedColor;
      if (selectedSize) cartItem.size = selectedSize;

      console.log("Adding to cart:", cartItem);

      const response = await fetch(`${API_BASE_URL}/carts/me/add-item/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cartItem),
      });

      const data = await response.json();
      console.log("Add to cart response:", data);

      if (response.ok) {
        toast.success(
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            <span>محصول به سبد خرید اضافه شد</span>
          </div>,
          {
            duration: 10000, // 10 seconds
            position: "bottom-left",
            style: {
              background: "#10B981",
              color: "white",
              padding: "16px",
              borderRadius: "12px",
              boxShadow:
                "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            },
            icon: <ShoppingCart className="w-5 h-5" />,
          }
        );
        // Update cart count
        window.dispatchEvent(new CustomEvent("cartUpdated"));
      } else {
        console.error("Add to cart failed:", data);
        toast.error(
          data.detail || data.message || "خطا در افزودن به سبد خرید",
          {
            duration: 4000,
            position: "bottom-left",
          }
        );
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("خطا در ارتباط با سرور", {
        duration: 4000,
        position: "bottom-left",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle add to wishlist with toast notification
  const handleAddToWishlist = async () => {
    // Check authentication
    const token = getAuthToken();
    if (!token) {
      setShowLoginModal(true);
      toast.error("لطفا ابتدا وارد حساب کاربری خود شوید", {
        duration: 4000,
        position: "bottom-left",
      });
      return;
    }

    setAddingToWishlist(true);

    try {
      const endpoint = isLiked
        ? `${API_BASE_URL}/wishlists/me/remove/${product.id || product._id}/`
        : `${API_BASE_URL}/wishlists/me/add/`;

      const method = isLiked ? "DELETE" : "POST";
      const body = isLiked
        ? null
        : JSON.stringify({
            product_id: product.id || product._id,
          });

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: body,
      });

      const data = await response.json();
      console.log("Wishlist response:", data);

      if (response.ok) {
        setIsLiked(!isLiked);
        setWishlistCount((prev) =>
          isLiked ? Math.max(0, prev - 1) : prev + 1
        );

        toast.success(
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            <span>
              {isLiked
                ? "از علاقه‌مندی‌ها حذف شد"
                : "به علاقه‌مندی‌ها اضافه شد"}
            </span>
          </div>,
          {
            duration: 10000, // 10 seconds
            position: "bottom-left",
            style: {
              background: isLiked ? "#EF4444" : "#EC4899",
              color: "white",
              padding: "16px",
              borderRadius: "12px",
              boxShadow:
                "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            },
            icon: (
              <Heart className={`w-5 h-5 ${isLiked ? "" : "fill-white"}`} />
            ),
          }
        );
      } else {
        console.error("Wishlist operation failed:", data);
        toast.error(data.detail || data.message || "خطا در عملیات", {
          duration: 4000,
          position: "bottom-left",
        });
      }
    } catch (error) {
      console.error("Error in wishlist operation:", error);
      toast.error("خطا در ارتباط با سرور", {
        duration: 4000,
        position: "bottom-left",
      });
    } finally {
      setAddingToWishlist(false);
    }
  };

  // Handle add comment - FIXED API
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error("لطفا متن نظر خود را وارد کنید", {
        duration: 3000,
        position: "bottom-left",
      });
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setShowLoginModal(true);
      toast.error("لطفا ابتدا وارد حساب کاربری خود شوید", {
        duration: 4000,
        position: "bottom-left",
      });
      return;
    }

    setAddingComment(true);

    try {
      const commentData = {
        product: product.id || product._id,
        content: newComment,
      };

      // Only add rating if provided
      if (rating > 0) {
        commentData.rating = rating;
      }

      console.log("Adding comment:", commentData);

      const response = await fetch(`${API_BASE_URL}/comments/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentData),
      });

      const data = await response.json();
      console.log("Add comment response:", data);

      if (response.ok) {
        toast.success(
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            <span>نظر شما با موفقیت ثبت شد</span>
          </div>,
          {
            duration: 4000,
            position: "bottom-left",
            style: {
              background: "#10B981",
              color: "white",
              padding: "12px 16px",
              borderRadius: "12px",
            },
          }
        );
        setNewComment("");
        setRating(0);
        fetchComments();
      } else {
        console.error("Add comment failed:", data);
        const errorMsg =
          data.detail ||
          data.message ||
          (data.content && data.content[0]) ||
          "خطا در ثبت نظر";
        toast.error(errorMsg, {
          duration: 4000,
          position: "bottom-left",
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("خطا در ارتباط با سرور", {
        duration: 4000,
        position: "bottom-left",
      });
    } finally {
      setAddingComment(false);
    }
  };

  // Handle rate product
  const handleRateProduct = async (selectedRating) => {
    const token = getAuthToken();
    if (!token) {
      setShowLoginModal(true);
      toast.error("لطفا ابتدا وارد حساب کاربری خود شوید", {
        duration: 4000,
        position: "bottom-left",
      });
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/rate/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rating: selectedRating }),
        }
      );

      const data = await response.json();
      console.log("Rate product response:", data);

      if (response.ok) {
        setRating(selectedRating);
        toast.success(`امتیاز ${selectedRating} ثبت شد ✓`, {
          duration: 3000,
          position: "bottom-left",
        });
        fetchProductDetails(); // Refresh product data
      } else {
        console.error("Rate product failed:", data);
        toast.error(data.detail || data.message || "خطا در ثبت امتیاز", {
          duration: 4000,
          position: "bottom-left",
        });
      }
    } catch (error) {
      console.error("Error rating product:", error);
      toast.error("خطا در ارتباط با سرور", {
        duration: 4000,
        position: "bottom-left",
      });
    }
  };

  // Handle share product
  const handleShareProduct = () => {
    const productUrl = window.location.href;

    if (navigator.share) {
      navigator
        .share({
          title: product?.title || "محصول",
          text: product?.description?.substring(0, 100) || "محصول جالب",
          url: productUrl,
        })
        .catch(console.error);
    } else {
      navigator.clipboard
        .writeText(productUrl)
        .then(() =>
          toast.success("لینک محصول کپی شد ✓", {
            duration: 3000,
            position: "bottom-left",
          })
        )
        .catch(() =>
          toast.error("خطا در کپی کردن لینک", {
            duration: 3000,
            position: "bottom-left",
          })
        );
    }
  };

  // Handle login confirm
  const handleLoginConfirm = () => {
    setShowLoginModal(false);
    router.push("/auth/user-login");
  };

  // Initialize
  useEffect(() => {
    if (productId) {
      fetchProductDetails();
      fetchUserData();
    }
  }, [productId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            در حال دریافت اطلاعات محصول...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
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

        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md mx-auto">
            <AlertCircle className="h-20 w-20 text-red-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {error || "محصول یافت نشد"}
            </h3>
            <p className="text-gray-600 mb-6">
              متاسفانه نتوانستیم اطلاعات این محصول را پیدا کنیم.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push("/")}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium flex items-center justify-center gap-2"
              >
                <Home className="h-4 w-4" />
                صفحه اصلی
              </button>
              <button
                onClick={fetchProductDetails}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                تلاش مجدد
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Get product images
  const productImages = product.images || [];
  const mainImageUrl =
    productImages.length > selectedImageIndex
      ? getFullImageUrl(
          getProductImageUrl({ images: [productImages[selectedImageIndex]] })
        )
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      ورود به حساب کاربری
                    </h3>
                    <p className="text-gray-600 text-sm">
                      برای ادامه نیاز به ورود دارید
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">!</span>
                  </div>
                  <div>
                    <p className="text-blue-800 font-medium text-sm mb-1">
                      برای انجام این عمل نیاز به ورود دارید
                    </p>
                    <p className="text-blue-600 text-xs">
                      لطفا وارد حساب کاربری خود شوید
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  لغو
                </button>
                <button
                  onClick={handleLoginConfirm}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>ورود به حساب</span>
                </button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-gray-500 text-xs">
                  حساب کاربری ندارید؟{" "}
                  <button
                    onClick={() => {
                      setShowLoginModal(false);
                      router.push("/auth/user-register");
                    }}
                    className="text-blue-500 hover:text-blue-600 font-medium"
                  >
                    ثبت نام کنید
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center text-sm text-gray-600">
            <li>
              <button
                onClick={() => router.push("/")}
                className="hover:text-blue-600 transition-colors"
              >
                خانه
              </button>
            </li>
            <li className="mx-2">
              <ChevronLeft className="w-4 h-4 rotate-180" />
            </li>
            {ownerStore && (
              <>
                <li>
                  <button
                    onClick={() =>
                      router.push(`/stores/${ownerStore.id || ownerStore._id}`)
                    }
                    className="hover:text-blue-600 transition-colors"
                  >
                    {ownerStore.store_name || "فروشگاه"}
                  </button>
                </li>
                <li className="mx-2">
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                </li>
              </>
            )}
            <li className="text-gray-900 font-medium">{product.title}</li>
          </ol>
        </nav>

        {/* Main Product Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Product Header with Quick Actions */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">
                    {product.category || "دسته‌بندی"}
                  </span>
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-lg">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-xs font-medium">
                      {product.rating?.average?.toFixed(1) || "۴.۸"}
                    </span>
                  </div>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {product.title}
                </h1>
                <p className="text-gray-600 text-sm">
                  {product.description?.substring(0, 150)}...
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareProduct}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  title="اشتراک گذاری"
                >
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={handleAddToWishlist}
                  disabled={addingToWishlist}
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    isLiked
                      ? "text-red-500 bg-red-50"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  title={
                    isLiked ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"
                  }
                >
                  {addingToWishlist ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Heart
                      className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`}
                    />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Product Images */}
            <div className="space-y-6">
              {/* Main Image */}
              <div className="relative bg-gray-100 rounded-2xl overflow-hidden aspect-square">
                {mainImageUrl ? (
                  <>
                    <img
                      src={mainImageUrl}
                      alt={product.title}
                      className={`w-full h-full object-cover transition-all duration-500 ${
                        imageZoom ? "scale-150" : "hover:scale-105"
                      }`}
                      onClick={() => setImageZoom(!imageZoom)}
                    />

                    {productImages.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex((prev) =>
                              prev === 0 ? productImages.length - 1 : prev - 1
                            );
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex((prev) =>
                              prev === productImages.length - 1 ? 0 : prev + 1
                            );
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        >
                          <ChevronRight className="w-5 h-5 text-gray-700" />
                        </button>
                      </>
                    )}

                    {/* Zoom Indicator */}
                    <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded-lg text-xs opacity-0 hover:opacity-100 transition-opacity">
                      <ZoomIn className="w-3 h-3 inline ml-1" />
                      کلیک برای زوم
                    </div>

                    {/* Discount Badge */}
                    {product.compare_price > product.price && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-lg font-bold text-sm shadow-lg">
                        {calculateDiscount(
                          product.price,
                          product.compare_price
                        )}
                        % تخفیف
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {productImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {productImages.map((image, index) => {
                    const thumbUrl = getFullImageUrl(
                      getProductImageUrl({ images: [image] })
                    );
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === index
                            ? "border-blue-500 ring-2 ring-blue-200 scale-105"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {thumbUrl ? (
                          <img
                            src={thumbUrl}
                            alt={`${product.title} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-2xl font-bold text-gray-900">
                    {product.views || 0}
                  </span>
                  <p className="text-blue-600 text-xs mt-1">بازدید</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-xl border border-green-100">
                  <span className="text-2xl font-bold text-gray-900">
                    {product.sold || 0}
                  </span>
                  <p className="text-green-600 text-xs mt-1">فروخته شده</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <span className="text-2xl font-bold text-gray-900">
                    {wishlistCount}
                  </span>
                  <p className="text-purple-600 text-xs mt-1">علاقه‌مندی</p>
                </div>
              </div>
            </div>

            {/* Product Info & Actions */}
            <div className="space-y-6">
              {/* Price Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-3xl font-bold text-gray-900">
                        {formatCurrency(product.price)}
                      </span>
                      {product.compare_price > product.price && (
                        <span className="text-lg text-gray-500 line-through">
                          {formatCurrency(product.compare_price)}
                        </span>
                      )}
                    </div>
                    {product.compare_price > product.price && (
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        <TrendingDown className="w-4 h-4" />
                        صرفه‌جویی{" "}
                        {formatCurrency(product.compare_price - product.price)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-current" />
                    <span className="text-amber-700 font-bold">
                      {product.rating?.average?.toFixed(1) || "۴.۸"}
                    </span>
                    <span className="text-gray-600 text-sm">
                      ({product.rating?.count || 0} نظر)
                    </span>
                  </div>
                </div>

                {/* Stock Status */}
                <div
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${
                    product.stock > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      product.stock > 0 ? "bg-green-500" : "bg-red-500"
                    } animate-pulse`}
                  ></div>
                  <span className="text-sm font-medium">
                    {product.stock > 0
                      ? `موجود در انبار (${product.stock} عدد)`
                      : "ناموجود"}
                  </span>
                </div>
              </div>

              {/* Options Selection */}
              <div className="space-y-4">
                {/* Colors - Display as colored circles */}
                {product.colors?.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رنگ:{" "}
                      <span className="text-blue-600 font-bold">
                        {selectedColor}
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {product.colors.map((color, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedColor(color)}
                          className="flex flex-col items-center gap-2"
                          title={color}
                        >
                          <div
                            className={`w-10 h-10 rounded-full border-2 transition-all duration-300 shadow-lg ${
                              selectedColor === color
                                ? "border-blue-500 ring-3 ring-blue-200 scale-110"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            style={{ backgroundColor: getColorHex(color) }}
                          >
                            {selectedColor === color && (
                              <div className="w-full h-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white drop-shadow-lg" />
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-700 font-medium max-w-14 truncate">
                            {color}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {product.sizes?.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      سایز:{" "}
                      <span className="text-blue-600 font-bold">
                        {selectedSize}
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 font-medium ${
                            selectedSize === size
                              ? "border-blue-500 bg-blue-500 text-white shadow-lg"
                              : "border-gray-300 text-gray-700 hover:border-gray-400 bg-white"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تعداد
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-6 py-3 border-x border-gray-300 min-w-12 text-center font-bold">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          setQuantity(
                            Math.min(product.stock || 10, quantity + 1)
                          )
                        }
                        className="px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled={quantity >= (product.stock || 10)}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-600">
                      حداکثر:{" "}
                      <span className="font-bold">{product.stock || 10}</span>{" "}
                      عدد
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addingToCart}
                  className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                    product.stock > 0
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {addingToCart ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      در حال افزودن...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      {product.stock > 0 ? "افزودن به سبد خرید" : "ناموجود"}
                    </>
                  )}
                </button>

                {ownerStore && (
                  <button
                    onClick={() =>
                      router.push(`/stores/${ownerStore.id || ownerStore._id}`)
                    }
                    className="px-6 py-4 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Store className="w-5 h-5 text-gray-700" />
                    <span className="font-medium">فروشگاه</span>
                  </button>
                )}
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                {[
                  { icon: Truck, label: "ارسال رایگان", color: "green" },
                  { icon: Shield, label: "ضمانت اصل", color: "blue" },
                  { icon: RotateCcw, label: "بازگشت ۷ روزه", color: "purple" },
                  { icon: Clock, label: "پشتیبانی ۲۴h", color: "amber" },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 p-3 ${
                      feature.color === "green"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : feature.color === "blue"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : feature.color === "purple"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    } rounded-xl border`}
                  >
                    <feature.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="border-t border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex overflow-x-auto">
                {[
                  { id: "description", label: "توضیحات محصول", icon: BookOpen },
                  { id: "specs", label: "مشخصات فنی", icon: AlertCircle },
                  {
                    id: "comments",
                    label: "نظرات",
                    icon: MessageCircle,
                    count: comments.length,
                  },
                  { id: "questions", label: "پرسش و پاسخ", icon: UsersIcon },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600 bg-blue-50"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    {tab.count !== undefined && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          activeTab === tab.id
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "description" && (
                <div className="space-y-6">
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {product.description}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "specs" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900">
                        مشخصات عمومی
                      </h3>
                      <div className="space-y-3">
                        {[
                          { label: "کد محصول", value: product.sku || "نامشخص" },
                          {
                            label: "دسته‌بندی",
                            value: product.category || "نامشخص",
                          },
                          {
                            label: "وضعیت",
                            value: product.stock > 0 ? "موجود" : "ناموجود",
                          },
                          {
                            label: "تاریخ افزودن",
                            value: new Date(
                              product.created_at || Date.now()
                            ).toLocaleDateString("fa-IR"),
                          },
                        ].map((spec, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center py-3 border-b border-gray-100"
                          >
                            <span className="text-gray-600">{spec.label}:</span>
                            <span className="font-medium text-gray-900">
                              {spec.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900">
                        مشخصات فنی
                      </h3>
                      <div className="space-y-3">
                        {[
                          {
                            label: "رنگ‌بندی",
                            value: product.colors?.join("، ") || "متنوع",
                          },
                          {
                            label: "سایزبندی",
                            value: product.sizes?.join("، ") || "متنوع",
                          },
                          {
                            label: "برچسب‌ها",
                            value: product.tags?.join("، ") || "ندارد",
                          },
                        ].map((spec, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center py-3 border-b border-gray-100"
                          >
                            <span className="text-gray-600">{spec.label}:</span>
                            <span className="font-medium text-gray-900">
                              {spec.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "comments" && (
                <div className="space-y-8">
                  {/* Add Comment */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      ثبت نظر جدید
                    </h3>
                    <div className="space-y-4">
                      {/* Rating Stars */}
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          امتیاز دهید:
                        </p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleRateProduct(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  (hoverRating || rating) >= star
                                    ? "text-amber-500 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="نظر خود را درباره این محصول بنویسید..."
                        className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        disabled={addingComment}
                      />

                      <div className="flex justify-end">
                        <button
                          onClick={handleAddComment}
                          disabled={addingComment || !newComment.trim()}
                          className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {addingComment ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              در حال ثبت...
                            </>
                          ) : (
                            <>
                              <MessageCircle className="w-4 h-4" />
                              ثبت نظر
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900">
                      نظرات کاربران ({comments.length})
                    </h3>

                    {comments.length > 0 ? (
                      <div className="space-y-6">
                        {comments.map((comment) => (
                          <div
                            key={comment.id || comment._id}
                            className="bg-white border border-gray-200 rounded-2xl p-6"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                  {comment.user?.first_name?.[0] ||
                                    comment.author?.first_name?.[0] ||
                                    "ن"}
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900">
                                    {comment.user?.first_name ||
                                      comment.author?.first_name ||
                                      "کاربر"}{" "}
                                    {comment.user?.last_name ||
                                      comment.author?.last_name ||
                                      ""}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    {comment.rating && (
                                      <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-amber-500 fill-current" />
                                        <span className="text-xs text-gray-600">
                                          {comment.rating}
                                        </span>
                                      </div>
                                    )}
                                    <span className="text-xs text-gray-500">
                                      {new Date(
                                        comment.created_at ||
                                          comment.date ||
                                          Date.now()
                                      ).toLocaleDateString("fa-IR")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <button className="p-2 hover:bg-gray-100 rounded-lg">
                                <ThumbsUp className="w-5 h-5 text-gray-600" />
                              </button>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                              {comment.content || comment.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-2xl">
                        <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          هنوز نظری ثبت نشده است
                        </h4>
                        <p className="text-gray-600">
                          اولین نفری باشید که برای این محصول نظر می‌دهد.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "questions" && (
                <div className="text-center py-12">
                  <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    پرسش و پاسخ
                  </h4>
                  <p className="text-gray-600 max-w-md mx-auto">
                    سوالی دارید؟ اولین نفر باشید که سوال خود را می‌پرسید.
                  </p>
                  <button
                    className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 mx-auto"
                    onClick={() => {
                      const token = getAuthToken();
                      if (!token) {
                        setShowLoginModal(true);
                        toast.error("لطفا ابتدا وارد حساب کاربری خود شوید");
                      } else {
                        // Implement question asking functionality
                        toast.success("این قابلیت به زودی اضافه خواهد شد");
                      }
                    }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    پرسش سوال جدید
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                محصولات مشابه از این فروشگاه
              </h2>
              {ownerStore && (
                <button
                  onClick={() =>
                    router.push(`/stores/${ownerStore.id || ownerStore._id}`)
                  }
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  مشاهده همه
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct) => {
                const relatedImageUrl = getFullImageUrl(
                  getProductImageUrl(relatedProduct)
                );
                const relatedProductId =
                  relatedProduct.id || relatedProduct._id;
                const storeOwnerId =
                  relatedProduct.store_owner?.id ||
                  relatedProduct.store_owner_id ||
                  relatedProduct.owner_store_id;

                return (
                  <div
                    key={relatedProductId}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                    onClick={() =>
                      router.push(`/product-details/${relatedProductId}`)
                    }
                  >
                    <div className="aspect-square relative overflow-hidden">
                      {relatedImageUrl ? (
                        <img
                          src={relatedImageUrl}
                          alt={relatedProduct.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <ShoppingBag className="w-12 h-12 text-gray-400" />
                        </div>
                      )}

                      {relatedProduct.compare_price > relatedProduct.price && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                          {calculateDiscount(
                            relatedProduct.price,
                            relatedProduct.compare_price
                          )}
                          %
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                        {relatedProduct.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-blue-600 font-bold text-lg">
                            {formatCurrency(relatedProduct.price)}
                          </span>
                          {relatedProduct.compare_price >
                            relatedProduct.price && (
                            <span className="text-gray-500 text-sm line-through">
                              {formatCurrency(relatedProduct.compare_price)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-current" />
                          <span className="text-xs text-gray-600">
                            {relatedProduct.rating?.average?.toFixed(1) ||
                              "۴.۸"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
