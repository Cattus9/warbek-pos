import { cookies } from "next/headers";
import { AppHeader } from "@/components/app-header";
import { KasirWorkspace } from "@/components/kasir/kasir-workspace";
import type { MenuItem } from "@/lib/data-menu";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Warbek POS - Kasir",
};

export default async function KasirPage() {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from("menu")
    .select("id, nama, harga, kategori, keterangan, tersedia")
    .eq("tersedia", true)
    .order("kategori")
    .order("nama");

  if (error) throw new Error(error.message);

  const daftarMenu: MenuItem[] = (data ?? []).map((baris) => ({
    id: baris.id as string,
    nama: baris.nama as string,
    harga: Number(baris.harga),
    kategori: baris.kategori as MenuItem["kategori"],
    keterangan: baris.keterangan ?? undefined,
    tersedia: baris.tersedia as boolean,
  }));

  return (
    <>
      <AppHeader aktif="kasir" />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-heading text-xl font-semibold tracking-tight">
              Kasir
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pilih menu, atur jumlah, lalu proses pembayaran pelanggan.
            </p>
          </div>
        </div>
        <KasirWorkspace daftarMenu={daftarMenu} />
      </main>
    </>
  );
}
