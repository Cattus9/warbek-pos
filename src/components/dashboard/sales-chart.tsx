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
  CardAction,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export function SalesChart({
  penjualanPerJam,
  penjualanMingguan,
  className,
}: {
  penjualanPerJam: { jam: string; omzet: number }[];
  penjualanMingguan: { hari: string; omzet: number }[];
  className?: string;
}) {
  const puncakHariIni = penjualanPerJam.reduce((a, b) =>
    b.omzet > a.omzet ? b : a
  );
  const puncakMingguan = penjualanMingguan.reduce((a, b) =>
    b.omzet > a.omzet ? b : a
  );

  return (
    <Card className={className}>
      <Tabs defaultValue="hari-ini" className="flex-col gap-0">
        <CardHeader>
          <CardTitle>Penjualan</CardTitle>
          <CardDescription>
            Omzet kotor sebelum potongan dan biaya layanan
          </CardDescription>
          <CardAction>
            <TabsList>
              <TabsTrigger value="hari-ini">Hari ini</TabsTrigger>
              <TabsTrigger value="7-hari">7 hari</TabsTrigger>
            </TabsList>
          </CardAction>
        </CardHeader>

        <TabsContent value="hari-ini" className="mt-0">
          <div className="px-(--card-spacing)">
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-60 w-full sm:h-64"
            >
              <AreaChart data={penjualanPerJam} margin={{ top: 8, right: 8 }}>
                <defs>
                  <linearGradient id="fillOmzet" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="jam"
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
                          label={String(item?.payload?.jam ?? "")}
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
                  fill="url(#fillOmzet)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ChartContainer>
            <p className="flex flex-wrap items-center justify-between gap-2 pb-1 text-xs text-muted-foreground">
              <span>
                Puncak pukul {puncakHariIni.jam} ({formatRupiahCompact(puncakHariIni.omzet)})
              </span>
              <span>Buka 09:00 s.d. 22:00 WIB</span>
            </p>
          </div>
        </TabsContent>

        <TabsContent value="7-hari" className="mt-0">
          <div className="px-(--card-spacing)">
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-60 w-full sm:h-64"
            >
              <BarChart data={penjualanMingguan} margin={{ top: 8, right: 8 }}>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="hari"
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
                          label={String(
                            namaHariPenuh[String(item?.payload?.hari)] ??
                              item?.payload?.hari
                          )}
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
            </ChartContainer>
            <p className="flex flex-wrap items-center justify-between gap-2 pb-1 text-xs text-muted-foreground">
              <span>
                Tertinggi hari {namaHariPenuh[puncakMingguan.hari]} (
                {formatRupiahCompact(puncakMingguan.omzet)})
              </span>
              <span>Total 7 hari {formatRupiahCompact(penjualanMingguan.reduce((t, d) => t + d.omzet, 0))}</span>
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
