import { Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRupiah, formatRupiahCompact } from "@/lib/format";
import { cn } from "@/lib/utils";

export function MenuFavorit({
  menuFavorit,
  className,
}: {
  menuFavorit: { nama: string; porsi: number; omzet: number }[];
  className?: string;
}) {
  const totalOmzetTopLima = menuFavorit.reduce((t, m) => t + m.omzet, 0);
  const totalPorsi = menuFavorit.reduce((t, m) => t + m.porsi, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Menu Favorit Hari Ini</CardTitle>
        <CardDescription>
          {totalPorsi} porsi dari lima menu terlaris
        </CardDescription>
        <Badge className="bg-primary/10 text-primary">
          <Flame aria-hidden />
          Terlaris
        </Badge>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="divide-y divide-border">
          {menuFavorit.map((menu, index) => (
            <li key={menu.nama} className="flex items-center gap-3 py-2.5">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-semibold tabular-nums",
                  index === 0
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {menu.nama}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {menu.porsi} porsi
              </span>
              <span className="w-24 shrink-0 text-right font-mono text-sm font-medium tabular-nums">
                {formatRupiah(menu.omzet)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-xs text-muted-foreground">
          Kontribusi ke omzet
        </span>
        <span className="font-mono text-sm font-medium tabular-nums">
          {formatRupiahCompact(totalOmzetTopLima)}
        </span>
      </CardFooter>
    </Card>
  );
}
