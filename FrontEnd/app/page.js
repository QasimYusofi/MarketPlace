// app/page.js
"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { FiImage } from "react-icons/fi";
// import heroImg from "./../public/hq720.jpg";
// Import data from JSON files
import featuredProducts from "./../data/featuredProducts.json";
import siteConfig from "./../data/siteConfig.json";
import FooterPage from "./../components/Footer/footer";
import Header from "./../components/Header/header";
import ModernStorePage from "./stores/page";
export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Simulate cart count from localStorage or API
    const savedCartCount = localStorage.getItem("cartCount");
    if (savedCartCount) {
      setCartCount(parseInt(savedCartCount));
    }
  }, []);

  // Safe Image Component
  const SafeImage = ({ src, alt, width, height, className, fill = false }) => {
    const [hasError, setHasError] = useState(false);

    if (!src || hasError) {
      return (
        <div
          className={`${className} bg-gray-200 flex items-center justify-center rounded-lg`}
        >
          <FiImage className="text-gray-400 text-2xl" />
          <span className="sr-only">{alt}</span>
        </div>
      );
    }

    return (
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={className}
        onError={() => setHasError(true)}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAT8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        {...(fill && { fill: true })}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <Header />
      {/* Hero Banner */}
      {/* <!-- بنر معرفی --> */}

      {/* <section
        className="relative h-[300px] sm:h-[400px] md:h-[600px] lg:h-[860px] bg-cover bg-center flex items-center justify-center text-center mb-6"
        style={{
          backgroundImage: "url('/iamge2.jpeg')",
        }}
      ></section> */}

      <section className="relative h-[600px] bg-gradient-to-r from-purple-600 to-pink-500 mb-12">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative h-full flex items-center justify-center text-center text-white">
          <div className="max-w-4xl px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {siteConfig.site.name}
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              {siteConfig.site.description}
            </p>
            <Link
              href="/"
              className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              خرید آنلاین
            </Link>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto">{<ModernStorePage />}</div>

      {/* Featured Products Section */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-center mb-12">
          <div className="flex-grow h-px bg-gray-200"></div>
          <h2 className="text-3xl font-bold text-center px-6 whitespace-nowrap">
            منتخب مدرو
          </h2>
          <div className="flex-grow h-px bg-gray-200"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-4 gap-4">
          {featuredProducts.featuredProducts.map((product) => (
            <div
              key={product.id}
              className="text-center cursor-pointer flex justify-center items-center"
            >
              <img
                className="object-cover rounded-2xl shadow-sm h-96"
                src={product.img}
                alt={product.title}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <FooterPage />
    </div>
  );
}
