-- ============================================================================
-- Warbek POS - Skema PostgreSQL (Supabase)
--
-- Pemetaan halaman -> objek database:
--   Halaman Menu      : table menu
--   Halaman Kasir     : sequence transaksi_nomor_seq,
--                       table transaksi, table transaksi_item
--   Halaman Dashboard : view rekap_harian + agregasi table transaksi /
--                       transaksi_item
--   Halaman Laporan   : view rekap_harian + agregasi table transaksi /
--                       transaksi_item (GROUP BY metode & menu)
--
-- Catatan:
--   * Nominal uang disimpan dalam rupiah sebagai bigint (tanpa desimal).
--   * transaksi_item menyimpan snapshot nama & harga agar histori penjualan
--     tetap benar walau menu berubah/hapus.
--   * Jalankan di database kosong / skema public Supabase.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- Tipe enum
-- ----------------------------------------------------------------------------

create type kategori_menu as enum ('makanan', 'pendamping', 'minuman');
create type metode_pembayaran as enum ('Tunai', 'QRIS', 'Debit');
create type status_pembayaran as enum ('aktif', 'sukses', 'batal');

-- ----------------------------------------------------------------------------
-- Table: menu (halaman Menu + pilihan item di Kasir)
-- ----------------------------------------------------------------------------

create table public.menu (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  harga bigint not null check (harga >= 0),
  kategori kategori_menu not null,
  keterangan text,
  tersedia boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index menu_nama_unik on public.menu (lower(nama));
create index menu_kategori_idx on public.menu (kategori);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger menu_updated_at
  before update on public.menu
  for each row
  execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Table: transaksi (halaman Kasir; sumber data Dashboard & Laporan)
-- Nomor order otomatis: WB-0097, WB-0098, ... (lanjutan dari data contoh)
-- ----------------------------------------------------------------------------

create sequence public.transaksi_nomor_seq start with 97;

create table public.transaksi (
  id uuid primary key default gen_random_uuid(),
  nomor text not null unique
    default format('WB-%s', lpad(nextval('public.transaksi_nomor_seq')::text, 4, '0')),
  waktu timestamptz not null default now(),
  metode metode_pembayaran not null default 'QRIS',
  status status_pembayaran not null default 'aktif',
  total bigint not null default 0 check (total >= 0),
  created_at timestamptz not null default now()
);

create index transaksi_waktu_idx on public.transaksi (waktu desc);
create index transaksi_status_idx on public.transaksi (status);
create index transaksi_metode_idx on public.transaksi (metode);

-- ----------------------------------------------------------------------------
-- Table: transaksi_item (detail pesanan kasir)
-- subtotal dihitung otomatis dari harga * qty.
-- ----------------------------------------------------------------------------

create table public.transaksi_item (
  id uuid primary key default gen_random_uuid(),
  transaksi_id uuid not null
    references public.transaksi (id) on delete cascade,
  menu_id uuid
    references public.menu (id) on delete set null,
  nama_menu text not null,
  harga bigint not null check (harga >= 0),
  qty integer not null check (qty > 0),
  subtotal bigint generated always as (harga * qty) stored
);

create index transaksi_item_transaksi_idx on public.transaksi_item (transaksi_id);
create index transaksi_item_menu_idx on public.transaksi_item (menu_id);

-- ----------------------------------------------------------------------------
-- View: rekap_harian (KPI & grafik harian Dashboard dan Laporan)
-- ----------------------------------------------------------------------------

create view public.rekap_harian as
with per_transaksi as (
  select
    t.id,
    (t.waktu at time zone 'Asia/Jakarta')::date as tanggal,
    t.total,
    coalesce(sum(ti.qty), 0) as porsi
  from public.transaksi t
  left join public.transaksi_item ti on ti.transaksi_id = t.id
  where t.status = 'sukses'
  group by t.id
)
select
  tanggal,
  count(*)::integer as jumlah_transaksi,
  sum(total)::bigint as omzet,
  sum(porsi)::integer as jumlah_porsi
from per_transaksi
group by tanggal;

-- ----------------------------------------------------------------------------
-- Row Level Security (Supabase)
-- Kebijakan default: semua pengguna terautentikasi (kasir/staf) dapat
-- membaca dan menulis. Perketat sesuai kebutuhan, misalnya pisahkan peran
-- kasir (insert transaksi) dan admin (kelola menu).
-- ----------------------------------------------------------------------------

alter table public.menu enable row level security;
alter table public.transaksi enable row level security;
alter table public.transaksi_item enable row level security;

create policy "menu: akses staf" on public.menu
  for all to authenticated
  using (true) with check (true);

create policy "transaksi: akses staf" on public.transaksi
  for all to authenticated
  using (true) with check (true);

create policy "transaksi_item: akses staf" on public.transaksi_item
  for all to authenticated
  using (true) with check (true);

-- Rekap hanya dibaca.
alter view public.rekap_harian set (security_invoker = on);

-- ----------------------------------------------------------------------------
-- Seed data menu (opsional, sesuai src/lib/data-menu.ts)
-- Hapus bagian ini jika tidak diperlukan.
-- ----------------------------------------------------------------------------

insert into public.menu (nama, harga, kategori, keterangan) values
  ('Bebek Goreng Kremes', 27000, 'makanan', 'Nasi + sambal korek'),
  ('Bebek Bakar Madu', 28000, 'makanan', 'Nasi + sambal ijo'),
  ('Bebek Goreng Original', 24000, 'makanan', 'Nasi + sambal korek'),
  ('Nasi Bebek Komplit', 29000, 'makanan', 'Bebek + tahu + sayur + sambal'),
  ('Sate Bebek (10 tusuk)', 28000, 'makanan', 'Bumbu kacang'),
  ('Sop Bebek Kuah Kuning', 28000, 'makanan', null),

  ('Nasi Putih', 6000, 'pendamping', null),
  ('Nasi Uduk', 9000, 'pendamping', null),
  ('Tahu Tempe Goreng', 8000, 'pendamping', null),
  ('Lalapan Segar', 5000, 'pendamping', null),
  ('Sambal Bawang Ekstra', 3000, 'pendamping', null),
  ('Kerupuk Udang', 3000, 'pendamping', null),
  ('Telur Dadar Krispi', 7000, 'pendamping', null),

  ('Es Teh Manis', 6000, 'minuman', null),
  ('Teh Tawar Hangat', 4000, 'minuman', null),
  ('Es Jeruk Peras', 9000, 'minuman', null),
  ('Jeruk Panas', 8000, 'minuman', null),
  ('Kopi Hitam', 7000, 'minuman', null),
  ('Es Campur Spesial', 14000, 'minuman', null),
  ('Air Mineral 600ml', 4000, 'minuman', null),
  ('Es Susu Coklat', 12000, 'minuman', null);

commit;
