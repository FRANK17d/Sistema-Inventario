"use client"

import React from "react"
import { Package, Tags, Truck, TrendingUp, MoreVertical } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useDashboard } from "@/hooks/use-data"

const stats = [
  {
    icon: Package,
    label: "Total Productos",
    key: "totalProductos" as const,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    icon: Tags,
    label: "Categorías",
    key: "totalCategorias" as const,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
  {
    icon: Truck,
    label: "Proveedores",
    key: "totalProveedores" as const,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  {
    icon: TrendingUp,
    label: "Stock Bajo",
    key: "productosConStockBajo" as const,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
]

function formatCurrency(value: number): string {
  return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function StatCards() {
  const { data, error, isLoading } = useDashboard()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4 md:p-5 bg-card border border-border">
            <div className="flex items-start gap-3 md:gap-4">
              <Skeleton className="w-10 h-10 md:w-11 md:h-11 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <Card className="col-span-full p-8 text-center">
          <p className="text-destructive">Error al cargar estadísticas</p>
        </Card>
      </div>
    )
  }

  const valorizacion = data?.resumen.valorizacionInventario || 0
  const valorVenta = data?.resumen.valorVentaPotencial || 0
  const margen = data?.resumen.margenPotencial || 0
  const totalProductos = data?.resumen.totalProductos || 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        const value = data?.resumen[stat.key] || 0

        // Calculate progress based on context
        let progress = 0
        let progressText = ""

        if (stat.key === "totalProductos") {
          progress = totalProductos > 0 ? Math.min(100, (totalProductos / 100) * 100) : 0
          progressText = `${formatCurrency(margen)} margen`
        } else if (stat.key === "totalCategorias") {
          const avgProductsPerCategory = totalProductos / Math.max(value, 1)
          progress = Math.min(100, avgProductsPerCategory * 10)
          progressText = `${Math.round(avgProductsPerCategory)} prom. por categoría`
        } else if (stat.key === "totalProveedores") {
          progress = value > 0 ? Math.min(100, (value / 20) * 100) : 0
          progressText = `${value} activos`
        } else if (stat.key === "productosConStockBajo") {
          progress = totalProductos > 0 ? (value / totalProductos) * 100 : 0
          progressText = `${Math.round(progress)}% del inventario`
        }

        return (
          <Card
            key={stat.label}
            className="p-4 md:p-5 bg-card border border-border hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3 md:gap-4">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-xl",
                stat.bgColor
              )}>
                <Icon className={cn("w-5 h-5 md:w-6 md:h-6", stat.color)} />
              </div>
              <div className="flex-1">
                <p className="text-2xl md:text-3xl font-bold text-foreground">{value}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 text-muted-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>{progressText}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    stat.key === "productosConStockBajo"
                      ? "bg-destructive"
                      : "bg-primary"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
