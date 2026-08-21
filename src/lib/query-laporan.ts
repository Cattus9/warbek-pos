import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { LaporanPeriode, PeriodeLaporan } from "@/lib/data-penjualan";
import { awalHariWIB } from "@/lib/waktu";
import { kunciTanggal } from "@/lib/query-penjualan";

export type DataLaporan = Record<PeriodeLaporan, LaporanPeriode>;

const labelTanggal = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  timeZone: "Asia/Jakarta",
});

const labelHari = new Intl.DateTimeFormat("id-ID", {
  weekday: "short",
  timeZone: "Asia/Jakarta",
});

const METODE_URUT = ["QRIS", "Tunai", "Debit"] as const;

function jumlahJendela(
  rekapPerTanggal: Map<string, { omzet: number; jumlah_transaksi: number; jumlah_porsi: number }>,
  dariMundur: number,
  sampaiMundur: number
) {
  let omzet = 0;
  let transaksi = 0;
  let porsi = 0;
  for (let mundur = dariMundur; mundur >= sampaiMundur; mundur--) {
    const baris = rekapPerTanggal.get(kunciTanggal(mundur));
    if (!baris) continue;
    omzet += Number(baris.omzet);
    transaksi += Number(baris.jumlah_transaksi);
    porsi += Number(baris.jumlah_porsi);
  }
  return { omzet, transaksi, porsi };
}

export async function ambilDataLaporan(): Promise<DataLaporan> {
  const supabase = createClient(await cookies());
  const mulaiJendelaTerluas = awalHariWIB(59).toISOString();

  const [rekap, transaksi, item] = await Promise.all([
    supabase
      .from("rekap_harian")
      .select("tanggal, omzet, jumlah_transaksi, jumlah_porsi")
      .order("tanggal", { ascending: false })
      .limit(60),
    supabase
      .from("transaksi")
      .select("metode, total, waktu")
      .eq("status", "sukses")
      .gte("waktu", mulaiJendelaTerluas),
    supabase
      .from("transaksi_item")
      .select("nama_menu, harga, qty, transaksi!inner(status, waktu)")
      .eq("transaksi.status", "sukses")
      .gte("transaksi.waktu", mulaiJendelaTerluas),
  ]);

  for (const hasil of [rekap, transaksi, item]) {
    if (hasil.error) throw new Error(hasil.error.message);
  }

  const rekapPerTanggal = new Map(
    (rekap.data ?? []).map((baris) => [baris.tanggal as string, baris])
  );

  const jendela = {
    "7-hari": { mulai: awalHariWIB(6), akhir: awalHariWIB(-1) },
    "7-hari-sebelumnya": { mulai: awalHariWIB(13), akhir: awalHariWIB(6) },
    "30-hari": { mulai: awalHariWIB(29), akhir: awalHariWIB(-1) },
    "30-hari-sebelumnya": { mulai: awalHariWIB(59), akhir: awalHariWIB(29) },
  };

  function dalamJendela(waktuIso: string, nama: keyof typeof jendela) {
    const t = new Date(waktuIso).getTime();
    return t >= jendela[nama].mulai.getTime() && t < jendela[nama].akhir.getTime();
  }

  const perMetodeSemua: Record<
    PeriodeLaporan,
    Map<string, { transaksi: number; omzet: number }>
  > = {
    "7-hari": new Map(),
    "30-hari": new Map(),
  };
  for (const baris of transaksi.data ?? []) {
    const waktu = baris.waktu as string;
    const target: PeriodeLaporan[] = [];
    if (dalamJendela(waktu, "7-hari")) target.push("7-hari");
    if (dalamJendela(waktu, "30-hari")) target.push("30-hari");
    for (const periode of target) {
      const agregat =
        perMetodeSemua[periode].get(baris.metode as string) ?? {
          transaksi: 0,
          omzet: 0,
        };
      agregat.transaksi += 1;
      agregat.omzet += Number(baris.total);
      perMetodeSemua[periode].set(baris.metode as string, agregat);
    }
  }

  const menuSemua: Record<
    PeriodeLaporan,
    Map<string, { porsi: number; omzet: number }>
  > = {
    "7-hari": new Map(),
    "30-hari": new Map(),
  };
  for (const baris of item.data ?? []) {
    const waktu = (baris.transaksi as { waktu?: string } | undefined)?.waktu;
    if (!waktu) continue;
    const target: PeriodeLaporan[] = [];
    if (dalamJendela(waktu, "7-hari")) target.push("7-hari");
    if (dalamJendela(waktu, "30-hari")) target.push("30-hari");
    for (const periode of target) {
      const nama = baris.nama_menu as string;
      const porsi = Number(baris.qty);
      const omzet = Number(baris.harga) * porsi;
      const agregat = menuSemua[periode].get(nama) ?? { porsi: 0, omzet: 0 };
      agregat.porsi += porsi;
      agregat.omzet += omzet;
      menuSemua[periode].set(nama, agregat);
    }
  }

  function susun(periode: PeriodeLaporan): LaporanPeriode {
    const hariJendela = periode === "7-hari" ? 7 : 30;
    const sekarang = jumlahJendela(rekapPerTanggal, hariJendela - 1, 0);
    const sebelumnya =
      periode === "7-hari"
        ? jumlahJendela(rekapPerTanggal, 13, 7)
        : jumlahJendela(rekapPerTanggal, 59, 30);

    const tren = Array.from({ length: hariJendela }, (_, i) => {
      const mundur = hariJendela - 1 - i;
      const baris = rekapPerTanggal.get(kunciTanggal(mundur));
      const tanggal = awalHariWIB(mundur);
      return {
        label:
          periode === "7-hari"
            ? labelHari.format(tanggal)
            : labelTanggal.format(tanggal),
        omzet: Number(baris?.omzet ?? 0),
      };
    });

    return {
      kpi: {
        omzetSebelumnya: sebelumnya.omzet,
        transaksi: sekarang.transaksi,
        transaksiSebelumnya: sebelumnya.transaksi,
        porsi: sekarang.porsi,
        porsiSebelumnya: sebelumnya.porsi,
      },
      tren,
      perMetode: METODE_URUT.map((metode) => ({
        metode,
        transaksi: perMetodeSemua[periode].get(metode)?.transaksi ?? 0,
        omzet: perMetodeSemua[periode].get(metode)?.omzet ?? 0,
      })),
      menuTerlaris: [...menuSemua[periode].entries()]
        .map(([nama, nilai]) => ({ nama, ...nilai }))
        .sort((a, b) => b.omzet - a.omzet)
        .slice(0, 5),
    };
  }

  return {
    "7-hari": susun("7-hari"),
    "30-hari": susun("30-hari"),
  };
}
