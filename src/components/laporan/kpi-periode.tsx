import {
  Banknote,
  Coins,
  Drumstick,
  ReceiptText,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { LaporanPeriode } from "@/lib/data-penjualan";
import { formatDelta, formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Kpi {
  judul: string;
  nilai: string;
  delta: string;
  naik: boolean;
  sub: string;
  icon: React.ReactNode;
}

export function KpiPeriode({ laporan }: { laporan: LaporanPeriode }) {
  const { kpi, tren } = laporan;
  const omzet = tren.reduce((t, d) => t + d.omzet, 0);
  const rataSekarang = omzet / kpi.transaksi;
  const rataSebelumnya = kpi.omzetSebelumnya / kpi.transaksiSebelumnya;

  const kpis: Kpi[] = [
    {
      judul: "Omzet",
      nilai: formatRupiah(omzet),
      delta: formatDelta(omzet, kpi.omzetSebelumnya),
      naik: omzet >= kpi.omzetSebelumnya,
      sub: `vs periode sebelumnya ${formatRupiah(kpi.omzetSebelumnya)}`,
      icon: <Banknote aria-hidden />,
    },
    {
      judul: "Transaksi",
      nilai: kpi.transaksi.toLocaleString("id-ID"),
      delta: formatDelta(kpi.transaksi, kpi.transaksiSebelumnya),
      naik: kpi.transaksi >= kpi.transaksiSebelumnya,
      sub: `vs periode sebelumnya ${kpi.transaksiSebelumnya.toLocaleString(
        "id-ID"
      )} transaksi`,
      icon: <ReceiptText aria-hidden />,
    },
    {
      judul: "Rata-rata per Transaksi",
      nilai: formatRupiah(Math.round(rataSekarang)),
      delta: formatDelta(rataSekarang, rataSebelumnya),
      naik: rataSekarang >= rataSebelumnya,
      sub: `vs periode sebelumnya ${formatRupiah(Math.round(rataSebelumnya))}`,
      icon: <Coins aria-hidden />,
    },
    {
      judul: "Porsi Terjual",
      nilai: kpi.porsi.toLocaleString("id-ID"),
      delta: formatDelta(kpi.porsi, kpi.porsiSebelumnya),
      naik: kpi.porsi >= kpi.porsiSebelumnya,
      sub: `vs periode sebelumnya ${kpi.porsiSebelumnya.toLocaleString(
        "id-ID"
      )} porsi`,
      icon: <Drumstick aria-hidden />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpiItem, index) => (
        <Card
          key={kpiItem.judul}
          className={cn(index === 0 && "ring-primary/35")}
        >
          <CardHeader>
            <CardTitle className="font-sans text-sm font-normal text-muted-foreground">
              {kpiItem.judul}
            </CardTitle>
            <CardAction>
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-md",
                  index === 0
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {kpiItem.icon}
              </span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-semibold tracking-tight tabular-nums">
              {kpiItem.nilai}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
              <Badge
                variant={kpiItem.naik ? undefined : "destructive"}
                className={cn(
                  kpiItem.naik && "bg-positive/10 text-positive",
                  "[&_svg]:size-3"
                )}
              >
                {kpiItem.naik ? (
                  <TrendingUp aria-hidden />
                ) : (
                  <TrendingDown aria-hidden />
                )}
                {kpiItem.delta}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {kpiItem.sub}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
