"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboard } from "@/hooks/use-data"

function formatCurrency(value: number): string {
  return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const tipoIcons = {
  ENTRADA: <ArrowDownLeft className="h-4 w-4 text-success" />,
  SALIDA: <ArrowUpRight className="h-4 w-4 text-destructive" />,
  AJUSTE: <RefreshCw className="h-4 w-4 text-warning" />,
}

const tipoColors = {
  ENTRADA: "text-success",
  SALIDA: "text-destructive",
  AJUSTE: "text-warning",
}

export function InventoryChart() {
  const { data, error, isLoading } = useDashboard()

  const { resumen, ultimosMovimientos } = data || { resumen: null, ultimosMovimientos: [] }

  return (
    <Card className="bg-card border border-border h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Movimientos Recientes</CardTitle>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {/* Summary Cards Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-4 border-b border-border">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-1 w-full rounded-full" />
                </div>
              ))}
            </div>

            {/* Movements Skeleton */}
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-sm text-muted-foreground">Error al cargar datos</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-4 border-b border-border">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Valorización</p>
                <p className="text-sm md:text-lg font-bold text-foreground">
                  {formatCurrency(resumen?.valorizacionInventario || 0)}
                </p>
                <div className="h-1 rounded-full bg-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Valor Venta</p>
                <p className="text-sm md:text-lg font-bold text-foreground">
                  {formatCurrency(resumen?.valorVentaPotencial || 0)}
                </p>
                <div className="h-1 rounded-full bg-success" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Margen Potencial</p>
                <p className="text-sm md:text-lg font-bold text-foreground">
                  {formatCurrency(resumen?.margenPotencial || 0)}
                </p>
                <div className="h-1 rounded-full bg-warning" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Stock Bajo</p>
                <p className="text-sm md:text-lg font-bold text-destructive">
                  {resumen?.productosConStockBajo || 0}
                </p>
                <div className="h-1 rounded-full bg-destructive" />
              </div>
            </div>

            {/* Recent Movements */}
            <div className="space-y-2">
              {ultimosMovimientos.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">
                  No hay movimientos recientes
                </p>
              ) : (
                ultimosMovimientos.slice(0, 5).map((mov) => (
                  <div
                    key={mov.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      {tipoIcons[mov.tipo as keyof typeof tipoIcons]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {mov.producto?.nombre || `Producto ${mov.productoId}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(mov.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${tipoColors[mov.tipo as keyof typeof tipoColors]}`}>
                        {mov.tipo === 'ENTRADA' ? '+' : mov.tipo === 'SALIDA' ? '-' : ''}{mov.cantidad}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{mov.tipo.toLowerCase()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
