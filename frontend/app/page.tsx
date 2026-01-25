"use client"

import { Shell } from "@/components/dashboard/shell"
import { StatCards } from "@/components/dashboard/stat-cards"
import { SalesPanel } from "@/components/dashboard/sales-panel"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

// Lazy load heavy chart components
const InventoryChart = dynamic(
  () => import("@/components/dashboard/inventory-chart").then((mod) => mod.InventoryChart),
  {
    loading: () => (
      <div className="h-full w-full p-4 border rounded-xl space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    ),
    ssr: false // Charts are client-only anyway
  }
)

const BottomStats = dynamic(
  () => import("@/components/dashboard/bottom-stats").then((mod) => mod.BottomStats),
  {
    loading: () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mt-4 md:mt-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 border rounded-xl p-4 space-y-3">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-full w-full" />
          </div>
        ))}
      </div>
    ),
    ssr: false
  }
)

export default function DashboardPage() {
  return (
    <Shell>
      {/* Stats - Eager loaded for LCP */}
      <StatCards />

      {/* Chart and Sales Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 mt-4 md:mt-6">
        <div className="xl:col-span-2 min-h-[400px]">
          <InventoryChart />
        </div>
        <div className="xl:col-span-1">
          {/* SalesPanel is lightweight enough to keep eager or could be lazy if desired */}
          <SalesPanel />
        </div>
      </div>

      {/* Bottom Stats with Mini Charts */}
      <BottomStats />
    </Shell>
  )
}
