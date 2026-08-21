"use client";

import { useMemo, useState } from "react";
import { GlassWater, Salad, Search, UtensilsCrossed } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { labelKategori, type Kategori, type MenuItem } from "@/lib/data-menu";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";

type FilterKategori = Kategori | "semua";

export function MenuPanel({
  daftarMenu,
  onPilih,
}: {
  daftarMenu: MenuItem[];
  onPilih: (menu: MenuItem) => void;
}) {
  const [kategori, setKategori] = useState<FilterKategori>("semua");
  const [kataKunci, setKataKunci] = useState("");

  const menuTampil = useMemo(() => {
    const kueri = kataKunci.trim().toLowerCase();
    return daftarMenu.filter((item) => {
      const cocokKategori = kategori === "semua" || item.kategori === kategori;
      const cocokKueri =
        kueri === "" || item.nama.toLowerCase().includes(kueri);
      return cocokKategori && cocokKueri;
    });
  }, [daftarMenu, kategori, kataKunci]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pilih Menu</CardTitle>
        <CardDescription>
          {menuTampil.length} dari {daftarMenu.length} menu ditampilkan
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={kataKunci}
            onChange={(e) => setKataKunci(e.target.value)}
            placeholder="Cari menu, mis. bebek goreng"
            aria-label="Cari menu"
            className="pl-8"
          />
        </div>

        <Tabs
          value={kategori}
          onValueChange={(v) => setKategori(v as FilterKategori)}
          className="gap-0"
        >
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="semua">Semua</TabsTrigger>
            <TabsTrigger value="makanan">
              <UtensilsCrossed aria-hidden />
              Makanan
            </TabsTrigger>
            <TabsTrigger value="pendamping">
              <Salad aria-hidden />
              Pendamping
            </TabsTrigger>
            <TabsTrigger value="minuman">
              <GlassWater aria-hidden />
              Minuman
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {menuTampil.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-4 py-10 text-center">
            <Search className="size-6 text-muted-foreground" aria-hidden />
            {daftarMenu.length === 0 ? (
              <>
                <p className="text-sm font-medium">Belum ada menu tersedia</p>
                <p className="text-xs text-muted-foreground">
                  Pastikan skema dan seed data Supabase sudah dijalankan.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Tidak ada menu yang cocok dengan pencarian.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setKataKunci("")}
                >
                  Hapus pencarian
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4">
            {menuTampil.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onPilih(item)}
                className={cn(
                  "group flex flex-col items-start gap-1 rounded-lg border bg-card p-3 text-left transition-colors",
                  "hover:border-primary/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:translate-y-px"
                )}
              >
                <span className="line-clamp-2 min-h-10 text-sm font-medium leading-5">
                  {item.nama}
                </span>
                <span className="line-clamp-1 text-xs text-muted-foreground">
                  {item.keterangan ?? labelKategori[item.kategori]}
                </span>
                <span className="mt-auto pt-1 font-mono text-sm font-semibold tabular-nums">
                  {formatRupiah(item.harga)}
                </span>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
