-- ============================================================================
-- Warbek POS - Kebijakan RLS untuk role anon
--
-- Aplikasi saat ini belum memakai autentikasi, sehingga Supabase diakses
-- sebagai role anon. Jalankan file ini SETELAH supabase/schema.sql.
--
-- PENTING: setelah Supabase Auth dipakai (kasir login), hapus kebijakan
-- anon di bawah dan andalkan kebijakan role authenticated dari schema.sql.
-- ============================================================================

begin;

create policy "menu: anon baca" on public.menu
  for select to anon
  using (true);

create policy "transaksi: anon baca" on public.transaksi
  for select to anon
  using (true);

create policy "transaksi: anon insert" on public.transaksi
  for insert to anon
  with check (true);

create policy "transaksi_item: anon baca" on public.transaksi_item
  for select to anon
  using (true);

create policy "transaksi_item: anon insert" on public.transaksi_item
  for insert to anon
  with check (true);

commit;
