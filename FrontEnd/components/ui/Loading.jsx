// components/ui/Loading.jsx
"use client";

import React from "react";

const Loading = ({
  size = "lg",
  text = "در حال بارگذاری...",
  subText = "لطفا صبر کنید...",
  fullScreen = false,
  className = "",
  overlay = false,
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 border-2",
    md: "w-12 h-12 border-3",
    lg: "w-16 h-16 border-4",
    xl: "w-20 h-20 border-4",
  };

  const dotSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-10 h-10",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const containerClass = fullScreen
    ? "min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50"
    : "flex items-center justify-center";

  const contentClass = overlay
    ? "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
    : "";

  return (
    <div className={`${containerClass} ${contentClass} ${className}`}>
      <div className="text-center">
        <div className="relative">
          {/* Outer spinning ring */}
          <div
            className={`${sizeClasses[size]} border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4`}
          ></div>
          {/* Inner gradient circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`${dotSizes[size]} bg-gradient-to-r from-pink-500 to-red-600 rounded-full animate-pulse`}
            ></div>
          </div>
        </div>
        <div className={`${textSizes[size]} font-medium text-gray-700`}>
          {text}
        </div>
        {subText && <div className="text-sm text-gray-500 mt-2">{subText}</div>}
      </div>
    </div>
  );
};

export default Loading;
