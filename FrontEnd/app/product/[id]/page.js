/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "react-hot-toast";

import {
  ArrowLeft,
  Save,
  Trash2,
  Eye,
  Package,
  Tag,
  DollarSign,
  BarChart3,
  Image as ImageIcon,
  Edit3,
  AlertCircle,
  Plus,
  Upload,
  X,
  Palette,
  Ruler,
  ShoppingBag,
  Archive,
  RefreshCw,
  Copy,
  TrendingUp,
  Users,
  EyeOff,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Star,
  Share2,
  Layers,
  Camera,
  Loader2,
} from "lucide-react";

// دسته‌بندی‌های اصلی
const MAIN_CATEGORIES = [
  { id: "men", name: "مردانه" },
  { id: "women", name: "زنانه" },
  { id: "kids", name: "کودک" },
  { id: "baby", name: "نوزاد" },
];

// سایزهای استاندارد
const SIZE_OPTIONS = {
  clothing: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
  shoes: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
  kids: ["2T", "3T", "4T", "5T", "6T", "7T", "8T"],
};

// رنگ‌های استاندارد با کد رنگ
const COLOR_OPTIONS = [
  { name: "مشکی", hex: "#000000", color: "bg-gray-900" },
  { name: "سفید", hex: "#FFFFFF", color: "bg-white border border-gray-300" },
  { name: "خاکستری", hex: "#808080", color: "bg-gray-500" },
  { name: "قرمز", hex: "#FF0000", color: "bg-red-500" },
  { name: "آبی", hex: "#0000FF", color: "bg-blue-500" },
  { name: "سبز", hex: "#008000", color: "bg-green-500" },
  { name: "زرد", hex: "#FFFF00", color: "bg-yellow-500" },
  { name: "نارنجی", hex: "#FFA500", color: "bg-orange-500" },
  { name: "بنفش", hex: "#800080", color: "bg-purple-500" },
  { name: "قهوه‌ای", hex: "#A52A2A", color: "bg-yellow-800" },
];

// مودال تأیید حذف
function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
  isDeleting,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">حذف محصول</h3>
          <p className="text-gray-600 mb-6">
            آیا از حذف محصول{" "}
            <span className="font-semibold">{productName}</span> اطمینان دارید؟
            <br />
            <span className="text-red-500 text-sm">
              این عمل غیرقابل بازگشت است!
            </span>
          </p>
          <div className="flex space-x-3 space-x-reverse">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-2xl hover:bg-gray-200 transition-colors"
            >
              انصراف
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 bg-red-500 text-white px-4 py-3 rounded-2xl hover:bg-red-600 transition-colors flex items-center justify-center"
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin ml-2" />
                  در حال حذف...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 ml-2" />
                  بله، حذف شود
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// کامپوننت پیش‌نمایش تصویر
function ImagePreview({ src, alt, onRemove, isNew = false }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative group">
      <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-100">
        {isLoading && !hasError && (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
          </div>
        )}
        {hasError ? (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ImageIcon className="h-8 w-8" />
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            className={`w-full h-full object-cover ${
              isLoading ? "hidden" : "block"
            }`}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
              console.error("Failed to load image:", src);
            }}
          />
        )}
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

const BASE_API = process.env.NEXT_PUBLIC_API_URL;

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id;

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // استفاده از ref برای ذخیره مقادیر اولیه
  const initialDataRef = useRef({
    sizes: [],
    colors: [],
    images: [],
    title: "",
    description: "",
    sku: "",
    price: 0,
    compare_price: "",
    stock: 0,
    category: "men",
    status: "active",
    tags: "",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    trigger,
    getValues,
  } = useForm();

  // پیگیری تغییرات در stateهای مختلف
  const [formDirty, setFormDirty] = useState(false);

  const price = watch("price", 0);
  const comparePrice = watch("compare_price", 0);
  const stock = watch("stock", 0);
  const title = watch("title", "");
  const description = watch("description", "");
  const sku = watch("sku", "");
  const category = watch("category", "men");
  const status = watch("status", "active");
  const tags = watch("tags", "");

  // دریافت توکن احراز هویت
  const getAuthToken = useCallback(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  }, []);

  // بررسی تغییرات
  const checkForChanges = useCallback(() => {
    if (!initialDataRef.current) return false;

    const currentFormValues = getValues();

    // بررسی تغییرات فرم
    const formChanged =
      title !== initialDataRef.current.title ||
      description !== initialDataRef.current.description ||
      sku !== initialDataRef.current.sku ||
      price !== initialDataRef.current.price ||
      comparePrice !== initialDataRef.current.compare_price ||
      stock !== initialDataRef.current.stock ||
      category !== initialDataRef.current.category ||
      status !== initialDataRef.current.status ||
      tags !== initialDataRef.current.tags;

    // بررسی تغییرات سایزها
    const sizesChanged =
      JSON.stringify([...selectedSizes].sort()) !==
      JSON.stringify([...initialDataRef.current.sizes].sort());

    // بررسی تغییرات رنگ‌ها
    const colorsChanged =
      JSON.stringify([...selectedColors].sort()) !==
      JSON.stringify([...initialDataRef.current.colors].sort());

    // بررسی تغییرات تصاویر
    const imagesChanged = newImages.length > 0;

    return formChanged || sizesChanged || colorsChanged || imagesChanged;
  }, [
    title,
    description,
    sku,
    price,
    comparePrice,
    stock,
    category,
    status,
    tags,
    selectedSizes,
    selectedColors,
    newImages,
    getValues,
  ]);

  // به‌روزرسانی وضعیت dirty هنگام تغییرات
  useEffect(() => {
    setFormDirty(checkForChanges());
  }, [
    title,
    description,
    sku,
    price,
    comparePrice,
    stock,
    category,
    status,
    tags,
    selectedSizes,
    selectedColors,
    newImages.length,
    checkForChanges,
  ]);

  // دریافت اطلاعات محصول
  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const token = getAuthToken();
      if (!token) {
        toast.error("لطفا ابتدا وارد شوید");
        router.push("/auth/owner-login");
        return;
      }

      console.log("🔄 Fetching product data...");
      const response = await fetch(`${BASE_API}/products/${productId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("محصول یافت نشد");
          router.push("/dashboard/products");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const productData = await response.json();
      console.log("✅ Product data received:", productData);

      setProduct(productData);

      // تنظیم مقادیر فرم
      const formData = {
        title: productData.title || "",
        description: productData.description || "",
        sku: productData.sku || "",
        price: productData.price || 0,
        compare_price: productData.compare_price || "",
        stock: productData.stock || 0,
        category: productData.category || "men",
        status: productData.status || "active",
        tags: productData.tags ? productData.tags.join(", ") : "",
      };

      reset(formData);

      // تنظیم سایزها
      const productSizes = productData.sizes || [];
      setSelectedSizes(productSizes);

      // تنظیم رنگ‌ها - بررسی ساختار داده‌های رنگ
      console.log("🟡 Product colors data:", productData.colors);
      let productColors = [];
      if (productData.colors && Array.isArray(productData.colors)) {
        if (productData.colors.length > 0) {
          if (typeof productData.colors[0] === "string") {
            // رنگ‌ها به صورت رشته هستند
            productColors = productData.colors;
          } else if (typeof productData.colors[0] === "object") {
            // رنگ‌ها به صورت شی هستند
            productColors = productData.colors
              .map((color) =>
                typeof color === "object"
                  ? color.name || color.color || ""
                  : color
              )
              .filter((name) => name);
          }
        }
      }
      setSelectedColors(productColors);

      // تنظیم تصاویر موجود
      if (productData.images && productData.images.length > 0) {
        console.log("📸 Processing product images:", productData.images);
        const processedImages = productData.images.map((img, index) => {
          const imageUrl = getImageUrl(img);
          console.log(`Image ${index} URL:`, imageUrl);
          return {
            id: img.id,
            url: imageUrl,
            index: index,
            isExisting: true,
            originalData: img,
          };
        });
        setExistingImages(processedImages);
        console.log("Processed images:", processedImages);
      } else {
        console.log("No images found in product data");
        setExistingImages([]);
      }

      // ذخیره مقادیر اولیه برای مقایسه
      initialDataRef.current = {
        ...formData,
        sizes: [...productSizes],
        colors: [...productColors],
        images: productData.images || [],
      };

      // ریست کردن تصاویر جدید
      setNewImages([]);

      // تنظیم dirty state به false
      setFormDirty(false);

      toast.success("اطلاعات محصول بارگذاری شد");
    } catch (error) {
      console.error("💥 Error fetching product:", error);
      toast.error("خطا در دریافت اطلاعات محصول");
      router.push("/dashboard/products");
    } finally {
      setIsLoading(false);
    }
  };

  // تابع کمکی برای دریافت URL تصویر - بهبود یافته
  const getImageUrl = (imageData) => {
    if (!imageData) {
      console.log("No image data provided");
      return null;
    }

    console.log("Processing image data:", imageData);

    try {
      // حالت 1: اگر تصویر URL مستقیم دارد
      if (typeof imageData === "string") {
        console.log("Direct string URL:", imageData);
        if (imageData.startsWith("/")) {
          // URL نسبی - اضافه کردن دامنه
          const fullUrl = `${BASE_API.replace("/api", "")}${imageData}`;
          console.log("Full URL from relative:", fullUrl);
          return fullUrl;
        }
        // URL کامل
        return imageData;
      }

      // حالت 2: اگر تصویر یک شی است
      if (typeof imageData === "object") {
        // حالت 2.1: اگر فیلد image وجود دارد
        if (imageData.image) {
          console.log("Found image field:", imageData.image);
          if (typeof imageData.image === "string") {
            if (imageData.image.startsWith("/")) {
              return `${BASE_API.replace("/api", "")}${imageData.image}`;
            }
            return imageData.image;
          }
        }

        // حالت 2.2: اگر فیلد url وجود دارد
        if (imageData.url) {
          console.log("Found url field:", imageData.url);
          if (typeof imageData.url === "string") {
            if (imageData.url.startsWith("/")) {
              return `${BASE_API.replace("/api", "")}${imageData.url}`;
            }
            return imageData.url;
          }
        }

        // حالت 2.3: اگر داده‌های باینری MongoDB وجود دارد
        if (imageData.data && Array.isArray(imageData.data)) {
          console.log("Processing MongoDB binary data");
          try {
            const base64String = btoa(
              String.fromCharCode(...new Uint8Array(imageData.data))
            );
            const contentType = imageData.contentType || "image/jpeg";
            const dataUrl = `data:${contentType};base64,${base64String}`;
            console.log("Created data URL from binary");
            return dataUrl;
          } catch (error) {
            console.error("Error converting binary to base64:", error);
          }
        }

        // حالت 2.4: اگر فایل image در حالت File وجود دارد
        if (imageData instanceof File) {
          console.log("File object found");
          return URL.createObjectURL(imageData);
        }
      }

      console.warn("Unknown image data format:", typeof imageData, imageData);
      return "/api/placeholder/400/300"; // تصویر پیش‌فرض
    } catch (error) {
      console.error("Error creating image URL:", error);
      return "/api/placeholder/400/300"; // تصویر پیش‌فرض
    }
  };

  // آپلود تصویر جدید
  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const totalImages = existingImages.length + newImages.length + files.length;
    if (totalImages > 5) {
      toast.error("حداکثر ۵ تصویر قابل آپلود است");
      return;
    }

    const newImagePreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
      isNew: true,
    }));

    setNewImages((prev) => [...prev, ...newImagePreviews]);
    toast.success(`${files.length} تصویر اضافه شد`);
  };

  // حذف تصویر جدید
  const removeNewImage = (id) => {
    setNewImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  // حذف تصویر موجود از سرور
  const removeExistingImage = async (imageIndex) => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("لطفا ابتدا وارد شوید");
        return;
      }

      console.log(`Removing image at index: ${imageIndex}`);
      const response = await fetch(
        `${BASE_API}/products/${productId}/remove-image/${imageIndex}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setExistingImages((prev) =>
          prev.filter((img) => img.index !== imageIndex)
        );
        toast.success("تصویر حذف شد");
        // Refresh product data to get updated image list
        fetchProduct();
      } else {
        console.error("Failed to remove image:", await response.text());
        toast.error("خطا در حذف تصویر");
      }
    } catch (error) {
      console.error("💥 Error removing image:", error);
      toast.error("خطا در حذف تصویر");
    }
  };

  // افزودن تصویر به محصول
  const addImageToProduct = async (file) => {
    try {
      setIsUploadingImage(true);
      const token = getAuthToken();
      if (!token) {
        throw new Error("لطفا ابتدا وارد شوید");
      }

      const formData = new FormData();
      formData.append("file", file);

      console.log("Uploading image file:", file.name);
      const response = await fetch(
        `${BASE_API}/products/${productId}/add-image/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload failed:", errorText);
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const result = await response.json();
      console.log("📦 Image upload result:", result);
      return result;
    } catch (error) {
      console.error("💥 Error uploading image:", error);
      throw error;
    } finally {
      setIsUploadingImage(false);
    }
  };

  // تغییر وضعیت سایز
  const handleSizeToggle = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // تغییر وضعیت رنگ
  const handleColorToggle = (colorName) => {
    setSelectedColors((prev) =>
      prev.includes(colorName)
        ? prev.filter((c) => c !== colorName)
        : [...prev, colorName]
    );
  };

  // پیدا کردن رنگ با نام
  const findColorByName = (colorName) => {
    return COLOR_OPTIONS.find((color) => color.name === colorName);
  };

  // ارسال فرم
  const onSubmit = async (data) => {
    const isValid = await trigger();
    if (!isValid) {
      toast.error("لطفا فرم را به درستی تکمیل کنید");
      return;
    }

    if (existingImages.length === 0 && newImages.length === 0) {
      toast.error("حداقل یک تصویر برای محصول لازم است");
      return;
    }

    setIsUpdating(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("لطفا ابتدا وارد شوید");
      }

      console.log("🚀 Starting product update process...");

      // ابتدا تصاویر جدید را آپلود می‌کنیم
      if (newImages.length > 0) {
        const toastId = toast.loading("در حال آپلود تصاویر...");
        for (const image of newImages) {
          try {
            await addImageToProduct(image.file);
          } catch (error) {
            console.error("Error uploading image:", error);
            toast.error(`خطا در آپلود تصویر: ${error.message}`, {
              id: toastId,
            });
          }
        }
        toast.dismiss(toastId);
      }

      // سپس اطلاعات محصول را به‌روزرسانی می‌کنیم
      const updateData = {
        title: data.title,
        description: data.description,
        sku: data.sku,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        category: data.category,
        status: data.status,
      };

      // اضافه کردن سایزها
      if (selectedSizes.length > 0) {
        updateData.sizes = selectedSizes;
      } else {
        updateData.sizes = [];
      }

      // اضافه کردن رنگ‌ها
      if (selectedColors.length > 0) {
        updateData.colors = selectedColors;
      } else {
        updateData.colors = [];
      }

      // اضافه کردن قیمت مقایسه
      if (data.compare_price && data.compare_price > 0) {
        updateData.compare_price = parseFloat(data.compare_price);
      }

      // اضافه کردن تگ‌ها
      if (data.tags && data.tags.trim()) {
        updateData.tags = data.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag);
      }

      console.log("📤 Updating product with data:", updateData);
      console.log("📤 Sizes to update:", selectedSizes);
      console.log("📤 Colors to update:", selectedColors);

      const response = await fetch(`${BASE_API}/products/${productId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Update failed:", errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(
            errorData.detail ||
              errorData.message ||
              `HTTP error! status: ${response.status}`
          );
        } catch {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const result = await response.json();
      console.log("✅ Update result:", result);

      // پاک کردن تصاویر موقت
      newImages.forEach((img) => URL.revokeObjectURL(img.preview));

      toast.success("محصول با موفقیت به‌روزرسانی شد");
      setIsEditMode(false);

      // Refresh product data
      await fetchProduct();
    } catch (error) {
      console.error("💥 Error updating product:", error);
      toast.error(error.message || "به‌روزرسانی محصول ناموفق بود");
    } finally {
      setIsUpdating(false);
    }
  };

  // حذف محصول
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("لطفا ابتدا وارد شوید");
      }

      const response = await fetch(`${BASE_API}/products/${productId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("محصول با موفقیت حذف شد");
        router.push("/dashboard/products");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "حذف محصول ناموفق بود");
      }
    } catch (error) {
      console.error("💥 Error deleting product:", error);
      toast.error(error.message || "خطا در حذف محصول");
      setDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // تغییر وضعیت ویرایش
  const toggleEditMode = () => {
    if (isEditMode) {
      // Cancel edit mode - reset everything
      if (product) {
        reset({
          title: product.title || "",
          description: product.description || "",
          sku: product.sku || "",
          price: product.price || 0,
          compare_price: product.compare_price || "",
          stock: product.stock || 0,
          category: product.category || "men",
          status: product.status || "active",
          tags: product.tags ? product.tags.join(", ") : "",
        });
        setSelectedSizes(product.sizes || []);
        setSelectedColors(product.colors || []);
        setNewImages([]); // Clear new images
        setFormDirty(false);
      }
    }
    setIsEditMode(!isEditMode);
  };

  // نمایش وضعیت بارگذاری
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">در حال بارگذاری محصول...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">محصول یافت نشد</p>
          <button
            onClick={() => router.push("/dashboard/products")}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-2xl hover:bg-blue-600 transition-colors"
          >
            بازگشت به لیست محصولات
          </button>
        </div>
      </div>
    );
  }

  const allImages = [...existingImages, ...newImages];
  const currentImage = allImages[currentImageIndex];

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

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                onClick={() => router.push("/dashboard/products")}
                className="p-3 bg-white rounded-2xl border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? "ویرایش محصول" : "مشاهده محصول"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isEditMode ? "ویرایش اطلاعات محصول" : "مشاهده جزئیات محصول"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 space-x-reverse">
              <button
                onClick={toggleEditMode}
                className={`flex items-center space-x-2 space-x-reverse px-6 py-3 rounded-2xl transition-colors font-semibold ${
                  isEditMode
                    ? "bg-gray-500 text-white hover:bg-gray-600"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {isEditMode ? (
                  <>
                    <Eye className="h-5 w-5" />
                    <span>مشاهده</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="h-5 w-5" />
                    <span>ویرایش</span>
                  </>
                )}
              </button>

              {!isEditMode && (
                <>
                  <button
                    onClick={() => setDeleteModalOpen(true)}
                    className="flex items-center space-x-2 space-x-reverse bg-red-500 text-white px-6 py-3 rounded-2xl hover:bg-red-600 transition-colors font-semibold"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span>حذف محصول</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {!isEditMode ? (
            /* حالت نمایش */
            <div className="bg-white rounded-3xl border border-gray-200 p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* بخش تصاویر */}
                <div className="space-y-6">
                  {/* تصویر اصلی */}
                  <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-100">
                    {allImages.length > 0 && currentImage ? (
                      <div className="relative w-full h-full">
                        <img
                          key={currentImage.id}
                          src={currentImage.url || currentImage.preview}
                          alt={`Product ${currentImageIndex + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error(
                              "Failed to load main image:",
                              currentImage.url || currentImage.preview
                            );
                            e.target.src = "/api/placeholder/400/300";
                          }}
                        />
                        {/* ناوبری تصاویر */}
                        {allImages.length > 1 && (
                          <>
                            <button
                              onClick={() =>
                                setCurrentImageIndex(
                                  (prev) =>
                                    (prev - 1 + allImages.length) %
                                    allImages.length
                                )
                              }
                              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 rounded-full p-3 shadow-lg hover:bg-white transition-colors"
                            >
                              <ChevronLeft className="h-5 w-5 text-gray-700" />
                            </button>
                            <button
                              onClick={() =>
                                setCurrentImageIndex(
                                  (prev) => (prev + 1) % allImages.length
                                )
                              }
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 rounded-full p-3 shadow-lg hover:bg-white transition-colors"
                            >
                              <ChevronRight className="h-5 w-5 text-gray-700" />
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <ImageIcon className="h-16 w-16 mb-4" />
                        <p>تصویری برای این محصول وجود ندارد</p>
                      </div>
                    )}
                  </div>

                  {/* تامبنیل‌ها */}
                  {allImages.length > 1 && (
                    <div className="flex space-x-4 space-x-reverse overflow-x-auto pb-2">
                      {allImages.map((img, index) => (
                        <button
                          key={img.id}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-colors ${
                            currentImageIndex === index
                              ? "border-blue-500"
                              : "border-gray-200"
                          }`}
                        >
                          <img
                            src={img.url || img.preview}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error(
                                "Failed to load thumbnail:",
                                img.url || img.preview
                              );
                              e.target.src = "/api/placeholder/80/80";
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* بخش اطلاعات محصول */}
                <div className="space-y-6">
                  {/* عنوان و کد محصول */}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {product.title}
                    </h1>
                    <div className="flex items-center space-x-4 space-x-reverse text-gray-600">
                      <span className="text-lg">کد: {product.sku}</span>
                      {product.rating && (
                        <div className="flex items-center space-x-1 space-x-reverse text-yellow-500">
                          <Star className="h-5 w-5 fill-current" />
                          <span className="text-gray-700 font-medium">
                            {product.rating.average}
                          </span>
                          <span className="text-gray-500 text-sm">
                            ({product.rating.count})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* دسته‌بندی و قیمت */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 space-x-reverse text-gray-700">
                      <Tag className="h-5 w-5 text-gray-400" />
                      <span>دسته‌بندی:</span>
                      <span className="font-semibold">
                        {MAIN_CATEGORIES.find((c) => c.id === product.category)
                          ?.name || product.category}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 space-x-reverse">
                      <span className="text-3xl font-bold text-gray-900">
                        {product.price?.toLocaleString() || "0"} تومان
                      </span>
                      {product.compare_price &&
                        product.compare_price > product.price && (
                          <span className="text-xl text-gray-500 line-through">
                            {product.compare_price.toLocaleString()} تومان
                          </span>
                        )}
                      {product.discount_percentage &&
                        product.discount_percentage > 0 && (
                          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                            {product.discount_percentage}% تخفیف
                          </span>
                        )}
                    </div>
                  </div>

                  {/* وضعیت محصول */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 space-x-reverse text-gray-700">
                      <Package className="h-5 w-5 text-gray-400" />
                      <div>
                        <span>موجودی: </span>
                        <span
                          className={`font-semibold ${
                            product.is_in_stock
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {product.stock || 0} عدد
                        </span>
                        {product.is_low_stock && (
                          <span className="text-yellow-600 text-sm mr-2">
                            (موجودی کم)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse text-gray-700">
                      <Eye className="h-5 w-5 text-gray-400" />
                      <span>بازدید: </span>
                      <span className="font-semibold">
                        {product.views || 0}
                      </span>
                    </div>
                  </div>

                  {/* خط جداکننده */}
                  <hr className="border-gray-300" />

                  {/* توضیحات محصول */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      توضیحات محصول
                    </h3>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {product.description}
                    </div>
                  </div>

                  {/* سایز و رنگ */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* سایزها */}
                    {selectedSizes.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-3">
                          سایزهای موجود
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedSizes.map((size) => (
                            <span
                              key={size}
                              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium"
                            >
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* رنگ‌ها */}
                    {selectedColors.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-3">
                          رنگ‌های موجود
                        </h5>
                        <div className="flex flex-wrap gap-3">
                          {selectedColors.map((colorName) => {
                            const colorInfo = findColorByName(colorName);
                            return (
                              <div
                                key={colorName}
                                className="flex flex-col items-center space-y-1"
                              >
                                <div
                                  className={`w-8 h-8 rounded-full border border-gray-300 ${
                                    colorInfo?.color || "bg-gray-200"
                                  }`}
                                  style={
                                    colorInfo?.hex
                                      ? { backgroundColor: colorInfo.hex }
                                      : {}
                                  }
                                />
                                <span className="text-xs text-gray-600">
                                  {colorName}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* حالت ویرایش */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* بخش اصلی فرم */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* اطلاعات اصلی محصول */}
                  <div className="bg-white rounded-3xl border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      اطلاعات اصلی محصول
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          عنوان محصول *
                        </label>
                        <input
                          type="text"
                          {...register("title", {
                            required: "عنوان محصول الزامی است",
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                          placeholder="عنوان محصول را وارد کنید"
                        />
                        {errors.title && (
                          <p className="text-red-500 text-sm mt-2">
                            {errors.title.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          کد محصول (SKU) *
                        </label>
                        <input
                          type="text"
                          {...register("sku", {
                            required: "کد محصول الزامی است",
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                          placeholder="مثلاً: TSHIRT-M-MEDIUM"
                        />
                        {errors.sku && (
                          <p className="text-red-500 text-sm mt-2">
                            {errors.sku.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        توضیحات محصول *
                      </label>
                      <textarea
                        {...register("description", {
                          required: "توضیحات محصول الزامی است",
                        })}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                        placeholder="توضیحات کامل محصول را وارد کنید..."
                      />
                      {errors.description && (
                        <p className="text-red-500 text-sm mt-2">
                          {errors.description.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* قیمت و موجودی */}
                  <div className="bg-white rounded-3xl border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      قیمت و موجودی
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          قیمت (تومان) *
                        </label>
                        <input
                          type="number"
                          {...register("price", {
                            required: "قیمت الزامی است",
                            min: {
                              value: 0,
                              message: "قیمت نمی‌تواند منفی باشد",
                            },
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                          placeholder="0"
                        />
                        {errors.price && (
                          <p className="text-red-500 text-sm mt-2">
                            {errors.price.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          قیمت قبل از تخفیف
                        </label>
                        <input
                          type="number"
                          {...register("compare_price", {
                            min: {
                              value: 0,
                              message: "قیمت نمی‌تواند منفی باشد",
                            },
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                          placeholder="اختیاری"
                        />
                        {errors.compare_price && (
                          <p className="text-red-500 text-sm mt-2">
                            {errors.compare_price.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          موجودی *
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                          placeholder="0"
                        />
                        {errors.stock && (
                          <p className="text-red-500 text-sm mt-2">
                            {errors.stock.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* انتخاب سایزها */}
                  <div className="bg-white rounded-3xl border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <Ruler className="h-5 w-5 ml-2" />
                      انتخاب سایزها
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {SIZE_OPTIONS.clothing.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleSizeToggle(size)}
                          className={`px-4 py-3 rounded-2xl border-2 font-medium transition-colors ${
                            selectedSizes.includes(size)
                              ? "bg-blue-500 text-white border-blue-500"
                              : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    {selectedSizes.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                        <p className="text-blue-700 text-sm">
                          سایزهای انتخاب شده: {selectedSizes.join("، ")}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* انتخاب رنگ‌ها */}
                  <div className="bg-white rounded-3xl border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <Palette className="h-5 w-5 ml-2" />
                      انتخاب رنگ‌ها
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {COLOR_OPTIONS.map((color) => (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => handleColorToggle(color.name)}
                          className={`flex flex-col items-center space-y-2 p-3 rounded-2xl border-2 transition-colors ${
                            selectedColors.includes(color.name)
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div
                            className={`w-12 h-12 rounded-xl border-2 border-gray-300 ${color.color}`}
                            style={{ backgroundColor: color.hex }}
                          />
                          <span
                            className={`text-sm font-medium ${
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
                    {selectedColors.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                        <p className="text-blue-700 text-sm">
                          رنگ‌های انتخاب شده: {selectedColors.join("، ")}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* دکمه‌های اقدام */}
                  <div className="flex space-x-4 space-x-reverse">
                    <button
                      type="button"
                      onClick={toggleEditMode}
                      className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-2xl hover:bg-gray-200 transition-colors font-semibold"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating || !formDirty}
                      className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-2xl hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center"
                    >
                      {isUpdating ? (
                        <>
                          <RefreshCw className="h-5 w-5 animate-spin ml-2" />
                          در حال ذخیره...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 ml-2" />
                          ذخیره تغییرات
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* سایدبار */}
              <div className="space-y-6">
                {/* آپلود تصاویر */}
                <div className="bg-white rounded-3xl border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    تصاویر محصول
                  </h3>

                  <div className="space-y-4">
                    {/* نمایش تصاویر */}
                    {allImages.length > 0 && (
                      <div className="grid grid-cols-2 gap-3">
                        {allImages.map((img) => (
                          <ImagePreview
                            key={img.id}
                            src={img.url || img.preview}
                            alt="Product image"
                            onRemove={
                              img.isExisting
                                ? () => removeExistingImage(img.id)
                                : () => removeNewImage(img.id)
                            }
                            isNew={!img.isExisting}
                          />
                        ))}
                      </div>
                    )}

                    {/* آپلود جدید */}
                    <label className="block border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
                      {isUploadingImage ? (
                        <div className="flex items-center justify-center space-x-2 space-x-reverse">
                          <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
                          <span className="text-gray-600">در حال آپلود...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <span className="text-gray-600">
                            آپلود تصویر جدید
                          </span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={isUploadingImage}
                          />
                        </>
                      )}
                    </label>

                    <div className="text-sm text-gray-500 text-center">
                      {5 - allImages.length} تصویر دیگر می‌توانید آپلود کنید
                    </div>
                  </div>
                </div>

                {/* دسته‌بندی */}
                <div className="bg-white rounded-3xl border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    دسته‌بندی *
                  </h3>
                  <select
                    {...register("category", {
                      required: "دسته‌بندی الزامی است",
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    {MAIN_CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {/* تگ‌ها */}
                <div className="bg-white rounded-3xl border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    تگ‌ها
                  </h3>
                  <input
                    type="text"
                    {...register("tags")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="تیشرت, مردانه, پنبه (با کاما جدا کنید)"
                  />
                  <p className="text-gray-500 text-sm mt-2">
                    تگ‌ها به جستجوپذیری محصول کمک می‌کنند
                  </p>
                </div>

                {/* وضعیت محصول */}
                <div className="bg-white rounded-3xl border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    وضعیت محصول
                  </h3>
                  <select
                    {...register("status")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <option value="active">فعال</option>
                    <option value="inactive">غیرفعال</option>
                    <option value="draft">پیش‌نویس</option>
                    <option value="out_of_stock">ناموجود</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* مودال تأیید حذف */}
          <DeleteConfirmationModal
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={handleDelete}
            productName={product.title}
            isDeleting={isDeleting}
          />
        </div>
      </div>
    </>
  );
}
