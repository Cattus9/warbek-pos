"use client";

import { Pie, PieChart, Cell } from "recharts";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  labelPeriode,
  type LaporanPeriode,
  type PeriodeLaporan,
} from "@/lib/data-penjualan";
import { formatRupiah, formatRupiahCompact } from "@/lib/format";

const chartConfig = {
  QRIS: { label: "QRIS", color: "var(--chart-1)" },
  Tunai: { label: "Tunai", color: "var(--chart-2)" },
  Debit: { label: "Debit", color: "var(--chart-3)" },
} satisfies ChartConfig;

const persen = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 1,
});

function TooltipRupiah({
  value,
  color,
  label,
}: {
  value: number;
  color?: string;
  label: string;
}) {
  return (
    <>
      <span
        className="size-2.5 shrink-0 rounded-[2px]"
        style={{ backgroundColor: color }}
      />
      <span className="flex-1 text-muted-foreground">{label}</span>
      <span className="font-mono font-medium tabular-nums">
        {formatRupiah(value)}
      </span>
    </>
  );
}

export function MetodePembayaranChart({
  periode,
  laporan,
  className,
}: {
  periode: PeriodeLaporan;
  laporan: LaporanPeriode;
  className?: string;
}) {
  const perMetode = laporan.perMetode;
  const totalOmzet = perMetode.reduce((t, m) => t + m.omzet, 0);
  const totalTransaksi = perMetode.reduce((t, m) => t + m.transaksi, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Metode Pembayaran</CardTitle>
        <CardDescription>
          Komposisi omzet {labelPeriode[periode].toLowerCase()} per metode
        </CardDescription>
      </CardHeader>
      <div className="px-(--card-spacing)">
        <div className="relative">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-auto h-52 w-full"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    indicator="dot"
                    nameKey="metode"
                    formatter={(value, name, item) => (
                      <TooltipRupiah
                        value={Number(value)}
                        color={item?.payload?.fill}
                        label={String(name)}
                      />
                    )}
                  />
                }
              />
              <Pie
                data={perMetode}
                dataKey="omzet"
                nameKey="metode"
                innerRadius={56}
                outerRadius={80}
                paddingAngle={3}
                strokeWidth={0}
              >
                {perMetode.map((m) => (
                  <Cell key={m.metode} fill={`var(--color-${m.metode})`} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="font-mono text-lg font-semibold tabular-nums">
              {formatRupiahCompact(totalOmzet)}
            </span>
          </div>
        </div>

        <div className="mb-2 mt-1 flex h-2 overflow-hidden rounded-full">
          {perMetode.map((m) => (
            <span
              key={m.metode}
              className="h-full"
              style={{
                width: `${(m.omzet / totalOmzet) * 100}%`,
                backgroundColor: `var(--color-${m.metode})`,
              }}
            />
          ))}
        </div>

        <ul className="flex flex-col gap-2 pb-1">
          {perMetode.map((m) => (
            <li key={m.metode} className="flex items-center gap-2.5 text-sm">
              <span
                className="size-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: `var(--color-${m.metode})` }}
                aria-hidden
              />
              <span className="w-16 font-medium">{m.metode}</span>
              <span className="text-xs text-muted-foreground">
                {m.transaksi.toLocaleString("id-ID")} transaksi
              </span>
              <span className="ml-auto font-mono font-medium tabular-nums">
                {formatRupiahCompact(m.omzet)}
              </span>
              <span className="w-12 text-right text-xs text-muted-foreground tabular-nums">
                {persen.format((m.omzet / totalOmzet) * 100)}%
              </span>
            </li>
          ))}
        </ul>

        <p className="flex items-center justify-between gap-2 border-t pt-2 pb-1 text-xs text-muted-foreground">
          <span>{totalTransaksi.toLocaleString("id-ID")} transaksi</span>
          <span>Data contoh tampilan</span>
        </p>
      </div>
    </Card>
  );
}
