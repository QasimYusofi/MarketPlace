// app/layout.js
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-vazirmatn",
});

export const metadata = {
  title: "فروشگاه آنلاین",
  description: "فروشگاه اینترنتی با قابلیت های پیشرفته",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="font-vazirmatn">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
