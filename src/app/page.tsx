import { AppHeader } from "@/components/app-header";
import { MenuFavorit } from "@/components/dashboard/menu-favorit";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { StatCards } from "@/components/dashboard/stat-cards";
import { TransaksiTerbaru } from "@/components/dashboard/transaksi-terbaru";
import { ambilDataDashboard } from "@/lib/query-penjualan";

export const metadata = {
  title: "Warbek POS - Dashboard",
};

export default async function DashboardPage() {
  const data = await ambilDataDashboard();

  return (
    <>
      <AppHeader aktif="dashboard" />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-heading text-xl font-semibold tracking-tight">
              Ringkasan Penjualan
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Data penjualan hari ini, diperbarui langsung dari kasir.
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <StatCards kpi={data.kpi} />

        {/* Charts Row */}
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <SalesChart
            penjualanPerJam={data.penjualanPerJam}
            penjualanMingguan={data.penjualanMingguan}
            className="xl:col-span-2"
          />
          <MenuFavorit menuFavorit={data.menuFavorit} />
        </div>

        {/* Recent Transactions */}
        <TransaksiTerbaru
          transaksi={data.transaksiTerbaru}
          totalTransaksiHariIni={data.kpi.transaksi}
          className="mt-4"
        />
      </main>
    </>
  );
}
