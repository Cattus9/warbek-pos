"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  GlassWater,
  Plus,
  Salad,
  Search,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { tambahMenu } from "@/app/menu/actions";
import { TambahMenuDialog } from "@/components/menu/tambah-menu-dialog";
import { labelKategori, type Kategori, type MenuItem } from "@/lib/data-menu";
import { formatRupiah, formatRupiahCompact } from "@/lib/format";

type FilterKategori = Kategori | "semua";
type Urutan = "standar" | "harga-naik" | "harga-turun";

const urutanKategori: Kategori[] = ["makanan", "pendamping", "minuman"];

const ikonKategori: Record<Kategori, LucideIcon> = {
  makanan: UtensilsCrossed,
  pendamping: Salad,
  minuman: GlassWater,
};

function urutkanMenu(items: MenuItem[], urutan: Urutan) {
  if (urutan === "standar") return items;
  return [...items].sort((a, b) =>
    urutan === "harga-naik" ? a.harga - b.harga : b.harga - a.harga
  );
}

function KatalogGrup({
  kategori,
  items,
  tampilKategori,
}: {
  kategori: Kategori;
  items: MenuItem[];
  tampilKategori: boolean;
}) {
  const Ikon = ikonKategori[kategori];

  return (
    <section aria-label={labelKategori[kategori]} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Ikon className="size-3.5" aria-hidden />
        </span>
        <h2 className="font-heading text-sm font-semibold tracking-tight">
          {labelKategori[kategori]}
        </h2>
        <Badge variant="secondary">{items.length} menu</Badge>
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <Table className="min-w-140 table-fixed">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Menu</TableHead>
              <TableHead className="w-56">Keterangan</TableHead>
              {tampilKategori ? <TableHead className="w-28">Kategori</TableHead> : null}
              <TableHead className="w-28 text-right">Harga</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="pr-4 font-medium whitespace-normal">
                  <span className="flex flex-wrap items-center gap-2">
                    {item.nama}
                    {item.tersedia === false ? (
                      <Badge variant="outline">Nonaktif</Badge>
                    ) : null}
                  </span>
                </TableCell>
                <TableCell className="truncate text-muted-foreground">
                  {item.keterangan ?? "—"}
                </TableCell>
                {tampilKategori ? (
                  <TableCell>
                    <Badge variant="outline">{labelKategori[item.kategori]}</Badge>
                  </TableCell>
                ) : null}
                <TableCell className="text-right font-mono font-medium tabular-nums">
                  {formatRupiah(item.harga)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

export function MenuKatalog({ daftarMenu }: { daftarMenu: MenuItem[] }) {
  const [kategori, setKategori] = useState<FilterKategori>("semua");
  const [kataKunci, setKataKunci] = useState("");
  const [urutan, setUrutan] = useState<Urutan>("standar");
  const [dialogTerbuka, setDialogTerbuka] = useState(false);

  const grupTampil = useMemo(() => {
    const kueri = kataKunci.trim().toLowerCase();
    const cocokPencarian = (item: MenuItem) =>
      kueri === "" || item.nama.toLowerCase().includes(kueri);
    const daftarKategori = kategori === "semua" ? urutanKategori : [kategori];
    return daftarKategori
      .map((kat) => ({
        kategori: kat,
        items: urutkanMenu(
          daftarMenu.filter(
            (item) => item.kategori === kat && cocokPencarian(item)
          ),
          urutan
        ),
      }))
      .filter((grup) => grup.items.length > 0);
  }, [daftarMenu, kategori, kataKunci, urutan]);

  const jumlahTampil = grupTampil.reduce((t, grup) => t + grup.items.length, 0);

  const ringkasanKategori = useMemo(
    () =>
      urutanKategori.map((kat) => {
        const items = daftarMenu.filter((item) => item.kategori === kat);
        const harga = items.map((item) => item.harga);
        return {
          kategori: kat,
          jumlah: items.length,
          termurah: harga.length > 0 ? Math.min(...harga) : 0,
          termahal: harga.length > 0 ? Math.max(...harga) : 0,
        };
      }),
    [daftarMenu]
  );

  async function simpanMenu(item: MenuItem): Promise<string | null> {
    const hasil = await tambahMenu({
      nama: item.nama,
      harga: item.harga,
      kategori: item.kategori,
      keterangan: item.keterangan,
    });
    if (!hasil.ok) {
      return hasil.error ?? "Gagal menyimpan menu.";
    }
    setKategori(item.kategori);
    setDialogTerbuka(false);
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {ringkasanKategori.map(({ kategori: kat, jumlah, termurah, termahal }) => {
          const Ikon = ikonKategori[kat];
          return (
            <Card key={kat} size="sm">
              <CardContent className="flex items-center gap-3 py-1">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Ikon className="size-4.5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-medium">
                    {labelKategori[kat]}{" "}
                    <span className="text-muted-foreground">({jumlah} menu)</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mulai {formatRupiahCompact(termurah)} –{" "}
                    {formatRupiahCompact(termahal)}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Katalog Menu</CardTitle>
          <CardDescription>
            {jumlahTampil} dari {daftarMenu.length} menu ditampilkan
          </CardDescription>
          <CardAction>
            <Button size="sm" onClick={() => setDialogTerbuka(true)}>
              <Plus data-icon="inline-start" aria-hidden />
              Tambah Menu
            </Button>
          </CardAction>
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

          <div className="flex flex-wrap items-center justify-between gap-3">
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

            <ToggleGroup
              type="single"
              value={urutan}
              onValueChange={(v) => {
                if (v) setUrutan(v as Urutan);
              }}
              variant="outline"
              size="sm"
              spacing={0}
              aria-label="Urutkan menu"
            >
              <ToggleGroupItem value="standar">Standar</ToggleGroupItem>
              <ToggleGroupItem value="harga-naik" title="Harga terendah dulu">
                <ArrowUp data-icon="inline-start" aria-hidden />
                Termurah
              </ToggleGroupItem>
              <ToggleGroupItem value="harga-turun" title="Harga tertinggi dulu">
                <ArrowDown data-icon="inline-start" aria-hidden />
                Termahal
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {grupTampil.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-4 py-10 text-center">
              <Search className="size-6 text-muted-foreground" aria-hidden />
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
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {grupTampil.map((grup) => (
                <KatalogGrup
                  key={grup.kategori}
                  kategori={grup.kategori}
                  items={grup.items}
                  tampilKategori={kategori === "semua"}
                />
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-between gap-2 text-xs text-muted-foreground">
          <span>
            {ringkasanKategori
              .map((r) => `${r.jumlah} ${labelKategori[r.kategori].toLowerCase()}`)
              .join(" • ")}
          </span>
          <span>Harga dapat berubah sewaktu-waktu</span>
        </CardFooter>
      </Card>

      <TambahMenuDialog
        open={dialogTerbuka}
        onOpenChange={setDialogTerbuka}
        onSimpan={simpanMenu}
      />
    </div>
  );
}
