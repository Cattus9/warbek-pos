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
import type { KpiDashboard } from "@/lib/query-penjualan";
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

export function StatCards({ kpi }: { kpi: KpiDashboard }) {
  const { omzet, omzetKemarin, transaksi, transaksiKemarin, porsi, porsiKemarin } =
    kpi;
  const rataHariIni = transaksi > 0 ? omzet / transaksi : 0;
  const rataKemarin =
    transaksiKemarin > 0 ? omzetKemarin / transaksiKemarin : 0;

  const kpis: Kpi[] = [
    {
      judul: "Omzet Hari Ini",
      nilai: formatRupiah(omzet),
      delta: formatDelta(omzet, omzetKemarin),
      naik: omzet >= omzetKemarin,
      sub: `vs kemarin ${formatRupiah(omzetKemarin)}`,
      icon: <Banknote aria-hidden />,
    },
    {
      judul: "Transaksi",
      nilai: transaksi.toLocaleString("id-ID"),
      delta: formatDelta(transaksi, transaksiKemarin),
      naik: transaksi >= transaksiKemarin,
      sub: `vs kemarin ${transaksiKemarin.toLocaleString("id-ID")} transaksi`,
      icon: <ReceiptText aria-hidden />,
    },
    {
      judul: "Rata-rata per Transaksi",
      nilai: formatRupiah(Math.round(rataHariIni)),
      delta: formatDelta(rataHariIni, rataKemarin),
      naik: rataHariIni >= rataKemarin,
      sub: `vs kemarin ${formatRupiah(Math.round(rataKemarin))}`,
      icon: <Coins aria-hidden />,
    },
    {
      judul: "Porsi Terjual",
      nilai: porsi.toLocaleString("id-ID"),
      delta: formatDelta(porsi, porsiKemarin),
      naik: porsi >= porsiKemarin,
      sub: `vs kemarin ${porsiKemarin.toLocaleString("id-ID")} porsi`,
      icon: <Drumstick aria-hidden />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi, index) => (
        <Card key={kpi.judul} className={cn(index === 0 && "ring-primary/35")}>
          <CardHeader>
            <CardTitle className="font-sans text-sm font-normal text-muted-foreground">
              {kpi.judul}
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
                {kpi.icon}
              </span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-semibold tracking-tight tabular-nums">
              {kpi.nilai}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
              <Badge
                variant={kpi.naik ? undefined : "destructive"}
                className={cn(
                  kpi.naik && "bg-positive/10 text-positive",
                  "[&_svg]:size-3"
                )}
              >
                {kpi.naik ? (
                  <TrendingUp aria-hidden />
                ) : (
                  <TrendingDown aria-hidden />
                )}
                {kpi.delta}
              </Badge>
              <span className="text-xs text-muted-foreground">{kpi.sub}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
