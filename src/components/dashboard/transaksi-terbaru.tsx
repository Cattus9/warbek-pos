import { ChevronRight } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Transaksi } from "@/lib/data-penjualan";
import { formatRupiah } from "@/lib/format";

export function TransaksiTerbaru({
  transaksi,
  totalTransaksiHariIni,
  className,
}: {
  transaksi: Transaksi[];
  totalTransaksiHariIni: number;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Transaksi Terbaru</CardTitle>
        <CardDescription>
          Pesanan terakhir dari kasir, diurutkan dari yang paling baru
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm">
            Lihat semua
            <ChevronRight data-icon="inline-end" aria-hidden />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0 sm:px-(--card-spacing)">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-24">No. Order</TableHead>
                <TableHead className="w-16">Waktu</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="w-24">Metode</TableHead>
                <TableHead className="w-28 text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transaksi.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground tabular-nums">
                    {item.nomor}
                  </TableCell>
                  <TableCell className="font-mono text-xs tabular-nums">
                    {item.waktu}
                  </TableCell>
                  <TableCell className="max-w-64 truncate">
                    {item.item}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.metode}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium tabular-nums">
                    {formatRupiah(item.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-2 text-xs text-muted-foreground">
        <span>
          Menampilkan {transaksi.length} dari {totalTransaksiHariIni}{" "}
          transaksi hari ini
        </span>
        <span>Data dari Supabase</span>
      </CardFooter>
    </Card>
  );
}
