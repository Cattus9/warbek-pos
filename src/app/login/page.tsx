import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { LoginForm } from "@/components/login/login-form";

export const metadata: Metadata = {
  title: "Warbek POS - Masuk",
};

const keunggulan = [
  "Kasir cepat untuk transaksi harian",
  "Menu dan laporan selalu sinkron",
  "Akses khusus tim Warbek",
];

export default function LoginPage() {
  return (
    <div className="relative flex h-screen w-full min-w-[1200px] flex-col overflow-hidden bg-background lg:flex-row">
      <section className="relative flex w-full flex-col justify-between overflow-hidden bg-primary px-6 py-8 text-primary-foreground sm:px-10 md:py-12 lg:w-[45%] lg:px-12 lg:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute bottom-0 right-0 h-64 w-64 translate-x-1/3 translate-y-1/3 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-0 left-0 h-72 w-72 -translate-x-1/4 -translate-y-1/4 rounded-full bg-black/5 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-white p-2 shadow-md">
              <Image
                src="/images/logobrand.webp"
                alt="Logo Warbek"
                width={32}
                height={32}
                className="size-8 object-contain"
              />
            </span>
            <span className="leading-tight">
              <span className="block font-heading text-base font-semibold tracking-tight">
                Warbek POS
              </span>
              <span className="block text-sm opacity-90">
                Warung Bebek Sawah
              </span>
            </span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="space-y-3">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Kelola warung dengan mudah
            </h2>
            <ul className="space-y-2">
              {keunggulan.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <span
                    className="flex size-5 items-center justify-center rounded-full bg-white/10 shrink-0"
                    aria-hidden
                  >
                    <CheckCircle2 className="size-3.5 text-white" aria-hidden />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="relative z-10 text-xs opacity-70">
          © 2026 Warbek · Dikelola untuk operasional warung
        </p>
      </section>

      <section className="flex flex-1 items-center justify-center bg-background px-4 py-10 sm:px-6">
        <div className="w-full max-w-sm">
          <LoginForm />
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Butuh bantuan? Hubungi pemilik warung.
          </p>
        </div>
      </section>
    </div>
  );
}
