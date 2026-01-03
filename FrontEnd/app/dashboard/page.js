import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardOverview from "@/components/dashboard/sections/DashboardOverview";

export default function Dashboard() {
  return (
    <DashboardLayout section="overview">
      <DashboardOverview />
    </DashboardLayout>
  );
}

export const metadata = {
  title: "داشبورد - فروشگاه",
};
