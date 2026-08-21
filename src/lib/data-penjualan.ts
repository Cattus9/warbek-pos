export interface Transaksi {
  id: string;
  nomor: string;
  item: string;
  qty: number;
  metode: MetodeBayar;
  total: number;
  waktu: string;
}

export type PeriodeLaporan = "7-hari" | "30-hari";

export type MetodeBayar = "Tunai" | "QRIS" | "Debit";

export const labelPeriode: Record<PeriodeLaporan, string> = {
  "7-hari": "7 Hari Terakhir",
  "30-hari": "30 Hari Terakhir",
};

export interface PenjualanPerMetode {
  metode: MetodeBayar;
  transaksi: number;
  omzet: number;
}

export interface LaporanPeriode {
  kpi: {
    omzetSebelumnya: number;
    transaksi: number;
    transaksiSebelumnya: number;
    porsi: number;
    porsiSebelumnya: number;
  };
  tren: { label: string; omzet: number }[];
  perMetode: PenjualanPerMetode[];
  menuTerlaris: { nama: string; porsi: number; omzet: number }[];
}
