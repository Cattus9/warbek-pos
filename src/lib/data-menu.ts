export type Kategori = "makanan" | "pendamping" | "minuman";

export interface MenuItem {
  id: string;
  nama: string;
  harga: number;
  kategori: Kategori;
  keterangan?: string;
  tersedia?: boolean;
}

export const labelKategori: Record<Kategori, string> = {
  makanan: "Makanan",
  pendamping: "Pendamping",
  minuman: "Minuman",
};
