"use client";

import { usePathname } from "next/navigation";
import { AppHeader as Header } from "@/components/app-header";

export type HalamanApp = "dashboard" | "kasir" | "menu" | "laporan";

export function NavigationLayout({ 
  children, 
  aktif 
}: { 
  children: React.ReactNode;
  aktif?: HalamanApp;
}) {
  const pathname = usePathname();
  
  return (
    <div className="flex min-h-[100dvh] flex-col">
      {aktif && <Header aktif={aktif} />}
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
