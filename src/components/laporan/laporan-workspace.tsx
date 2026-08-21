"use client";

import { useState } from "react";
import { KpiPeriode } from "@/components/laporan/kpi-periode";
import { MenuTerlaris } from "@/components/laporan/menu-terlaris";
import { MetodePembayaranChart } from "@/components/laporan/metode-pembayaran-chart";
import { SorotanPeriode } from "@/components/laporan/sorotan-periode";
import { TrenPenjualanChart } from "@/components/laporan/tren-penjualan-chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PeriodeLaporan } from "@/lib/data-penjualan";
import type { DataLaporan } from "@/lib/query-laporan";

export function LaporanWorkspace({ laporan }: { laporan: DataLaporan }) {
  const [periode, setPeriode] = useState<PeriodeLaporan>("7-hari");
  const dataPeriode = laporan[periode];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Tabs
          value={periode}
          onValueChange={(v) => setPeriode(v as PeriodeLaporan)}
          className="gap-0"
        >
          <TabsList>
            <TabsTrigger value="7-hari">7 Hari</TabsTrigger>
            <TabsTrigger value="30-hari">30 Hari</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <KpiPeriode laporan={dataPeriode} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <TrenPenjualanChart
          periode={periode}
          laporan={dataPeriode}
          className="xl:col-span-2"
        />
        <MetodePembayaranChart periode={periode} laporan={dataPeriode} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <MenuTerlaris
          periode={periode}
          laporan={dataPeriode}
          className="xl:col-span-2"
        />
        <SorotanPeriode periode={periode} laporan={dataPeriode} />
      </div>
    </div>
  );
}
