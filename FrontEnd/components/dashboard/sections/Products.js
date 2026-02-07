"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import {
  Plus,
  Store,
  Upload,
  X,
  Search,
  Filter,
  Grid,
  List,
  Trash2,
  Eye,
  Package,
  Tag,
  DollarSign,
  BarChart3,
  Image as ImageIcon,
  Calendar,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Sparkles,
  Edit3,
  Archive,
  TrendingUp,
  Layers,
  Zap,
  ShoppingBag,
  ArrowUpDown,
  BadgePercent,
  Copy,
  Shirt,
  Users,
  Baby,
  ArrowRight,
  Palette,
  Ruler,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

const BASE_API = `${process.env.NEXT_PUBLIC_API_URL}`;

// دسته‌بندی‌های اصلی
const MAIN_CATEGORIES = [
  {
    id: "men",
    name: "مردانه",
    icon: Shirt,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "women",
    name: "زنانه",
    icon: Users,
    color: "from-pink-500 to-pink-600",
  },
  {
    id: "kids",
    name: "کودک",
    icon: Baby,
    color: "from-green-500 to-green-600",
  },
  {
    id: "baby",
    name: "نوزاد",
    icon: Baby,
    color: "from-purple-500 to-purple-600",
  },
];

// انواع سایزها
const SIZE_TYPES = [
  { id: "clothing", name: "لباس", icon: Shirt },
  { id: "shoes", name: "کفش", icon: Package },
  { id: "kids", name: "کودک", icon: Baby },
];

// سایزهای استاندارد بر اساس نوع
const SIZE_OPTIONS = {
  clothing: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
  shoes: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
  kids: ["2T", "3T", "4T", "5T", "6T", "7T", "8T"],
};

// رنگ‌های استاندارد
const COLOR_OPTIONS = [
  { name: "مشکی", value: "#000000" },
  { name: "سفید", value: "#FFFFFF" },
  { name: "خاکستری", value: "#808080" },
  { name: "قرمز", value: "#FF0000" },
  { name: "آبی", value: "#0000FF" },
  { name: "سبز", value: "#008000" },
  { name: "زرد", value: "#FFFF00" },
  { name: "نارنجی", value: "#FFA500" },
  { name: "بنفش", value: "#800080" },
  { name: "قهوه‌ای", value: "#A52A2A" },
];

// مراحل مختلف
const MODAL_STEPS = {
  CATEGORY: "category",
  ATTRIBUTES: "attributes",
  PRODUCT_INFO: "product_info",
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [currentStore, setCurrentStore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [productImages, setProductImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModalStep, setCurrentModalStep] = useState(
    MODAL_STEPS.CATEGORY
  );
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSizeType, setSelectedSizeType] = useState("");
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
  });
  const [sortBy, setSortBy] = useState("newest");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    trigger,
  } = useForm();

  const price = watch("price", 0);
  const compare_price = watch("compare_price", 0);
  const title = watch("title", "");

  // Function to format price with commas
  const formatPrice = (price) => {
    if (!price) return "0";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Function to generate SKU based on store name + year + product list length
  const generateSKU = () => {
    if (!currentStore) return "";

    const storeName = currentStore.store_name || "STORE";
    const year = new Date().getFullYear();

    const productListLength = new Date().getUTCHours();

    // Clean store name (remove spaces and special characters, take first 4 chars)
    const cleanStoreName = storeName
      .replace(/\s+/g, "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .substring(0, 4);

    // Generate SKU: STORE-YEAR-PRODUCT_COUNT
    const sku = `${cleanStoreName}-${year}-${productListLength
      .toString()
      .padStart(4, "0")}`;
    return sku;
  };

  // Auto-generate SKU when entering product info step
  useEffect(() => {
    if (currentModalStep === MODAL_STEPS.PRODUCT_INFO && currentStore) {
      const generatedSKU = generateSKU();
      setValue("sku", generatedSKU);
      trigger("sku");
    }
  }, [currentModalStep, currentStore, setValue, trigger, products.length]);

  // Function to get image URL from Django API
  const getImageUrl = (product, index = 0) => {
    if (!product.images || product.images.length === 0) {
      return "/api/placeholder/400/300";
    }

    // Handle Django image field structure
    const image = product.images[index];
    if (image.url) {
      return image.url;
    }
    if (image.image) {
      return image.image;
    }
    if (image.image_url) {
      return image.image_url;
    }

    return "/api/placeholder/400/300";
  };

  useEffect(() => {
    fetchStoreAndProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const lowStock = products.filter(
        (p) => p.stock > 0 && p.stock <= 10
      ).length;
      const outOfStock = products.filter((p) => p.stock === 0).length;
      const totalValue = products.reduce(
        (sum, product) =>
          sum + (parseFloat(product.price) || 0) * (product.stock || 0),
        0
      );

      setStats({
        totalProducts: products.length,
        lowStock,
        outOfStock,
        totalValue,
      });
    }
  }, [products]);

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  };

  const fetchStoreAndProducts = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("لطفا ابتدا وارد شوید");
        setIsLoading(false);
        return;
      }

      // Fetch store owner data
      const storeResponse = await fetch(`${BASE_API}/store-owners/me/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (storeResponse.ok) {
        const storeData = await storeResponse.json();
        console.log("📦 Store owner data:", storeData);

        setCurrentStore(storeData);

        await fetchProducts();
      } else {
        toast.error(" خطا در دریافت اطلاعات فروشگاه");
      }
    } catch (error) {
      console.error(" Error fetching store:", error);
      toast.error(" خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const token = getAuthToken();

      const response = await fetch(`${BASE_API}/products/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("📦 Products data:", result);

        // Handle different Django response formats
        let productsData = [];
        if (Array.isArray(result)) {
          productsData = result;
        } else if (result.results) {
          productsData = result.results;
        } else if (result.data) {
          productsData = result.data;
        }

        setProducts(productsData);
        toast.success(`${productsData.length} محصول بارگذاری شد`);
      } else {
        toast.error(" خطا در دریافت محصولات");
      }
    } catch (error) {
      console.error(" Error fetching products:", error);
      toast.error(" خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length + productImages.length > 5) {
      toast.error("حداکثر ۵ تصویر قابل آپلود است");
      return;
    }

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));

    setProductImages((prev) => [...prev, ...newImages]);
    toast.success(` ${files.length} تصویر اضافه شد`);
  };

  const removeImage = (id) => {
    setProductImages((prev) => prev.filter((img) => img.id !== id));
    toast.success("تصویر حذف شد");
  };

  const openModal = () => {
    setIsModalOpen(true);
    setCurrentModalStep(MODAL_STEPS.CATEGORY);
    setSelectedMainCategory("");
    setSelectedSizeType("");
    setSelectedSizes([]);
    setSelectedColors([]);
    setProductImages([]);
    reset();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentModalStep(MODAL_STEPS.CATEGORY);
    setSelectedMainCategory("");
    setSelectedSizeType("");
    setSelectedSizes([]);
    setSelectedColors([]);
    setProductImages([]);
    reset();
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedMainCategory(categoryId);
    setCurrentModalStep(MODAL_STEPS.ATTRIBUTES);
  };

  const handleSizeTypeSelect = (sizeType) => {
    setSelectedSizeType(sizeType);
    setSelectedSizes([]);
  };

  const handleSizeToggle = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleColorToggle = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const goToNextStep = () => {
    if (currentModalStep === MODAL_STEPS.CATEGORY && selectedMainCategory) {
      setCurrentModalStep(MODAL_STEPS.ATTRIBUTES);
    } else if (currentModalStep === MODAL_STEPS.ATTRIBUTES) {
      setCurrentModalStep(MODAL_STEPS.PRODUCT_INFO);
    }
  };

  const goToPreviousStep = () => {
    if (currentModalStep === MODAL_STEPS.ATTRIBUTES) {
      setCurrentModalStep(MODAL_STEPS.CATEGORY);
    } else if (currentModalStep === MODAL_STEPS.PRODUCT_INFO) {
      setCurrentModalStep(MODAL_STEPS.ATTRIBUTES);
    }
  };

  // Function to manually regenerate SKU
  const regenerateSKU = () => {
    const generatedSKU = generateSKU();
    setValue("sku", generatedSKU);
    trigger("sku");
    toast.success("کد محصول مجدداً تولید شد");
  };

  // Handle price input with comma formatting
  const handlePriceChange = (fieldName, value) => {
    const numericValue = value.replace(/[^\d]/g, "");
    setValue(fieldName, numericValue);
  };

  const onSubmit = async (data) => {
    if (productImages.length === 0) {
      toast.error("حداقل یک تصویر برای محصول انتخاب کنید");
      return;
    }

    setIsCreating(true);
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("لطفا ابتدا وارد شوید");
        return;
      }

      const formData = new FormData();

      // 1. Fix price format - remove commas
      const cleanPrice = data.price.replace(/,/g, "");
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("sku", data.sku);
      formData.append("price", cleanPrice);

      if (data.compare_price) {
        const cleanComparePrice = data.compare_price.replace(/,/g, "");
        formData.append("compare_price", cleanComparePrice);
      }

      formData.append("stock", data.stock);
      formData.append("category", selectedMainCategory);

      // 2. Append sizes and colors as JSON strings
      if (selectedSizes.length > 0) {
        formData.append("sizes", JSON.stringify(selectedSizes));
      }

      if (selectedColors.length > 0) {
        formData.append("colors", JSON.stringify(selectedColors));
      }

      // 3. Append all selected images
      productImages.forEach((image) => {
        formData.append("images", image.file);
      });

      console.log("🔄 Creating product with data:", {
        title: data.title,
        sku: data.sku,
        price: cleanPrice,
        stock: data.stock,
        category: selectedMainCategory,
        sizes: selectedSizes,
        colors: selectedColors,
        imageCount: productImages.length,
      });

      const response = await fetch(`${BASE_API}/products/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData
        },
        body: formData,
      });

      console.log(response);
      if (response.ok) {
        const newProduct = await response.json();
        console.log("✅ Product created successfully:", newProduct);
        setProducts((prev) => [newProduct, ...prev]);
        closeModal();
        toast.success(" محصول با موفقیت ایجاد شد");
      } else {
        const errorData = await response.json();
        console.error("Product creation failed:", errorData);
        throw new Error(
          errorData.detail || errorData.message || "خطا در ایجاد محصول"
        );
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error(
        error.message || "ایجاد محصول ناموفق بود. لطفاً دوباره تلاش کنید."
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleProductClick = (productId) => {
    router.push(`/product/${productId}`);
  };

  const deleteProduct = async (productId, e) => {
    e.stopPropagation();
    if (!confirm("آیا از حذف این محصول اطمینان دارید؟")) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${BASE_API}/products/${productId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        toast.success("محصول با موفقیت حذف شد");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "خطا در حذف محصول");
      }
    } catch (error) {
      toast.error(error.message || " خطا در حذف محصول");
    }
  };

  const duplicateProduct = async (productId, e) => {
    e.stopPropagation();
    try {
      const token = getAuthToken();

      // First get the product to duplicate
      const getResponse = await fetch(`${BASE_API}/products/${productId}/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!getResponse.ok) {
        throw new Error("خطا در دریافت اطلاعات محصول");
      }

      const originalProduct = await getResponse.json();

      // Create a new product with similar data but new SKU
      const formData = new FormData();
      formData.append("title", `${originalProduct.title} (کپی)`);
      formData.append("description", originalProduct.description);
      formData.append("sku", generateSKU());
      formData.append("price", originalProduct.price);
      if (originalProduct.compare_price) {
        formData.append("compare_price", originalProduct.compare_price);
      }
      formData.append("stock", originalProduct.stock);
      formData.append("category", originalProduct.category);

      if (originalProduct.sizes && originalProduct.sizes.length > 0) {
        formData.append("sizes", JSON.stringify(originalProduct.sizes));
      }
      if (originalProduct.colors && originalProduct.colors.length > 0) {
        formData.append("colors", JSON.stringify(originalProduct.colors));
      }

      const response = await fetch(`${BASE_API}/products/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const duplicatedProduct = await response.json();
        setProducts((prev) => [duplicatedProduct, ...prev]);
        toast.success(" محصول با موفقیت کپی شد");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "خطا در کپی محصول");
      }
    } catch (error) {
      toast.error(error.message || " خطا در کپی محصول");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-high":
        return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
      case "price-low":
        return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
      case "stock-high":
        return (b.stock || 0) - (a.stock || 0);
      case "stock-low":
        return (a.stock || 0) - (b.stock || 0);
      case "newest":
      default:
        return (
          new Date(b.created_at || b.createdAt || 0) -
          new Date(a.created_at || a.createdAt || 0)
        );
    }
  });

  const allCategories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  // Render Modal Content based on current step
  const renderModalContent = () => {
    switch (currentModalStep) {
      case MODAL_STEPS.CATEGORY:
        return (
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                انتخاب دسته‌بندی محصول
              </h2>
              <p className="text-gray-600 mt-2">
                دسته‌بندی اصلی محصول خود را انتخاب کنید
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {MAIN_CATEGORIES.map((category) => {
                const IconComponent = category.icon;
                return (
                  <div
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`relative p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                      selectedMainCategory === category.id
                        ? `border-blue-500 bg-gradient-to-br ${category.color} text-white shadow-2xl`
                        : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-xl"
                    }`}
                  >
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div
                        className={`p-4 rounded-2xl ${
                          selectedMainCategory === category.id
                            ? "bg-white/20"
                            : "bg-gray-100"
                        }`}
                      >
                        <IconComponent
                          className={`h-8 w-8 ${
                            selectedMainCategory === category.id
                              ? "text-white"
                              : "text-gray-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`text-xl font-bold ${
                            selectedMainCategory === category.id
                              ? "text-white"
                              : "text-gray-900"
                          }`}
                        >
                          {category.name}
                        </h3>
                        <p
                          className={`mt-1 ${
                            selectedMainCategory === category.id
                              ? "text-white/80"
                              : "text-gray-600"
                          }`}
                        >
                          محصولات {category.name}
                        </p>
                      </div>
                      {selectedMainCategory === category.id && (
                        <div className="bg-white text-blue-600 p-2 rounded-full">
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex space-x-4 space-x-reverse pt-8 border-t border-gray-100">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 bg-gray-100 text-gray-700 px-8 py-4 rounded-2xl hover:bg-gray-200 transition-all duration-300 font-bold border-2 border-gray-200 hover:border-gray-300"
              >
                انصراف
              </button>
              <button
                onClick={goToNextStep}
                disabled={!selectedMainCategory}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-bold shadow-2xl shadow-blue-500/25 hover:shadow-3xl hover:shadow-purple-500/25 relative group"
              >
                <div className="flex items-center justify-center">
                  ادامه
                  <ArrowRight className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        );

      case MODAL_STEPS.ATTRIBUTES:
        return (
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4 space-x-reverse">
                <button
                  onClick={goToPreviousStep}
                  className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-200"
                >
                  <ArrowLeft className="h-6 w-6 text-gray-500" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    مشخصات محصول
                  </h2>
                  <p className="text-gray-600 mt-1">
                    سایز و رنگ محصول را انتخاب کنید
                  </p>
                </div>
              </div>
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl text-sm font-medium">
                {
                  MAIN_CATEGORIES.find((c) => c.id === selectedMainCategory)
                    ?.name
                }
              </div>
            </div>

            {/* Size Type Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Ruler className="h-5 w-5 ml-2 text-blue-500" />
                انتخاب نوع سایز
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {SIZE_TYPES.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <div
                      key={type.id}
                      onClick={() => handleSizeTypeSelect(type.id)}
                      className={`relative p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                        selectedSizeType === type.id
                          ? "border-blue-500 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-2xl"
                          : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-xl"
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={`p-4 rounded-2xl mb-3 ${
                            selectedSizeType === type.id
                              ? "bg-white/20"
                              : "bg-gray-100"
                          }`}
                        >
                          <IconComponent
                            className={`h-8 w-8 ${
                              selectedSizeType === type.id
                                ? "text-white"
                                : "text-gray-600"
                            }`}
                          />
                        </div>
                        <h3
                          className={`text-lg font-bold ${
                            selectedSizeType === type.id
                              ? "text-white"
                              : "text-gray-900"
                          }`}
                        >
                          {type.name}
                        </h3>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Size Selection based on type */}
              {selectedSizeType && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-6 border border-blue-200">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Ruler className="h-5 w-5 ml-2 text-blue-500" />
                    انتخاب سایزهای{" "}
                    {SIZE_TYPES.find((t) => t.id === selectedSizeType)?.name}
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {SIZE_OPTIONS[selectedSizeType]?.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSizeToggle(size)}
                        className={`px-6 py-3 rounded-2xl border-2 font-medium transition-all duration-200 ${
                          selectedSizes.includes(size)
                            ? "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/25"
                            : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {selectedSizes.length > 0 && (
                    <div className="mt-4 p-4 bg-white rounded-2xl border border-green-200">
                      <p className="text-green-600 font-medium flex items-center">
                        <CheckCircle className="h-5 w-5 ml-2" />
                        سایزهای انتخاب شده: {selectedSizes.join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Color Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Palette className="h-5 w-5 ml-2 text-blue-500" />
                انتخاب رنگ‌ها (اختیاری)
              </h3>
              <div className="flex flex-wrap gap-4">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleColorToggle(color.name)}
                    className={`flex flex-col items-center space-y-2 transition-all duration-200 ${
                      selectedColors.includes(color.name)
                        ? "transform -translate-y-1"
                        : ""
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl border-4 transition-all duration-200 ${
                        selectedColors.includes(color.name)
                          ? "border-blue-500 shadow-lg shadow-blue-500/25"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      style={{ backgroundColor: color.value }}
                    />
                    <span
                      className={`text-xs font-medium ${
                        selectedColors.includes(color.name)
                          ? "text-blue-600"
                          : "text-gray-600"
                      }`}
                    >
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-4 space-x-reverse pt-8 border-t border-gray-100">
              <button
                type="button"
                onClick={goToPreviousStep}
                className="flex-1 bg-gray-100 text-gray-700 px-8 py-4 rounded-2xl hover:bg-gray-200 transition-all duration-300 font-bold border-2 border-gray-200 hover:border-gray-300"
              >
                بازگشت
              </button>
              <button
                onClick={goToNextStep}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-bold shadow-2xl shadow-blue-500/25 hover:shadow-3xl hover:shadow-purple-500/25 relative group"
              >
                <div className="flex items-center justify-center">
                  ادامه به اطلاعات محصول
                  <ArrowRight className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        );

      case MODAL_STEPS.PRODUCT_INFO:
        return (
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
            {/* Header with Back Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 space-x-reverse">
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-200"
                >
                  <ArrowLeft className="h-6 w-6 text-gray-500" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    تکمیل اطلاعات محصول
                  </h2>
                  <p className="text-gray-600 mt-1">
                    اطلاعات محصول جدید را وارد کنید
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl text-sm font-medium">
                  {
                    MAIN_CATEGORIES.find((c) => c.id === selectedMainCategory)
                      ?.name
                  }
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentModalStep(MODAL_STEPS.CATEGORY)}
                  className="bg-white text-blue-600 px-4 py-2 rounded-2xl hover:bg-blue-50 transition-all duration-300 font-medium border border-blue-200"
                >
                  تغییر دسته‌بندی
                </button>
              </div>
            </div>

            {/* Selected Attributes Summary */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
              <div className="flex flex-wrap gap-6">
                {selectedSizeType && (
                  <div>
                    <span className="text-sm font-semibold text-gray-700">
                      نوع سایز:{" "}
                    </span>
                    <span className="text-green-600 font-medium">
                      {SIZE_TYPES.find((t) => t.id === selectedSizeType)?.name}
                    </span>
                  </div>
                )}
                {selectedSizes.length > 0 && (
                  <div>
                    <span className="text-sm font-semibold text-gray-700">
                      سایزها:{" "}
                    </span>
                    <span className="text-green-600 font-medium">
                      {selectedSizes.join(", ")}
                    </span>
                  </div>
                )}
                {selectedColors.length > 0 && (
                  <div>
                    <span className="text-sm font-semibold text-gray-700">
                      رنگ‌ها:{" "}
                    </span>
                    <span className="text-green-600 font-medium">
                      {selectedColors.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-4 flex items-center">
                <ImageIcon className="h-6 w-6 ml-3 text-blue-500" />
                تصاویر محصول
                <span className="text-sm text-gray-500 font-normal mr-2">
                  (حداکثر ۵ تصویر)
                </span>
              </label>
              <div className="flex flex-wrap gap-4 mb-4">
                {productImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.preview}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-2xl border-2 border-gray-200 group-hover:border-blue-500 transition-all duration-300 shadow-lg group-hover:shadow-xl"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all duration-200 transform hover:scale-110 shadow-lg"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {productImages.length < 5 && (
                  <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 group">
                    <Upload className="h-8 w-8 text-gray-400 group-hover:text-blue-500 mb-2 transition-colors" />
                    <span className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors">
                      آپلود تصویر
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                  <Tag className="h-5 w-5 ml-2 text-blue-500" />
                  عنوان محصول
                </label>
                <input
                  type="text"
                  {...register("title", {
                    required: "عنوان محصول الزامی است",
                  })}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50"
                  placeholder="عنوان محصول را وارد کنید"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <AlertCircle className="h-4 w-4 ml-1" />
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                  <BarChart3 className="h-5 w-5 ml-2 text-blue-500" />
                  کد محصول (SKU)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register("sku", {
                      required: "کد محصول الزامی است",
                    })}
                    className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50"
                    placeholder="کد محصول به صورت خودکار تولید می‌شود"
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={regenerateSKU}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                    title="تولید مجدد کد محصول"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center">
                  <Sparkles className="h-3 w-3 ml-1" />
                  فرمت: نام فروشگاه - سال - طول محصول
                </p>
                {errors.sku && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <AlertCircle className="h-4 w-4 ml-1" />
                    {errors.sku.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                <Edit3 className="h-5 w-5 ml-2 text-blue-500" />
                توضیحات محصول
              </label>
              <textarea
                {...register("description", {
                  required: "توضیحات محصول الزامی است",
                })}
                rows={4}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50 resize-none"
                placeholder="توضیحات کامل محصول را وارد کنید..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <AlertCircle className="h-4 w-4 ml-1" />
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                  <DollarSign className="h-5 w-5 ml-2 text-green-500" />
                  قیمت اصلی (ریال)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register("price", {
                      required: "قیمت الزامی است",
                      validate: {
                        min: (value) => {
                          const numericValue = value.replace(/[^\d]/g, "");
                          return (
                            numericValue >= 0 || "قیمت نمی‌تواند منفی باشد"
                          );
                        },
                      },
                    })}
                    onChange={(e) => handlePriceChange("price", e.target.value)}
                    value={price ? formatPrice(price) : ""}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50 text-left"
                    placeholder="0"
                    dir="ltr"
                  />
                </div>
                {errors.price && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <AlertCircle className="h-4 w-4 ml-1" />
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                  <BadgePercent className="h-5 w-5 ml-2 text-gray-500" />
                  قیمت قبل از تخفیف
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register("compare_price", {
                      validate: {
                        min: (value) => {
                          if (!value) return true;
                          const numericValue = value.replace(/[^\d]/g, "");
                          return (
                            numericValue >= 0 ||
                            "قیمت مقایسه نمی‌تواند منفی باشد"
                          );
                        },
                      },
                    })}
                    onChange={(e) =>
                      handlePriceChange("compare_price", e.target.value)
                    }
                    value={compare_price ? formatPrice(compare_price) : ""}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50 text-left"
                    placeholder="اختیاری"
                    dir="ltr"
                  />
                </div>
                {errors.compare_price && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <AlertCircle className="h-4 w-4 ml-1" />
                    {errors.compare_price.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                  <Package className="h-5 w-5 ml-2 text-orange-500" />
                  موجودی
                </label>
                <input
                  type="number"
                  {...register("stock", {
                    required: "موجودی الزامی است",
                    min: {
                      value: 0,
                      message: "موجودی نمی‌تواند منفی باشد",
                    },
                  })}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50"
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <AlertCircle className="h-4 w-4 ml-1" />
                    {errors.stock.message}
                  </p>
                )}
              </div>
            </div>

            {/* Price Comparison Display */}
            {(price > 0 || compare_price > 0) && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-gray-700">
                      قیمت نهایی:
                    </span>
                    <span
                      className="text-2xl font-bold text-green-600 mr-3"
                      dir="ltr"
                    >
                      {price ? formatPrice(price) : 0} ریال
                    </span>
                  </div>
                  {compare_price > price && (
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-700 block">
                        تخفیف:
                      </span>
                      <span className="text-green-600 font-bold text-xl">
                        {Math.round((1 - price / compare_price) * 100)}% تخفیف
                      </span>
                      <div
                        className="text-sm text-gray-500 line-through"
                        dir="ltr"
                      >
                        قیمت قبل:{" "}
                        {compare_price ? formatPrice(compare_price) : 0} ریال
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex space-x-4 space-x-reverse pt-8 border-t border-gray-100">
              <button
                type="button"
                onClick={goToPreviousStep}
                className="flex-1 bg-gray-100 text-gray-700 px-8 py-4 rounded-2xl hover:bg-gray-200 transition-all duration-300 font-bold border-2 border-gray-200 hover:border-gray-300"
              >
                بازگشت
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-bold shadow-2xl shadow-blue-500/25 hover:shadow-3xl hover:shadow-purple-500/25 relative group"
              >
                {isCreating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                    در حال ایجاد محصول...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Plus className="h-5 w-5 ml-2 group-hover:scale-110 transition-transform" />
                    ایجاد محصول
                  </div>
                )}
              </button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  if (isLoading && !currentStore) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        toastOptions={{
          style: {
            fontFamily: "var(--font-vazirmatn), sans-serif",
            direction: "rtl",
          },
        }}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="flex items-center space-x-4 space-x-reverse mb-6 lg:mb-0">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl shadow-blue-500/25">
                  <ShoppingBag className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  مدیریت محصولات
                </h1>
                <p className="mt-2 text-gray-600 flex items-center text-lg">
                  <Zap className="h-5 w-5 ml-2 text-yellow-500 animate-pulse" />
                  {currentStore?.store_name || "فروشگاه شما"}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            {currentStore && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-blue-100">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.totalProducts}
                      </p>
                      <p className="text-xs text-gray-500">کل محصولات</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-green-100">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.totalValue.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">ارزش کل</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Store Info & Add Product Button */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 mb-8 bg-gradient-to-r from-white via-blue-50/50 to-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4 space-x-reverse mb-6 lg:mb-0">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                  <Store className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {currentStore?.store_name}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {currentStore?.city && `شهر: ${currentStore.city}`}
                  </p>
                </div>
              </div>

              <button
                onClick={openModal}
                className="group relative bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-bold flex items-center justify-center shadow-2xl shadow-blue-500/25 hover:shadow-3xl hover:shadow-purple-500/25 transform hover:-translate-y-0.5"
              >
                <Plus className="h-5 w-5 ml-2 group-hover:scale-110 transition-transform" />
                افزودن محصول جدید
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {currentStore && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-2xl shadow-blue-500/25">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">
                      کل محصولات
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      {stats.totalProducts}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-blue-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-6 text-white shadow-2xl shadow-green-500/25">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">
                      ارزش موجودی
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      {stats.totalValue.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-3xl p-6 text-white shadow-2xl shadow-yellow-500/25">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">
                      کمبود موجودی
                    </p>
                    <p className="text-3xl font-bold mt-2">{stats.lowStock}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-yellow-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-6 text-white shadow-2xl shadow-red-500/25">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">ناموجود</p>
                    <p className="text-3xl font-bold mt-2">
                      {stats.outOfStock}
                    </p>
                  </div>
                  <Archive className="h-8 w-8 text-red-200" />
                </div>
              </div>
            </div>
          )}

          {/* Main Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
              <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto animate-slideUp">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-8 border-b border-gray-100">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                      {currentModalStep === MODAL_STEPS.CATEGORY && (
                        <Layers className="h-6 w-6 text-white" />
                      )}
                      {currentModalStep === MODAL_STEPS.ATTRIBUTES && (
                        <Ruler className="h-6 w-6 text-white" />
                      )}
                      {currentModalStep === MODAL_STEPS.PRODUCT_INFO && (
                        <Plus className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {currentModalStep === MODAL_STEPS.CATEGORY &&
                          "انتخاب دسته‌بندی"}
                        {currentModalStep === MODAL_STEPS.ATTRIBUTES &&
                          "مشخصات محصول"}
                        {currentModalStep === MODAL_STEPS.PRODUCT_INFO &&
                          "تکمیل اطلاعات محصول"}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {currentModalStep === MODAL_STEPS.CATEGORY &&
                          "دسته‌بندی اصلی محصول خود را انتخاب کنید"}
                        {currentModalStep === MODAL_STEPS.ATTRIBUTES &&
                          "سایز و رنگ محصول را انتخاب کنید"}
                        {currentModalStep === MODAL_STEPS.PRODUCT_INFO &&
                          "اطلاعات محصول جدید را وارد کنید"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-200 hover:scale-110"
                  >
                    <X className="h-6 w-6 text-gray-500" />
                  </button>
                </div>

                {/* Progress Steps */}
                <div className="px-8 pt-6">
                  <div className="flex items-center justify-center space-x-8 space-x-reverse">
                    {Object.values(MODAL_STEPS).map((step, index) => (
                      <div key={step} className="flex items-center">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                            currentModalStep === step
                              ? "bg-blue-500 border-blue-500 text-white"
                              : index <
                                Object.values(MODAL_STEPS).indexOf(
                                  currentModalStep
                                )
                              ? "bg-green-500 border-green-500 text-white"
                              : "bg-white border-gray-300 text-gray-500"
                          }`}
                        >
                          {index <
                          Object.values(MODAL_STEPS).indexOf(
                            currentModalStep
                          ) ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        {index < Object.values(MODAL_STEPS).length - 1 && (
                          <div
                            className={`w-16 h-1 transition-all duration-300 ${
                              index <
                              Object.values(MODAL_STEPS).indexOf(
                                currentModalStep
                              )
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modal Content */}
                {renderModalContent()}
              </div>
            </div>
          )}

          {/* Products List */}
          {currentStore && (
            <div className="space-y-8">
              {/* Products Header */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-6 lg:space-y-0">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        محصولات فروشگاه
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {sortedProducts.length} محصول یافت شد
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
                    {/* Search */}
                    <div className="relative group">
                      <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        type="text"
                        placeholder="جستجو در محصولات..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50 w-full sm:w-80 group-hover:border-blue-300"
                      />
                    </div>

                    {/* Sort */}
                    <div className="relative group">
                      <ArrowUpDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="pl-12 pr-8 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50 appearance-none w-full sm:w-48 group-hover:border-blue-300"
                      >
                        <option value="newest">جدیدترین</option>
                        <option value="price-high">قیمت (زیاد به کم)</option>
                        <option value="price-low">قیمت (کم به زیاد)</option>
                        <option value="stock-high">موجودی (زیاد به کم)</option>
                        <option value="stock-low">موجودی (کم به زیاد)</option>
                      </select>
                    </div>

                    {/* Category Filter */}
                    {allCategories.length > 0 && (
                      <div className="relative group">
                        <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="pl-12 pr-8 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50 appearance-none w-full sm:w-48 group-hover:border-blue-300"
                        >
                          <option value="">همه دسته‌بندی‌ها</option>
                          {allCategories.map((category) => (
                            <option key={category} value={category}>
                              {MAIN_CATEGORIES.find((c) => c.id === category)
                                ?.name || category}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* View Toggle */}
                    <div className="flex bg-gray-100 rounded-2xl p-2">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-3 rounded-xl transition-all duration-300 ${
                          viewMode === "grid"
                            ? "bg-white shadow-lg text-blue-600 shadow-blue-500/25"
                            : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                        }`}
                      >
                        <Grid className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-3 rounded-xl transition-all duration-300 ${
                          viewMode === "list"
                            ? "bg-white shadow-lg text-blue-600 shadow-blue-500/25"
                            : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                        }`}
                      >
                        <List className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {sortedProducts.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-gray-300 mb-6">
                      <Package className="h-24 w-24 mx-auto opacity-50" />
                    </div>
                    <p className="text-gray-500 text-xl font-bold mb-3">
                      محصولی یافت نشد
                    </p>
                    {searchTerm || selectedCategory ? (
                      <p className="text-gray-400">
                        سعی کنید فیلترهای جستجو را تغییر دهید
                      </p>
                    ) : (
                      <button
                        onClick={openModal}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-bold shadow-2xl shadow-blue-500/25 hover:shadow-3xl hover:shadow-purple-500/25 transform hover:-translate-y-0.5"
                      >
                        <Plus className="h-5 w-5 ml-2 inline" />
                        افزودن اولین محصول
                      </button>
                    )}
                  </div>
                ) : viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {sortedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        getImageUrl={getImageUrl}
                        onProductClick={handleProductClick}
                        onDelete={deleteProduct}
                        onDuplicate={duplicateProduct}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedProducts.map((product) => (
                      <ProductListItem
                        key={product.id}
                        product={product}
                        getImageUrl={getImageUrl}
                        onProductClick={handleProductClick}
                        onDelete={deleteProduct}
                        onDuplicate={duplicateProduct}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Product Card Component for Grid View
function ProductCard({
  product,
  getImageUrl,
  onProductClick,
  onDelete,
  onDuplicate,
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showActions, setShowActions] = useState(false);

  // Format price with commas
  const formatPrice = (price) => {
    if (!price) return "0";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div
      onClick={() => onProductClick(product.id)}
      className="group bg-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden hover:shadow-3xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
    >
      {/* Image Gallery */}
      <div className="relative aspect-w-16 aspect-h-12 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <img
          src={getImageUrl(product, currentImageIndex)}
          alt={product.title}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Image Navigation */}
        {product.images && product.images.length > 1 && (
          <div className="absolute bottom-4 left-4 flex space-x-2 space-x-reverse">
            {product.images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? "bg-white scale-125 shadow-lg"
                    : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}

        {/* Stock Badge */}
        <div
          className={`absolute top-4 left-4 px-4 py-2 rounded-2xl text-sm font-bold backdrop-blur-sm border ${
            product.stock > 10
              ? "bg-green-500/20 text-green-700 border-green-500/30"
              : product.stock > 0
              ? "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
              : "bg-red-500/20 text-red-700 border-red-500/30"
          }`}
        >
          {product.stock > 10
            ? "🟢 موجود"
            : product.stock > 0
            ? `🟡 کمبود (${product.stock})`
            : "🔴 ناموجود"}
        </div>

        {/* Discount Badge */}
        {product.compare_price && product.compare_price > product.price && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-2xl text-sm font-bold shadow-2xl shadow-red-500/25">
            💫 {Math.round((1 - product.price / product.compare_price) * 100)}%
            تخفیف
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-4 right-16 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl hover:bg-white transition-all duration-300 hover:scale-110"
            >
              <MoreVertical className="h-5 w-5 text-gray-600" />
            </button>

            {showActions && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-200 py-3 z-10 animate-fadeIn">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onProductClick(product.id);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-3 text-right hover:bg-blue-50 transition-all duration-200 flex items-center space-x-3 space-x-reverse text-sm text-gray-700 rounded-lg mx-2"
                >
                  <Eye className="h-4 w-4 text-blue-500" />
                  <span>مشاهده جزئیات</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(product.id, e);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-3 text-right hover:bg-green-50 transition-all duration-200 flex items-center space-x-3 space-x-reverse text-sm text-gray-700 rounded-lg mx-2"
                >
                  <Copy className="h-4 w-4 text-green-500" />
                  <span>کپی محصول</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(product.id, e);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-3 text-right hover:bg-red-50 transition-all duration-200 flex items-center space-x-3 space-x-reverse text-sm text-red-600 rounded-lg mx-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>حذف محصول</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
      </div>

      <div className="p-6">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
          {product.category && (
            <span className="bg-blue-50 text-blue-700 text-xs px-3 py-2 rounded-2xl border border-blue-200 font-medium">
              #
              {MAIN_CATEGORIES.find((c) => c.id === product.category)?.name ||
                product.category}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 leading-relaxed">
          {product.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Sizes & Colors */}
        {(product.sizes || product.colors) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {product.sizes &&
              product.sizes.slice(0, 3).map((size, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-xl"
                >
                  {size}
                </span>
              ))}
            {product.colors &&
              product.colors.slice(0, 2).map((color, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-xl"
                >
                  {color}
                </span>
              ))}
            {(product.sizes?.length > 3 || product.colors?.length > 2) && (
              <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-xl">
                +
                {(product.sizes?.length - 3 || 0) +
                  (product.colors?.length - 2 || 0)}
              </span>
            )}
          </div>
        )}

        {/* Price & SKU */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <span className="text-xl font-bold text-green-600" dir="ltr">
              {formatPrice(product.price || 0)} ریال
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-sm text-gray-500 line-through" dir="ltr">
                {formatPrice(product.compare_price)} ریال
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-2xl font-medium">
            📋 {product.sku}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 space-x-reverse">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onProductClick(product.id);
            }}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold text-sm flex items-center justify-center shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35"
          >
            <Eye className="h-4 w-4 ml-2" />
            مشاهده جزئیات
          </button>
        </div>
      </div>
    </div>
  );
}

// Product List Item Component for List View
function ProductListItem({
  product,
  getImageUrl,
  onProductClick,
  onDelete,
  onDuplicate,
}) {
  // Format price with commas
  const formatPrice = (price) => {
    if (!price) return "0";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div
      onClick={() => onProductClick(product.id)}
      className="group flex items-center space-x-6 space-x-reverse bg-white border border-white/20 rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-1"
    >
      <div className="relative">
        <img
          src={getImageUrl(product)}
          alt={product.title}
          className="w-20 h-20 object-cover rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg"
        />
        {/* Stock Indicator */}
        <div
          className={`absolute -top-1 -left-1 w-4 h-4 rounded-full border-2 border-white ${
            product.stock > 10
              ? "bg-green-500"
              : product.stock > 0
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors duration-300">
            {product.title}
          </h3>
          <div className="flex items-center space-x-3 space-x-reverse text-sm text-gray-500">
            <Package className="h-4 w-4" />
            <span>کد: {product.sku}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-1">
          {product.description}
        </p>

        <div className="flex items-center space-x-6 space-x-reverse text-sm">
          <div
            className="flex items-center space-x-2 space-x-reverse text-green-600 font-bold"
            dir="ltr"
          >
            <DollarSign className="h-4 w-4" />
            <span>{formatPrice(product.price || 0)} ریال</span>
          </div>

          {product.compare_price && product.compare_price > product.price && (
            <span className="text-gray-500 line-through text-sm" dir="ltr">
              {formatPrice(product.compare_price)} ریال
            </span>
          )}

          <div className="flex items-center space-x-2 space-x-reverse text-orange-600">
            <Package className="h-4 w-4" />
            <span>موجودی: {product.stock || 0}</span>
          </div>

          {product.category && (
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-2xl text-xs font-medium">
              {MAIN_CATEGORIES.find((c) => c.id === product.category)?.name ||
                product.category}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3 space-x-reverse">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onProductClick(product.id);
          }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold text-sm flex items-center shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35"
        >
          <Eye className="h-4 w-4 ml-2" />
          مشاهده
        </button>
        <button
          onClick={(e) => onDuplicate(product.id, e)}
          className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition-all duration-300 hover:scale-110"
          title="کپی محصول"
        >
          <Copy className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => onDelete(product.id, e)}
          className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all duration-300 hover:scale-110"
          title="حذف محصول"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
