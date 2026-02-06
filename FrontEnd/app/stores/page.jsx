"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Store } from "lucide-react";

// Client-side cache with TTL
const createCache = () => {
  const cache = new Map();

  return {
    get: (key) => {
      const item = cache.get(key);
      if (!item) return null;

      // Check if cache item is expired
      if (Date.now() > item.expiry) {
        cache.delete(key);
        return null;
      }

      return item.value;
    },

    set: (key, value, ttl = 5 * 60 * 1000) => {
      cache.set(key, {
        value,
        expiry: Date.now() + ttl,
      });
    },

    clear: () => cache.clear(),
  };
};

const apiCache = createCache();

const ModernStorePage = () => {
  const router = useRouter();
  const [storeData, setStoreData] = useState({
    women: {
      stores: [],
      products: {},
      activeStore: null,
      storeDetails: null,
      loading: false,
    },
    men: {
      stores: [],
      products: {},
      activeStore: null,
      storeDetails: null,
      loading: false,
    },
    kids: {
      stores: [],
      products: {},
      activeStore: null,
      storeDetails: null,
      loading: false,
    },
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  // Optimized API fetch with client-side caching
  const fetchWithCache = useCallback(async (url, cacheKey, options = {}) => {
    // Try to get from cache first
    const cached = apiCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Cache successful responses for 5 minutes
      apiCache.set(cacheKey, result, 5 * 60 * 1000);
      return result;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }, []);

  // Fetch all stores with categories
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setInitialLoading(true);
        setError(null);

        // Fetch stores for each category
        const categories = [
          { key: "women", title: "فروشگاه‌های زنانه" },
          { key: "men", title: "فروشگاه‌های مردانه" },
          { key: "kids", title: "فروشگاه‌های کودک" },
        ];

        const storePromises = categories.map((category) =>
          fetchWithCache(
            `${process.env.NEXT_PUBLIC_API_URL}/categories/${category.key}/stores/`,
            `stores-${category.key}`
          )
            .then((response) => {
              // Return stores array from response
              return response.stores || [];
            })
            .catch((error) => {
              console.log(
                `No stores found for category ${category.key}:`,
                error.message
              );
              return []; // Return empty array if endpoint fails
            })
        );

        const results = await Promise.all(storePromises);

        // Process results for each category
        const newStoreData = {
          women: {
            stores: [],
            products: {},
            activeStore: null,
            storeDetails: null,
            loading: false,
          },
          men: {
            stores: [],
            products: {},
            activeStore: null,
            storeDetails: null,
            loading: false,
          },
          kids: {
            stores: [],
            products: {},
            activeStore: null,
            storeDetails: null,
            loading: false,
          },
        };

        // Process each category result
        categories.forEach((category, index) => {
          const stores = Array.isArray(results[index]) ? results[index] : [];
          console.log(
            `Found ${stores.length} stores for ${category.key}:`,
            stores
          );

          newStoreData[category.key].stores = stores;
          newStoreData[category.key].activeStore = stores[0]?.id || null;
          newStoreData[category.key].storeDetails = stores[0] || null;
        });

        console.log("Initial store data:", newStoreData);
        setStoreData(newStoreData);

        // Automatically load products for first store of each category
        categories.forEach((category) => {
          const storeId = newStoreData[category.key].activeStore;
          if (storeId) {
            loadStoreProducts(storeId, category.key);
          }
        });
      } catch (error) {
        console.error("Error in fetchStores:", error);
        setError("خطا در دریافت فروشگاه‌ها");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchStores();
  }, [fetchWithCache]);

  // Load products for active store
  const loadStoreProducts = useCallback(
    async (storeId, category) => {
      if (!storeId) return;

      // Set loading only for this specific category
      setStoreData((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          loading: true,
        },
      }));

      try {
        console.log(
          `Fetching products for store ${storeId} in category ${category}`
        );
        const result = await fetchWithCache(
          `${process.env.NEXT_PUBLIC_API_URL}/categories/${category}/stores/${storeId}/products/`,
          `products-${category}-${storeId}`
        );

        // Extract products from response (might be array or object with products field)
        let products = [];
        if (Array.isArray(result)) {
          products = result;
        } else if (result.products && Array.isArray(result.products)) {
          products = result.products;
        } else if (result.data && Array.isArray(result.data)) {
          products = result.data;
        }

        console.log(
          `Found ${products.length} products for store ${storeId}:`,
          products
        );

        setStoreData((prev) => ({
          ...prev,
          [category]: {
            ...prev[category],
            products: {
              ...prev[category].products,
              [storeId]: products,
            },
            loading: false,
          },
        }));
      } catch (error) {
        console.error(`Error loading products for store ${storeId}:`, error);
        setStoreData((prev) => ({
          ...prev,
          [category]: {
            ...prev[category],
            loading: false,
          },
        }));
      }
    },
    [fetchWithCache]
  );

  // Handle store activation
  const handleStoreActivation = useCallback(
    (storeId, category) => {
      const store = storeData[category].stores.find((s) => s.id === storeId);

      setStoreData((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          activeStore: storeId,
          storeDetails: store || null,
        },
      }));

      // Load products if not already loaded
      if (!storeData[category].products[storeId]) {
        loadStoreProducts(storeId, category);
      }
    },
    [storeData, loadStoreProducts]
  );

  const handleStoreLogoClick = (storeId) => {
    router.push(`/stores/${storeId}`);
  };

  const handleProductClick = (productId, storeId) => {
    if (productId) {
      router.push(`/product-details/${productId}/`);
    }
  };

  // Optimized render function
  const renderStoreSection = (title, category) => {
    const categoryData = storeData[category];
    const { stores, activeStore, products, storeDetails, loading } =
      categoryData;

    // Don't render if no stores
    if (stores.length === 0 && !loading) return null;

    const currentProducts = activeStore ? products[activeStore] || [] : [];
    const isWomen = category === "women";

    return (
      <div className="mb-12">
        {/* Section Title */}
        <div className="mb-2 px-4">
          <h2
            className={`text-lg md:text-xl font-bold text-center md:text-right bg-gradient-to-r bg-clip-text text-transparent ${
              isWomen
                ? "from-pink-500 to-pink-700"
                : category === "men"
                ? "from-blue-500 to-blue-700"
                : "from-green-500 to-green-700"
            }`}
          >
            {title}
          </h2>
        </div>

        {/* Show loading for stores */}
        {stores.length === 0 && loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 text-sm">
              در حال دریافت فروشگاه‌ها...
            </p>
          </div>
        )}

        {/* Store Selector Tabs - Only show if we have stores */}
        {stores.length > 0 && (
          <header className="bg-white shadow-sm lg:rounded-2xl rounded-lg mb-6">
            <div className="w-full">
              <div className="flex justify-between items-center">
                <div className="flex-1 w-full">
                  <div className="flex shrink space-x-2 md:space-x-3 overflow-x-auto py-2 px-1 sm:px-2 scrollbar-hide">
                    {stores.map((store) => (
                      <button
                        key={store.id}
                        onClick={() =>
                          handleStoreActivation(store.id, category)
                        }
                        className={`flex items-center font-semibold px-4 py-2 md:px-4 md:py-2 rounded-lg gap-x-2 md:gap-x-2 whitespace-nowrap transition-all flex-shrink-0 text-xs md:text-sm ${
                          activeStore === store.id
                            ? "bg-black text-white shadow-md"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <span className="text-xs md:text-sm lg:text-base truncate max-w-[80px] md:max-w-none">
                          {store.store_name || "فروشگاه"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Store Header/Brand Logo - Only for women's category and if we have store details */}
        {storeDetails &&
          activeStore === storeDetails.id &&
          stores.length > 0 && (
            <div
              className="bg-white w-full rounded-lg md:rounded-2xl shadow-sm h-40 md:h-60 cursor-pointer transform hover:scale-[1.01] md:hover:scale-[1.02] transition-all duration-300 border border-transparent hover:border-black overflow-hidden mb-6 md:mb-8"
              onClick={() => handleStoreLogoClick(storeDetails.id)}
            >
              <div className="w-full h-full">
                {storeDetails.store_logo ? (
                  <img
                    src={`http://127.0.0.1:8000${storeDetails.store_logo}`}
                    alt={storeDetails.store_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center ${
                      isWomen
                        ? "bg-gradient-to-br from-pink-400 to-pink-600"
                        : category === "men"
                        ? "bg-gradient-to-br from-blue-400 to-blue-600"
                        : "bg-gradient-to-br from-green-400 to-green-600"
                    }`}
                  >
                    <Store className="h-10 w-10 md:h-16 md:w-16 text-white" />
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Products Section - Only show if we have stores */}
        {stores.length > 0 && (
          <div className="w-full">
            {loading ? (
              <div className="text-center py-8 md:py-12">
                <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-3 md:mt-4 text-gray-600 text-sm md:text-base">
                  در حال بارگذاری محصولات...
                </p>
              </div>
            ) : (
              <div className="w-full">
                {/* Mobile Horizontal Scroll Layout */}
                <div className="block md:hidden">
                  <div className="flex overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide space-x-4">
                    {currentProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        storeId={activeStore}
                        onProductClick={handleProductClick}
                        isMobile={true}
                      />
                    ))}
                  </div>
                </div>

                {/* Desktop Grid Layout */}
                <div className="hidden w-full md:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6 justify-items-stretch">
                  {currentProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      storeId={activeStore}
                      onProductClick={handleProductClick}
                      isMobile={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State - No products but we have stores */}
            {currentProducts.length === 0 && !loading && stores.length > 0 && (
              <div className="text-center py-8 md:py-12">
                <ShoppingBag className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-3 md:mb-4" />
                <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                  محصولی یافت نشد
                </h3>
                <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto">
                  هنوز محصولی در این فروشگاه ثبت نشده است.
                </p>
              </div>
            )}
          </div>
        )}

        {/* No stores message - Only show if not loading */}
        {stores.length === 0 && !loading && (
          <div className="text-center py-8">
            <Store className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              در حال حاضر فروشگاهی در این دسته‌بندی وجود ندارد.
            </p>
          </div>
        )}
      </div>
    );
  };

  if (initialLoading) {
    return <LoadingState message="در حال دریافت فروشگاه‌ها..." />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  // Check if any category has stores
  const hasStores =
    storeData.women.stores.length > 0 ||
    storeData.men.stores.length > 0 ||
    storeData.kids.stores.length > 0;

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="w-full py-4 px-4 md:px-6 lg:px-8">
        {error && <ErrorAlert error={error} />}

        {/* Women's Stores Section */}
        {renderStoreSection("فروشگاه‌های زنانه", "women")}

        {/* Men's Stores Section */}
        {renderStoreSection("فروشگاه‌های مردانه", "men")}

        {/* Kids Stores Section */}
        {renderStoreSection("فروشگاه‌های کودک", "kids")}

        {/* No Stores Found at all */}
        {!initialLoading && !hasStores && <NoStoresFound />}
      </div>
    </div>
  );
};

// Extracted Product Card Component
const ProductCard = ({ product, storeId, onProductClick, isMobile }) => {
  // Get first image from product
  const getProductImage = () => {
    if (product.images && product.images.length > 0) {
      // Check different possible image structures
      const firstImage = product.images[0];
      if (firstImage.url) {
        return firstImage.url;
      } else if (firstImage.image) {
        return firstImage.image;
      }
      return firstImage;
    }

    // Fallback to image field directly on product
    if (product.image) {
      if (typeof product.image === "string") {
        return product.image;
      } else if (product.image.url) {
        return product.image.url;
      }
    }

    return null;
  };

  const productImage = getProductImage();

  return (
    <div
      onClick={() => onProductClick(product.id, storeId)}
      className={`product-card bg-white shadow-sm md:shadow-md rounded-xl md:rounded-2xl overflow-hidden cursor-pointer transition-transform ${
        isMobile
          ? "flex-shrink-0 w-38"
          : "hover:scale-[1.02] active:scale-[0.98]"
      }`}
    >
      <div className="aspect-square">
        {productImage ? (
          <img
            src={
              productImage.startsWith("/media/")
                ? `http://127.0.0.1:8000${productImage}`
                : productImage
            }
            alt={product.title || product.name}
            className={`w-full ${isMobile ? "h-64" : "h-80"} object-cover`}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%239ca3af' text-anchor='middle' dy='.3em'%3Eبدون تصویر%3C/text%3E%3C/svg%3E";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <ShoppingBag className="h-8 w-8 md:h-12 md:w-12 text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
};

// Extracted component for loading state
const LoadingState = ({ message }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 text-sm md:text-base">{message}</p>
    </div>
  </div>
);

// Extracted component for error state
const ErrorState = ({ error }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="text-center max-w-md">
      <ShoppingBag className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        خطا در دریافت اطلاعات
      </h3>
      <p className="text-gray-500 text-sm md:text-base">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
      >
        تلاش مجدد
      </button>
    </div>
  </div>
);

// Extracted component for error alert
const ErrorAlert = ({ error }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg mb-6 mx-2 md:mx-0">
    <div className="flex items-center p-3 md:p-4">
      <div className="text-red-600 ml-2">
        <svg
          className="h-4 w-4 md:h-5 md:w-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div className="mr-2">
        <p className="text-red-800 text-sm md:text-base">{error}</p>
      </div>
    </div>
  </div>
);

// Extracted component for no stores found
const NoStoresFound = () => (
  <div className="text-center py-12">
    <Store className="h-16 w-16 md:h-20 md:w-20 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">
      فروشگاهی یافت نشد
    </h3>
    <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto">
      در حال حاضر هیچ فروشگاهی برای نمایش وجود ندارد.
    </p>
  </div>
);

export default ModernStorePage;
