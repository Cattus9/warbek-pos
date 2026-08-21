"use client";

import { useState } from "react";
import { GlassWater, Salad, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { type Kategori, type MenuItem } from "@/lib/data-menu";

interface TambahMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSimpan: (item: MenuItem) => Promise<string | null>;
}

function FormTambahMenu({
  onSimpan,
}: {
  onSimpan: (item: MenuItem) => Promise<string | null>;
}) {
  const [nama, setNama] = useState("");
  const [harga, setHarga] = useState("");
  const [kategori, setKategori] = useState<Kategori>("makanan");
  const [keterangan, setKeterangan] = useState("");
  const [errorNama, setErrorNama] = useState<string | null>(null);
  const [errorHarga, setErrorHarga] = useState<string | null>(null);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [menyimpan, setMenyimpan] = useState(false);

  async function simpan(e: React.FormEvent) {
    e.preventDefault();

    const namaTerisi = nama.trim();
    const hargaAngka = Number(harga);
    let valid = true;

    if (!namaTerisi) {
      setErrorNama("Nama menu wajib diisi.");
      valid = false;
    }
    if (!harga || !Number.isFinite(hargaAngka) || hargaAngka <= 0) {
      setErrorHarga("Harga harus berupa angka lebih dari 0.");
      valid = false;
    }
    if (!valid) return;

    setMenyimpan(true);
    setErrorForm(null);
    const error = await onSimpan({
      id: "",
      nama: namaTerisi,
      harga: hargaAngka,
      kategori,
      keterangan: keterangan.trim() || undefined,
    });
    setMenyimpan(false);
    if (error) setErrorForm(error);
  }

  return (
    <form onSubmit={simpan} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>Tambah Menu</DialogTitle>
        <DialogDescription>
          Isi detail menu baru untuk ditampilkan di katalog.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nama-menu" className="font-medium">
          Nama menu
        </label>
        <Input
          id="nama-menu"
          value={nama}
          onChange={(e) => {
            setNama(e.target.value);
            setErrorNama(null);
          }}
          placeholder="mis. Bebek Goreng Kremes"
          aria-invalid={errorNama ? true : undefined}
        />
        {errorNama ? (
          <p className="text-xs text-destructive">{errorNama}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="font-medium">Kategori</span>
        <ToggleGroup
          type="single"
          value={kategori}
          onValueChange={(v) => {
            if (v) setKategori(v as Kategori);
          }}
          variant="outline"
          size="sm"
          spacing={0}
          aria-label="Kategori menu"
          className="justify-start"
        >
          <ToggleGroupItem value="makanan">
            <UtensilsCrossed data-icon="inline-start" aria-hidden />
            Makanan
          </ToggleGroupItem>
          <ToggleGroupItem value="pendamping">
            <Salad data-icon="inline-start" aria-hidden />
            Pendamping
          </ToggleGroupItem>
          <ToggleGroupItem value="minuman">
            <GlassWater data-icon="inline-start" aria-hidden />
            Minuman
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="harga-menu" className="font-medium">
          Harga (Rp)
        </label>
        <Input
          id="harga-menu"
          type="number"
          min={0}
          step={500}
          inputMode="numeric"
          value={harga}
          onChange={(e) => {
            setHarga(e.target.value);
            setErrorHarga(null);
          }}
          placeholder="mis. 27000"
          aria-invalid={errorHarga ? true : undefined}
        />
        {errorHarga ? (
          <p className="text-xs text-destructive">{errorHarga}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="keterangan-menu" className="font-medium">
          Keterangan{" "}
          <span className="font-normal text-muted-foreground">(opsional)</span>
        </label>
        <Input
          id="keterangan-menu"
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          placeholder="mis. Nasi + sambal korek"
        />
      </div>

      {errorForm ? (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          {errorForm}
        </p>
      ) : null}

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" type="button">
            Batal
          </Button>
        </DialogClose>
        <Button type="submit" disabled={menyimpan}>
          {menyimpan ? "Menyimpan..." : "Simpan Menu"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function TambahMenuDialog({
  open,
  onOpenChange,
  onSimpan,
}: TambahMenuDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <DialogContent>
          <FormTambahMenu onSimpan={onSimpan} />
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
