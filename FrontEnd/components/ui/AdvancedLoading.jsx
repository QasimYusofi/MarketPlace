// components/ui/AdvancedLoading.jsx
"use client";

import React from "react";

const AdvancedLoading = ({
  variant = "default",
  size = "lg",
  text = "در حال بارگذاری...",
  subText = "لطفا صبر کنید...",
  fullScreen = false,
  className = "",
  overlay = false,
  color = "blue",
}) => {
  const colorClasses = {
    blue: {
      border: "border-blue-200 border-t-blue-500",
      gradient: "from-blue-500 to-blue-600",
      bg: "from-blue-50 to-blue-100",
    },
    green: {
      border: "border-green-200 border-t-green-500",
      gradient: "from-green-500 to-green-600",
      bg: "from-green-50 to-green-100",
    },
    purple: {
      border: "border-purple-200 border-t-purple-500",
      gradient: "from-purple-500 to-purple-600",
      bg: "from-purple-50 to-purple-100",
    },
    orange: {
      border: "border-orange-200 border-t-orange-500",
      gradient: "from-orange-500 to-orange-600",
      bg: "from-orange-50 to-orange-100",
    },
    indigo: {
      border: "border-indigo-200 border-t-indigo-500",
      gradient: "from-indigo-500 to-indigo-600",
      bg: "from-indigo-50 to-indigo-100",
    },
  };

  const sizeClasses = {
    sm: {
      spinner: "w-8 h-8 border-2",
      dot: "w-4 h-4",
      text: "text-sm",
    },
    md: {
      spinner: "w-12 h-12 border-3",
      dot: "w-6 h-6",
      text: "text-base",
    },
    lg: {
      spinner: "w-16 h-16 border-4",
      dot: "w-8 h-8",
      text: "text-lg",
    },
    xl: {
      spinner: "w-20 h-20 border-4",
      dot: "w-10 h-10",
      text: "text-xl",
    },
  };

  const variants = {
    default: ({ sizeClass, colorClass }) => (
      <>
        <div
          className={`${sizeClass.spinner} ${colorClass.border} rounded-full animate-spin mx-auto mb-4`}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`${sizeClass.dot} bg-gradient-to-r ${colorClass.gradient} rounded-full animate-pulse`}
          ></div>
        </div>
      </>
    ),
    dots: ({ sizeClass, colorClass }) => (
      <div className="flex space-x-2 space-x-reverse justify-center mb-4">
        <div
          className={`${sizeClass.dot} bg-gradient-to-r ${colorClass.gradient} rounded-full animate-bounce`}
        ></div>
        <div
          className={`${sizeClass.dot} bg-gradient-to-r ${colorClass.gradient} rounded-full animate-bounce animation-delay-150`}
        ></div>
        <div
          className={`${sizeClass.dot} bg-gradient-to-r ${colorClass.gradient} rounded-full animate-bounce animation-delay-300`}
        ></div>
      </div>
    ),
    bars: ({ sizeClass, colorClass }) => (
      <div className="flex space-x-1 space-x-reverse items-end justify-center mb-4 h-8">
        <div
          className={`w-2 bg-gradient-to-t ${colorClass.gradient} rounded-full animate-grow animation-delay-0`}
        ></div>
        <div
          className={`w-2 bg-gradient-to-t ${colorClass.gradient} rounded-full animate-grow animation-delay-150`}
        ></div>
        <div
          className={`w-2 bg-gradient-to-t ${colorClass.gradient} rounded-full animate-grow animation-delay-300`}
        ></div>
        <div
          className={`w-2 bg-gradient-to-t ${colorClass.gradient} rounded-full animate-grow animation-delay-450`}
        ></div>
        <div
          className={`w-2 bg-gradient-to-t ${colorClass.gradient} rounded-full animate-grow animation-delay-600`}
        ></div>
      </div>
    ),
    pulse: ({ sizeClass, colorClass }) => (
      <div
        className={`${sizeClass.spinner} bg-gradient-to-r ${colorClass.gradient} rounded-full animate-pulse mx-auto mb-4`}
      ></div>
    ),
  };

  const containerClass = fullScreen
    ? `min-h-screen flex items-center justify-center bg-gradient-to-br ${colorClasses[color].bg}`
    : "flex items-center justify-center";

  const contentClass = overlay
    ? "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
    : "";

  const VariantComponent = variants[variant] || variants.default;
  const sizeClass = sizeClasses[size];
  const colorClass = colorClasses[color];

  return (
    <div className={`${containerClass} ${contentClass} ${className}`}>
      <div className="text-center">
        <div className="relative">
          <VariantComponent sizeClass={sizeClass} colorClass={colorClass} />
        </div>
        <div className={`${sizeClass.text} font-medium text-gray-700`}>
          {text}
        </div>
        {subText && <div className="text-sm text-gray-500 mt-2">{subText}</div>}
      </div>
    </div>
  );
};

export default AdvancedLoading;
