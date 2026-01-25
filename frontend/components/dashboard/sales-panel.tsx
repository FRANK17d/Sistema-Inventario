"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings, ArrowRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboard } from "@/hooks/use-data"

const categoryColors = [
  { bgColor: "bg-blue-100", darkBgColor: "dark:bg-blue-900/30" },
  { bgColor: "bg-amber-100", darkBgColor: "dark:bg-amber-900/30" },
  { bgColor: "bg-green-100", darkBgColor: "dark:bg-green-900/30" },
  { bgColor: "bg-purple-100", darkBgColor: "dark:bg-purple-900/30" },
  { bgColor: "bg-rose-100", darkBgColor: "dark:bg-rose-900/30" },
]

function formatCurrency(value: number): string {
  return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function SalesPanel() {
  const { data, error, isLoading } = useDashboard()

  const topCategories = data?.productosPorCategoria
    .sort((a, b) => b._count.productos - a._count.productos)
    .slice(0, 5) || []

  const totalValor = data?.resumen.valorizacionInventario || 0

  return (
    <Card className="bg-card border border-border h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl md:text-3xl font-bold text-foreground">
                {isLoading ? "..." : formatCurrency(totalValor)}
              </span>
              {!isLoading && data && (
                <Badge variant="outline" className="text-xs">
                  {data.resumen.totalProductos} items
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm">Total Inventario</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Error al cargar datos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topCategories.map((cat, index) => {
              const colors = categoryColors[index % categoryColors.length]
              return (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  {cat.imagenUrl ? (
                    <img
                      src={cat.imagenUrl}
                      alt={cat.nombre}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-lg ${colors.bgColor} ${colors.darkBgColor} flex items-center justify-center text-sm font-bold text-primary`}>
                      {cat.nombre.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground truncate">{cat.nombre}</p>
                    <p className="text-xs text-muted-foreground">Categoría</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-card-foreground">{cat._count.productos}</p>
                    <p className="text-xs text-muted-foreground">productos</p>
                  </div>
                </div>
              )
            })}
            {topCategories.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-4">
                No hay categorías registradas
              </p>
            )}
          </div>
        )}
        <Button
          variant="ghost"
          className="w-full mt-4 text-muted-foreground hover:text-foreground"
        >
          Ver detalles completos
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}
