import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { Transaksi } from "@/lib/data-penjualan";
import { awalHariWIB, formatJamWIB, labelHariPendek, tanggalWIB } from "@/lib/waktu";

export interface KpiDashboard {
  omzet: number;
  omzetKemarin: number;
  transaksi: number;
  transaksiKemarin: number;
  porsi: number;
  porsiKemarin: number;
}

export interface DataDashboard {
  kpi: KpiDashboard;
  penjualanPerJam: { jam: string; omzet: number }[];
  penjualanMingguan: { hari: string; omzet: number }[];
  menuFavorit: { nama: string; porsi: number; omzet: number }[];
  transaksiTerbaru: Transaksi[];
}

const JAM_BUKA = 9;
const JAM_TUTUP = 21;

const formatJam = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  hourCycle: "h23",
  timeZone: "Asia/Jakarta",
});

export function kunciTanggal(mundurHari: number): string {
  const { tahun, bulan, tanggal } = tanggalWIB(awalHariWIB(mundurHari));
  return `${tahun}-${String(bulan).padStart(2, "0")}-${String(tanggal).padStart(2, "0")}`;
}

export async function ambilDataDashboard(): Promise<DataDashboard> {
  const supabase = createClient(await cookies());
  const mulaiHariIni = awalHariWIB().toISOString();

  const [rekap, transaksiHariIni, itemHariIni, terbaru] = await Promise.all([
    supabase
      .from("rekap_harian")
      .select("tanggal, omzet, jumlah_transaksi, jumlah_porsi")
      .order("tanggal", { ascending: false })
      .limit(7),
    supabase
      .from("transaksi")
      .select("waktu, total")
      .eq("status", "sukses")
      .gte("waktu", mulaiHariIni),
    supabase
      .from("transaksi_item")
      .select("nama_menu, harga, qty, transaksi!inner(status, waktu)")
      .eq("transaksi.status", "sukses")
      .gte("transaksi.waktu", mulaiHariIni),
    supabase
      .from("transaksi")
      .select("nomor, waktu, metode, total, transaksi_item(nama_menu, qty)")
      .eq("status", "sukses")
      .order("waktu", { ascending: false })
      .limit(6),
  ]);

  for (const hasil of [rekap, transaksiHariIni, itemHariIni, terbaru]) {
    if (hasil.error) throw new Error(hasil.error.message);
  }

  const dataRekap = rekap.data ?? [];
  const dataTransaksiHariIni = transaksiHariIni.data ?? [];
  const dataItemHariIni = itemHariIni.data ?? [];
  const dataTerbaru = terbaru.data ?? [];

  const rekapPerTanggal = new Map(
    dataRekap.map((baris) => [baris.tanggal as string, baris])
  );
  const hariIni = rekapPerTanggal.get(kunciTanggal(0));
  const kemarin = rekapPerTanggal.get(kunciTanggal(1));

  const kpi: KpiDashboard = {
    omzet: Number(hariIni?.omzet ?? 0),
    omzetKemarin: Number(kemarin?.omzet ?? 0),
    transaksi: Number(hariIni?.jumlah_transaksi ?? 0),
    transaksiKemarin: Number(kemarin?.jumlah_transaksi ?? 0),
    porsi: Number(hariIni?.jumlah_porsi ?? 0),
    porsiKemarin: Number(kemarin?.jumlah_porsi ?? 0),
  };

  const omzetPerJam = new Map<string, number>();
  for (const baris of dataTransaksiHariIni) {
    const kunci = `${formatJam.format(new Date(baris.waktu as string))}:00`;
    omzetPerJam.set(kunci, (omzetPerJam.get(kunci) ?? 0) + Number(baris.total));
  }
  const penjualanPerJam = Array.from(
    { length: JAM_TUTUP - JAM_BUKA + 1 },
    (_, i) => {
      const jam = `${String(JAM_BUKA + i).padStart(2, "0")}:00`;
      return { jam, omzet: omzetPerJam.get(jam) ?? 0 };
    }
  );

  const penjualanMingguan = Array.from({ length: 7 }, (_, i) => {
    const mundur = 6 - i;
    const baris = rekapPerTanggal.get(kunciTanggal(mundur));
    return {
      hari: labelHariPendek(awalHariWIB(mundur).toISOString()),
      omzet: Number(baris?.omzet ?? 0),
    };
  });

  const favoritAgregat = new Map<string, { porsi: number; omzet: number }>();
  for (const baris of dataItemHariIni) {
    const nama = baris.nama_menu as string;
    const porsi = Number(baris.qty);
    const omzet = Number(baris.harga) * porsi;
    const lama = favoritAgregat.get(nama) ?? { porsi: 0, omzet: 0 };
    favoritAgregat.set(nama, {
      porsi: lama.porsi + porsi,
      omzet: lama.omzet + omzet,
    });
  }
  const menuFavorit = [...favoritAgregat.entries()]
    .map(([nama, nilai]) => ({ nama, ...nilai }))
    .sort(
      (a, b) => b.porsi - a.porsi || b.omzet - a.omzet
    )
    .slice(0, 5);

  const transaksiTerbaru: Transaksi[] = dataTerbaru.map((baris) => {
    const items = (baris.transaksi_item ?? []) as {
      nama_menu: string;
      qty: number;
    }[];
    return {
      id: baris.nomor as string,
      nomor: baris.nomor as string,
      item: items
        .map((i) => (i.qty > 1 ? `${i.nama_menu} x${i.qty}` : i.nama_menu))
        .join(", "),
      qty: items.reduce((t, i) => t + i.qty, 0),
      metode: baris.metode as Transaksi["metode"],
      total: Number(baris.total),
      waktu: formatJamWIB(baris.waktu as string),
    };
  });

  return {
    kpi,
    penjualanPerJam,
    penjualanMingguan,
    menuFavorit,
    transaksiTerbaru,
  };
}
