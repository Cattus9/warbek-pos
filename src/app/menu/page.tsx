import { cookies } from "next/headers";
import { AppHeader } from "@/components/app-header";
import { MenuKatalog } from "@/components/menu/menu-katalog";
import type { MenuItem } from "@/lib/data-menu";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Warbek POS - Menu",
};

export default async function MenuPage() {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from("menu")
    .select("id, nama, harga, kategori, keterangan, tersedia")
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
      <AppHeader aktif="menu" />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-heading text-xl font-semibold tracking-tight">
              Menu Warbek
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Daftar lengkap makanan, pendamping, dan minuman beserta harganya.
            </p>
          </div>
        </div>
        <MenuKatalog daftarMenu={daftarMenu} />
      </main>
    </>
  );
}
