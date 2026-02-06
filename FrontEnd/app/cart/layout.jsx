import FooterPage from "@/components/Footer/footer";
import Header from "@/components/Header/header";

export const metadata = {
  title: "فروشگاه آنلاین",
  description: "فروشگاه اینترنتی با قابلیت های پیشرفته",
};

export default function CartLayout({ children }) {
  return (
    <div>
      <Header />
      {children}
      <FooterPage />
    </div>
  );
}
