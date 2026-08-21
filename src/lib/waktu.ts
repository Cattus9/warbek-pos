const ZONA_WAKTU = "Asia/Jakarta";

export function tanggalWIB(sekarang = new Date()): {
  tahun: number;
  bulan: number;
  tanggal: number;
} {
  const [tahun, bulan, tanggal] = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_WAKTU,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(sekarang)
    .split("-")
    .map(Number);
  return { tahun, bulan, tanggal };
}

export function awalHariWIB(mundurHari = 0): Date {
  const { tahun, bulan, tanggal } = tanggalWIB();
  return new Date(Date.UTC(tahun, bulan - 1, tanggal - mundurHari, -7));
}

export function formatJamWIB(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: ZONA_WAKTU,
  }).format(new Date(iso));
}

export function labelHariPendek(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    timeZone: ZONA_WAKTU,
  }).format(new Date(iso));
}
