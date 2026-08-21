"use client";

import { useState } from "react";
import { simpanTransaksi } from "@/app/kasir/actions";
import type { MenuItem } from "@/lib/data-menu";
import { MenuPanel } from "@/components/kasir/menu-panel";
import {
  OrderPanel,
  type KeranjangItem,
  type MetodeBayar,
  type StatusBayar,
} from "@/components/kasir/order-panel";

export function KasirWorkspace({ daftarMenu }: { daftarMenu: MenuItem[] }) {
  const [keranjang, setKeranjang] = useState<KeranjangItem[]>([]);
  const [metode, setMetode] = useState<MetodeBayar>("QRIS");
  const [status, setStatus] = useState<StatusBayar>("aktif");
  const [nomorOrder, setNomorOrder] = useState<string | null>(null);
  const [memproses, setMemproses] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const jumlahItem = keranjang.reduce((t, item) => t + item.qty, 0);
  const total = keranjang.reduce(
    (t, item) => t + item.menu.harga * item.qty,
    0
  );

  function tambahMenu(menu: MenuItem) {
    setKeranjang((prev) => {
      const sudahAda = prev.find((item) => item.menu.id === menu.id);
      if (sudahAda) {
        return prev.map((item) =>
          item.menu.id === menu.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { menu, qty: 1 }];
    });
  }

  function ubahJumlah(menuId: string, delta: number) {
    setKeranjang((prev) =>
      prev
        .map((item) =>
          item.menu.id === menuId ? { ...item, qty: item.qty + delta } : item
        )
        .filter((item) => item.qty > 0)
    );
  }

  function kosongkan() {
    setKeranjang([]);
    setError(null);
  }

  async function bayar() {
    if (keranjang.length === 0 || memproses) return;
    setMemproses(true);
    setError(null);

    const hasil = await simpanTransaksi({
      metode,
      items: keranjang.map((item) => ({
        menuId: item.menu.id,
        nama: item.menu.nama,
        harga: item.menu.harga,
        qty: item.qty,
      })),
    });

    setMemproses(false);
    if (!hasil.ok) {
      setError(hasil.error ?? "Gagal menyimpan transaksi.");
      return;
    }
    setNomorOrder(hasil.nomor ?? null);
    setStatus("sukses");
  }

  function transaksiBaru() {
    setKeranjang([]);
    setStatus("aktif");
    setNomorOrder(null);
    setError(null);
  }

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_400px]">
      <MenuPanel daftarMenu={daftarMenu} onPilih={tambahMenu} />
      <div className="lg:sticky lg:top-20">
        <OrderPanel
          keranjang={keranjang}
          metode={metode}
          status={status}
          nomorOrder={nomorOrder}
          jumlahItem={jumlahItem}
          total={total}
          memproses={memproses}
          error={error}
          onPilihMetode={setMetode}
          onUbahJumlah={ubahJumlah}
          onKosongkan={kosongkan}
          onBayar={bayar}
          onTransaksiBaru={transaksiBaru}
        />
      </div>
    </div>
  );
}
