"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { ClipboardList, AlertTriangle, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import { useDashboard } from "@/hooks/use-data"

interface BottomStatProps {
  title: string
  subtitle: string
  current: number
  total: number
  icon: React.ReactNode
  data: { value: number }[]
  color: string
  gradientId: string
  colorClass: string
}

const defaultChartData = [
  { value: 30 }, { value: 45 }, { value: 35 }, { value: 50 }, { value: 40 },
  { value: 55 }, { value: 45 }, { value: 60 }, { value: 50 }, { value: 65 }
]

function BottomStatCard({ title, subtitle, current, total, icon, data, color, gradientId, colorClass }: BottomStatProps) {
  return (
    <Card className="p-4 md:p-5 bg-card border-border">
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-lg bg-muted">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xl md:text-2xl font-bold text-foreground">{current}</span>
          {total > 0 && <span className="text-base md:text-lg text-muted-foreground">/{total}</span>}
        </div>
      </div>

      <div className="h-14 md:h-16 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${colorClass}`}
            style={{ width: `${total > 0 ? (current / total) * 100 : 0}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">{subtitle}</span>
          <span className="font-medium text-foreground">
            {total > 0 ? Math.round((current / total) * 100) : 0}%
          </span>
        </div>
      </div>
    </Card>
  )
}

function formatCurrency(value: number): string {
  return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function BottomStats() {
  const { data, error, isLoading } = useDashboard()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mt-4 md:mt-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4 md:p-5 bg-card">
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className="flex items-center gap-2 md:gap-3">
                <Skeleton className="w-9 h-9 md:w-10 md:h-10 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-8 w-12" />
            </div>
            <div className="h-14 md:h-16 mb-3">
              <Skeleton className="h-full w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-2 w-full rounded-full" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-6 text-center text-muted-foreground">
        Error al cargar estadísticas detalladas
      </div>
    )
  }

  const stockBajo = data?.resumen.productosConStockBajo || 0
  const totalProductos = data?.resumen.totalProductos || 0
  const valorizacion = data?.resumen.valorizacionInventario || 0
  const valorVenta = data?.resumen.valorVentaPotencial || 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mt-4 md:mt-6">
      <BottomStatCard
        title="Stock Crítico"
        subtitle="Productos bajo mínimo"
        current={stockBajo}
        total={totalProductos}
        icon={<AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-orange-500" />}
        data={defaultChartData}
        color="#f97316"
        gradientId="colorStock"
        colorClass="bg-orange-500"
      />

      <BottomStatCard
        title="Valorización"
        subtitle="Costo total inventario"
        current={valorizacion}
        total={0}
        icon={<TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />}
        data={defaultChartData}
        color="#3b82f6"
        gradientId="colorVal"
        colorClass="bg-blue-500"
      />

      <BottomStatCard
        title="Rentabilidad"
        subtitle="Margen esperado"
        current={Math.round(((valorVenta - valorizacion) / valorizacion) * 100) || 0}
        total={100}
        icon={<ClipboardList className="h-5 w-5 md:h-6 md:w-6 text-green-500" />}
        data={defaultChartData}
        color="#22c55e"
        gradientId="colorRent"
        colorClass="bg-green-500"
      />
    </div>
  )
}
