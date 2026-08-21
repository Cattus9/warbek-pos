import { AppHeader } from "@/components/app-header";
import { LaporanWorkspace } from "@/components/laporan/laporan-workspace";
import { ambilDataLaporan } from "@/lib/query-laporan";

export const metadata = {
  title: "Warbek POS - Laporan",
};

export default async function LaporanPage() {
  const laporan = await ambilDataLaporan();

  return (
    <>
      <AppHeader aktif="laporan" />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-heading text-xl font-semibold tracking-tight">
              Laporan Penjualan
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Rekap omzet, metode pembayaran, dan menu terlaris per periode.
            </p>
          </div>
        </div>
        <LaporanWorkspace laporan={laporan} />
      </main>
    </>
  );
}
