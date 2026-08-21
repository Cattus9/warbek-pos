"use client";

import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, Clock, ShoppingCart } from "lucide-react";
import Image from "next/image";
import NextLink from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatTanggalPanjang } from "@/lib/format";

export type HalamanApp = "dashboard" | "kasir" | "menu" | "laporan";

const navItems: { id: HalamanApp; label: string; href: string; tersedia: boolean }[] = [
  { id: "dashboard", label: "Dashboard", href: "/", tersedia: true },
  { id: "kasir", label: "Kasir", href: "/kasir", tersedia: true },
  { id: "menu", label: "Menu", href: "/menu", tersedia: true },
  { id: "laporan", label: "Laporan", href: "/laporan", tersedia: true },
];

export function AppHeader({ aktif }: { aktif: HalamanApp }) {
  const pathname = usePathname();
  const router = useRouter();

  // Note: Next.js automatically prefetches links when they hover in viewport
  // No manual prefetch needed - this is built into Next.js
  
  const tanggal = formatTanggalPanjang(new Date());

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo & Brand */}
        <NextLink href="/" aria-label="Home">
          <span className="flex shrink-0 items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity">
            <Image
              src="/images/logobrand.webp"
              alt="Logo Warbek"
              width={36}
              height={36}
              className="size-9 shrink-0 rounded-lg object-contain"
              priority
            />
            <span className="leading-tight">
              <span className="block font-heading text-sm font-semibold tracking-tight">
                Warbek POS
              </span>
              <span className="block text-xs text-muted-foreground">
                Warung Bebek Sawah
              </span>
            </span>
          </span>
        </NextLink>

        <Separator orientation="vertical" className="hidden h-6 md:block" />

        {/* Navigation Links - Using Next.js Link for client-side routing */}
        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 md:flex">
          {navItems.map((item) =>
            item.tersedia ? (
              <Button
                key={item.id}
                asChild
                variant={item.id === aktif ? "secondary" : "ghost"}
                size="sm"
                aria-current={item.id === aktif ? "page" : undefined}
              >
                <NextLink href={item.href}>{item.label}</NextLink>
              </Button>
            ) : (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                disabled
                title="Segera tersedia"
              >
                {item.label}
              </Button>
            )
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {/* Date Display */}
          <span className="hidden items-center gap-1.5 text-xs text-muted-foreground lg:flex">
            <CalendarDays className="size-3.5" aria-hidden />
            {tanggal}
          </span>
          
          {/* Status Badge */}
          <Badge className="bg-positive/10 text-positive">
            <Clock className="size-3" aria-hidden />
            Buka
          </Badge>
          
          {/* Quick Transaction Button (Dashboard only) */}
          {aktif === "dashboard" && (
            <Button size="sm" asChild>
              <NextLink href="/kasir">
                <ShoppingCart data-icon="inline-start" aria-hidden className="size-3 mr-2" />
                Transaksi Baru
              </NextLink>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
