import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  labelPeriode,
  type LaporanPeriode,
  type PeriodeLaporan,
} from "@/lib/data-penjualan";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";

const persen = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });

export function MenuTerlaris({
  periode,
  laporan,
  className,
}: {
  periode: PeriodeLaporan;
  laporan: LaporanPeriode;
  className?: string;
}) {
  const menu = laporan.menuTerlaris;
  const totalOmzet = menu.reduce((t, m) => t + m.omzet, 0);
  const porsiTertinggi = Math.max(...menu.map((m) => m.porsi));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Menu Terlaris</CardTitle>
        <CardDescription>
          Lima menu dengan omzet tertinggi {labelPeriode[periode].toLowerCase()}
        </CardDescription>
      </CardHeader>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">No.</TableHead>
              <TableHead>Menu</TableHead>
              <TableHead className="w-24 text-right">Terjual</TableHead>
              <TableHead className="w-32 text-right">Omzet</TableHead>
              <TableHead className="w-44">Pangsa Omzet</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menu.map((item, index) => {
              const pangsa = item.omzet / totalOmzet;
              return (
                <TableRow key={item.nama}>
                  <TableCell className="font-mono text-xs text-muted-foreground tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </TableCell>
                  <TableCell className="font-medium whitespace-normal">
                    {item.nama}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {item.porsi.toLocaleString("id-ID")} porsi
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium tabular-nums">
                    {formatRupiah(item.omzet)}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-full max-w-24 overflow-hidden rounded-full bg-muted">
                        <span
                          className={cn(
                            "block h-full rounded-full",
                            item.porsi === porsiTertinggi
                              ? "bg-primary"
                              : "bg-primary/45"
                          )}
                          style={{ width: `${pangsa * 100}%` }}
                        />
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {persen.format(pangsa * 100)}%
                      </span>
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <CardFooter className="text-xs text-muted-foreground">
        Pangsa dihitung dari total omzet lima menu teratas
      </CardFooter>
    </Card>
  );
}
