"use client";

import {
  Banknote,
  CircleCheck,
  CreditCard,
  LoaderCircle,
  Minus,
  Plus,
  Printer,
  QrCode,
  Receipt,
  RotateCcw,
  Trash2,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { MenuItem } from "@/lib/data-menu";
import { formatRupiah } from "@/lib/format";

export type MetodeBayar = "Tunai" | "QRIS" | "Debit";
export type StatusBayar = "aktif" | "sukses";

export interface KeranjangItem {
  menu: MenuItem;
  qty: number;
}

interface OrderPanelProps {
  keranjang: KeranjangItem[];
  metode: MetodeBayar;
  status: StatusBayar;
  nomorOrder: string | null;
  jumlahItem: number;
  total: number;
  memproses: boolean;
  error: string | null;
  onPilihMetode: (metode: MetodeBayar) => void;
  onUbahJumlah: (menuId: string, delta: number) => void;
  onKosongkan: () => void;
  onBayar: () => void;
  onTransaksiBaru: () => void;
}

const metodeOptions: { value: MetodeBayar; icon: React.ReactNode }[] = [
  { value: "Tunai", icon: <Banknote data-icon="inline-start" aria-hidden /> },
  { value: "QRIS", icon: <QrCode data-icon="inline-start" aria-hidden /> },
  { value: "Debit", icon: <CreditCard data-icon="inline-start" aria-hidden /> },
];

export function OrderPanel({
  keranjang,
  metode,
  status,
  nomorOrder,
  jumlahItem,
  total,
  memproses,
  error,
  onPilihMetode,
  onUbahJumlah,
  onKosongkan,
  onBayar,
  onTransaksiBaru,
}: OrderPanelProps) {
  if (status === "sukses") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pesanan {nomorOrder ?? "—"}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col items-center gap-3 py-8 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-positive/10 text-positive">
            <CircleCheck className="size-6" aria-hidden />
          </span>
          <p className="font-heading text-base font-semibold">
            Pembayaran berhasil
          </p>
          <p className="text-sm text-muted-foreground">
            {jumlahItem} item dibayar via {metode}
          </p>
          <p className="font-mono text-2xl font-semibold tabular-nums">
            {formatRupiah(total)}
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Button onClick={onTransaksiBaru}>
              <RotateCcw data-icon="inline-start" aria-hidden />
              Transaksi Baru
            </Button>
            <Button variant="outline">
              <Printer data-icon="inline-start" aria-hidden />
              Cetak Struk
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const kosong = keranjang.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pesanan</CardTitle>
        <CardDescription>
          Periksa item sebelum pembayaran
        </CardDescription>
        <CardAction className="flex items-center gap-2">
          {nomorOrder ? (
            <Badge variant="secondary" className="font-mono tabular-nums">
              {nomorOrder}
            </Badge>
          ) : null}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onKosongkan}
            disabled={kosong}
            aria-label="Kosongkan pesanan"
            title="Kosongkan pesanan"
          >
            <Trash2 aria-hidden />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        {kosong ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-12 text-center">
            <Receipt className="size-6 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium">Belum ada pesanan</p>
            <p className="text-xs text-muted-foreground">
              Pilih menu di panel sebelah untuk memulai pesanan.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-72 lg:max-h-80">
            <ul className="divide-y divide-border pr-2">
              {keranjang.map((item) => (
                <li key={item.menu.id} className="flex items-center gap-2.5 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {item.menu.nama}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground tabular-nums">
                      {formatRupiah(item.menu.harga)} / porsi
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      onClick={() => onUbahJumlah(item.menu.id, -1)}
                      aria-label={`Kurangi jumlah ${item.menu.nama}`}
                    >
                      <Minus aria-hidden />
                    </Button>
                    <span className="w-7 text-center font-mono text-sm font-medium tabular-nums">
                      {item.qty}
                    </span>
                    <Button
                      variant="outline"
                      size="icon-xs"
                      onClick={() => onUbahJumlah(item.menu.id, 1)}
                      aria-label={`Tambah jumlah ${item.menu.nama}`}
                    >
                      <Plus aria-hidden />
                    </Button>
                  </div>
                  <span className="w-24 shrink-0 text-right font-mono text-sm font-medium tabular-nums">
                    {formatRupiah(item.menu.harga * item.qty)}
                  </span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}

        <div>
          <p className="mb-2 text-sm font-medium">Metode Pembayaran</p>
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={metode}
            onValueChange={(v) => v && onPilihMetode(v as MetodeBayar)}
            className="w-full [&>button]:flex-1 [&>button]:gap-1.5"
          >
            {metodeOptions.map((opt) => (
              <ToggleGroupItem key={opt.value} value={opt.value}>
                {opt.icon}
                {opt.value}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-3">
        <dl className="grid gap-1.5 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Jumlah item</dt>
            <dd className="font-mono tabular-nums">{jumlahItem} item</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Metode pembayaran</dt>
            <dd>{metode}</dd>
          </div>
        </dl>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Total</span>
          <span className="font-mono text-xl font-semibold tabular-nums">
            {formatRupiah(total)}
          </span>
        </div>
        {error ? (
          <p
            role="alert"
            className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            {error}
          </p>
        ) : null}
        <Button
          size="lg"
          className="w-full"
          disabled={kosong || memproses}
          onClick={onBayar}
        >
          {memproses ? (
            <>
              <LoaderCircle
                data-icon="inline-start"
                className="animate-spin"
                aria-hidden
              />
              Memproses pembayaran
            </>
          ) : (
            `Bayar ${formatRupiah(total)}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
