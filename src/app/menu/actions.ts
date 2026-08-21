"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { Kategori } from "@/lib/data-menu";
import { createClient } from "@/utils/supabase/server";

export interface HasilTambahMenu {
  ok: boolean;
  error?: string;
}

const KATEGORI_VALID: Kategori[] = ["makanan", "pendamping", "minuman"];

export async function tambahMenu(input: {
  nama: string;
  harga: number;
  kategori: string;
  keterangan?: string;
}): Promise<HasilTambahMenu> {
  const nama = typeof input.nama === "string" ? input.nama.trim() : "";
  if (!nama) {
    return { ok: false, error: "Nama menu wajib diisi." };
  }
  if (
    typeof input.harga !== "number" ||
    !Number.isFinite(input.harga) ||
    input.harga <= 0
  ) {
    return { ok: false, error: "Harga harus berupa angka lebih dari 0." };
  }
  if (!KATEGORI_VALID.includes(input.kategori as Kategori)) {
    return { ok: false, error: "Kategori tidak valid." };
  }

  const supabase = createClient(await cookies());
  const { error } = await supabase.from("menu").insert({
    nama,
    harga: Math.round(input.harga),
    kategori: input.kategori,
    keterangan: input.keterangan?.trim() || null,
    tersedia: true,
  });

  if (error) {
    const duplicat = error.code === "23505";
    return {
      ok: false,
      error: duplicat
        ? `Menu "${nama}" sudah ada di daftar.`
        : error.message,
    };
  }

  revalidatePath("/menu");
  revalidatePath("/kasir");

  return { ok: true };
}
