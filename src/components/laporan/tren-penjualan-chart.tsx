"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
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
  omzet: { label: "Omzet", color: "var(--chart-1)" },
} satisfies ChartConfig;

const namaHariPenuh: Record<string, string> = {
  Sen: "Senin",
  Sel: "Selasa",
  Rab: "Rabu",
  Kam: "Kamis",
  Jum: "Jumat",
  Sab: "Sabtu",
  Min: "Minggu",
};

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

export function TrenPenjualanChart({
  periode,
  laporan,
  className,
}: {
  periode: PeriodeLaporan;
  laporan: LaporanPeriode;
  className?: string;
}) {
  const tren = laporan.tren;
  const puncak = tren.reduce((a, b) => (b.omzet > a.omzet ? b : a));
  const total = tren.reduce((t, d) => t + d.omzet, 0);
  const labelPuncak = namaHariPenuh[puncak.label] ?? puncak.label;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Tren Omzet</CardTitle>
        <CardDescription>
          Omzet harian {labelPeriode[periode].toLowerCase()}, sebelum potongan
          dan biaya layanan
        </CardDescription>
      </CardHeader>
      <div className="px-(--card-spacing)">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-64 w-full sm:h-72"
        >
          {periode === "7-hari" ? (
            <BarChart data={tren} margin={{ top: 8, right: 8 }}>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="var(--border)"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(value) => formatRupiahCompact(value)}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    indicator="dot"
                    formatter={(value, _name, item) => (
                      <TooltipRupiah
                        value={Number(value)}
                        color={item?.color}
                        label={String(item?.payload?.label ?? "")}
                      />
                    )}
                  />
                }
              />
              <Bar
                dataKey="omzet"
                fill="var(--color-omzet)"
                radius={[6, 6, 0, 0]}
                maxBarSize={34}
              />
            </BarChart>
          ) : (
            <AreaChart data={tren} margin={{ top: 8, right: 8 }}>
              <defs>
                <linearGradient id="fillOmzetLaporan" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-omzet)"
                    stopOpacity={0.28}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-omzet)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="var(--border)"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={28}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(value) => formatRupiahCompact(value)}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    indicator="dot"
                    formatter={(value, _name, item) => (
                      <TooltipRupiah
                        value={Number(value)}
                        color={item?.color}
                        label={String(item?.payload?.label ?? "")}
                      />
                    )}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="omzet"
                stroke="var(--color-omzet)"
                strokeWidth={2}
                fill="url(#fillOmzetLaporan)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          )}
        </ChartContainer>
        <p className="flex flex-wrap items-center justify-between gap-2 pb-1 text-xs text-muted-foreground">
          <span>
            Puncak {labelPuncak} ({formatRupiahCompact(puncak.omzet)})
          </span>
          <span>Total {formatRupiahCompact(total)}</span>
        </p>
      </div>
    </Card>
  );
}
