import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Profile from "@/components/dashboard/sections/Profile";
import Stores from "@/components/dashboard/sections/Stores";
import Products from "@/components/dashboard/sections/Products";
import Orders from "@/components/dashboard/sections/Orders";
import Subscriptions from "@/components/dashboard/sections/Subscriptions";
import Wishlist from "@/components/dashboard/sections/Wishlist";
import Cart from "@/components/dashboard/sections/Cart";

const sectionComponents = {
  profile: Profile,
  stores: Stores,
  products: Products,
  orders: Orders,
  subscriptions: Subscriptions,
  wishlist: Wishlist,
  cart: Cart,
};

export default async function DashboardSection({ params }) {
  // Await the params in Next.js 14
  const { section } = await params;
  const SectionComponent = sectionComponents[section] || Profile;

  return (
    <DashboardLayout section={section}>
      <SectionComponent />
    </DashboardLayout>
  );
}

export async function generateMetadata({ params }) {
  // Await the params here too
  const { section } = await params;

  const titles = {
    profile: "پروفایل",
    stores: "فروشگاه من",
    products: "محصولات",
    orders: "سفارشات",
    // subscriptions: "تیک من",
    // wishlist: "علاقه‌مندی",
    // cart: "سبد خرید",
  };

  return {
    title: `${titles[section] || "داشبورد"} - فروشگاه`,
  };
}
