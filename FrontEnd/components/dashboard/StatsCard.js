// components/dashboard/StatsCard.js
export default function StatsCard({
  title,
  value,
  icon,
  color,
  textColor,
  bgColor,
  href,
}) {
  return (
    <a href={href} className="block group">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-200 transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 ${bgColor} rounded-lg`}>
            <div className={textColor}>{icon}</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm text-blue-600 group-hover:text-blue-700">
            <span>مشاهده جزئیات</span>
            <svg
              className="w-4 h-4 mr-1 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </div>
        </div>
      </div>
    </a>
  );
}
