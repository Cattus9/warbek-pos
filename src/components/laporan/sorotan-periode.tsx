import { CalendarCheck2, Coins, Flame, Wallet } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  labelPeriode,
  type LaporanPeriode,
  type PeriodeLaporan,
} from "@/lib/data-penjualan";
import { formatRupiah } from "@/lib/format";

const persen = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });

export function SorotanPeriode({
  periode,
  laporan,
  className,
}: {
  periode: PeriodeLaporan;
  laporan: LaporanPeriode;
  className?: string;
}) {
  const { kpi, tren, perMetode, menuTerlaris } = laporan;
  const totalOmzet = tren.reduce((t, d) => t + d.omzet, 0);
  const puncak = tren.reduce((a, b) => (b.omzet > a.omzet ? b : a));
  const metodeUtama = perMetode.reduce((a, b) => (b.omzet > a.omzet ? b : a));
  const totalOmzetMetode = perMetode.reduce((t, m) => t + m.omzet, 0);
  const menuUtama = menuTerlaris[0] ?? { nama: "—", porsi: 0, omzet: 0 };

  const sorotan = [
    {
      judul: "Puncak penjualan",
      nilai: puncak.label,
      sub: formatRupiah(puncak.omzet),
      icon: <CalendarCheck2 className="size-4" aria-hidden />,
    },
    {
      judul: "Metode utama",
      nilai: `${metodeUtama.metode} (${persen.format(
        (metodeUtama.omzet / totalOmzetMetode) * 100
      )}%)`,
      sub: `${metodeUtama.transaksi.toLocaleString("id-ID")} transaksi`,
      icon: <Wallet className="size-4" aria-hidden />,
    },
    {
      judul: "Menu terlaris",
      nilai: menuUtama.nama,
      sub: `${menuUtama.porsi.toLocaleString("id-ID")} porsi • ${formatRupiah(
        menuUtama.omzet
      )}`,
      icon: <Flame className="size-4" aria-hidden />,
    },
    {
      judul: "Rata-rata per transaksi",
      nilai: formatRupiah(Math.round(totalOmzet / kpi.transaksi)),
      sub: `${kpi.transaksi.toLocaleString("id-ID")} transaksi`,
      icon: <Coins className="size-4" aria-hidden />,
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Sorotan Periode</CardTitle>
        <CardDescription>
          Ringkasan cepat {labelPeriode[periode].toLowerCase()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col divide-y">
          {sorotan.map((item) => (
            <li key={item.judul} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {item.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">
                  {item.judul}
                </span>
                <span className="block truncate font-medium">{item.nilai}</span>
                <span className="block text-xs text-muted-foreground">
                  {item.sub}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
