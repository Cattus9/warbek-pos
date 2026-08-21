"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export interface ItemTransaksiInput {
  menuId: string | null;
  nama: string;
  harga: number;
  qty: number;
}

export interface HasilSimpanTransaksi {
  ok: boolean;
  nomor?: string;
  error?: string;
}

const METODE_VALID = ["Tunai", "QRIS", "Debit"];

export async function simpanTransaksi(input: {
  metode: string;
  items: ItemTransaksiInput[];
}): Promise<HasilSimpanTransaksi> {
  if (!METODE_VALID.includes(input.metode)) {
    return { ok: false, error: "Metode pembayaran tidak valid." };
  }
  if (input.items.length === 0) {
    return { ok: false, error: "Pesanan masih kosong." };
  }
  for (const item of input.items) {
    if (
      typeof item.nama !== "string" ||
      item.nama.trim() === "" ||
      !Number.isInteger(item.qty) ||
      item.qty <= 0 ||
      typeof item.harga !== "number" ||
      item.harga < 0
    ) {
      return { ok: false, error: "Data pesanan tidak valid." };
    }
  }

  const total = input.items.reduce(
    (jumlah, item) => jumlah + item.harga * item.qty,
    0
  );

  const supabase = createClient(await cookies());

  const { data: transaksi, error: errorTransaksi } = await supabase
    .from("transaksi")
    .insert({ metode: input.metode, status: "sukses", total })
    .select("id, nomor")
    .single();

  if (errorTransaksi || !transaksi) {
    return {
      ok: false,
      error: errorTransaksi?.message ?? "Gagal membuat transaksi.",
    };
  }

  const { error: errorItem } = await supabase.from("transaksi_item").insert(
    input.items.map((item) => ({
      transaksi_id: transaksi.id,
      menu_id: item.menuId,
      nama_menu: item.nama.trim(),
      harga: item.harga,
      qty: item.qty,
    }))
  );

  if (errorItem) {
    return {
      ok: false,
      error: `Transaksi ${transaksi.nomor} tercatat tanpa detail item: ${errorItem.message}`,
    };
  }

  revalidatePath("/");
  revalidatePath("/kasir");

  return { ok: true, nomor: transaksi.nomor as string };
}
