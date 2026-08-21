const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const persen = new Intl.NumberFormat("id-ID", {
  signDisplay: "always",
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatRupiah(value: number) {
  return rupiah.format(value);
}

export function formatRupiahCompact(value: number) {
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })} jt`;
  }
  if (value >= 1_000) {
    return `Rp ${Math.round(value / 1_000)} rb`;
  }
  return formatRupiah(value);
}

export function formatDelta(current: number, previous: number) {
  if (previous === 0) return persen.format(current);
  return persen.format((current - previous) / previous);
}

export function formatTanggalPanjang(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
