"use client";

import { useFormStatus } from "react-dom";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginState {
  error?: string;
  loading?: boolean;
}

export function LoginForm() {
  const [state, setState] = useState<LoginState>({});
  const [lihatKataSandi, setLihatKataSandi] = useState(false);
  const [ingatSaya, setIngatSaya] = useState(true);

  async function handleLogin(formData: FormData) {
    setState({ loading: true, error: undefined });

    try {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      console.log("Attempting login with:", { email: email ? email.substring(0, 3) + "..." : "(empty)" });

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // Read raw text first to debug any issues
      const contentType = response.headers.get("content-type");
      let data: { error?: string };
      
      if (contentType?.includes("text/html")) {
        const htmlText = await response.text();
        console.error("Got HTML response instead of JSON:", htmlText.substring(0, 500));
        setState({ error: "Server error - tidak dapat mendapatkan respons yang valid" });
        return;
      }

      try {
        data = await response.json();
      } catch {
        const textData = await response.text();
        console.error("Invalid JSON response:", textData.substring(0, 200));
        setState({ error: "Server memberikan respons yang tidak valid" });
        return;
      }

      if (!response.ok) {
        setState({ error: data.error || "Login gagal" });
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      console.error("Network error:", err.message);
      setState({ 
        error: err.message || 
          "Terjadi kesalahan koneksi ke server. Pastikan Supabase aktif." 
      });
    }
  }

  return (
    <Card className="w-full border-border/60 shadow-sm">
      <CardContent className="p-6 sm:p-7">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          Masuk ke Warbek POS
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Gunakan akun tim untuk mengakses kasir dan laporan.
        </p>

        <form action={handleLogin} noValidate className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="nama@warbek.id"
              required
              disabled={state.loading}
              aria-invalid={!!state.error}
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="kata-sandi">Kata sandi</Label>
              <Button
                variant="link"
                size="sm"
                className="-m-1 h-auto p-1 text-xs"
                asChild
              >
                <a href="#">Lupa kata sandi?</a>
              </Button>
            </div>
            <div className="relative">
              <Input
                id="kata-sandi"
                type={lihatKataSandi ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                disabled={state.loading}
                className="h-9 pr-9"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground"
                onClick={() => setLihatKataSandi((value) => !value)}
                aria-label={lihatKataSandi ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                aria-pressed={lihatKataSandi}
              >
                {lihatKataSandi ? (
                  <EyeOff className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="ingat-saya"
              checked={ingatSaya}
              onCheckedChange={(value) => setIngatSaya(value === true)}
              disabled={state.loading}
            />
            <Label
              htmlFor="ingat-saya"
              className="font-normal text-sm text-muted-foreground"
            >
              Ingat saya
            </Label>
          </div>

          {state.error && (
            <div
              role="alert"
              className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
            >
              {state.error}
            </div>
          )}

          <SubmitButton isPending={state.loading}>Masuk</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}

function SubmitButton({
  children,
  isPending,
}: {
  children: React.ReactNode;
  isPending: boolean | undefined;
}) {
  const { pending } = useFormStatus();
  const isLoading = isPending || pending;

  return (
    <Button type="submit" className="h-9 w-full" disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="animate-spin mr-2 h-4 w-4" aria-hidden />
          Memeriksa…
        </>
      ) : (
        children
      )}
    </Button>
  );
}
