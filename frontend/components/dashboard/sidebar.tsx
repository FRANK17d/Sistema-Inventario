"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  ArrowLeftRight,
  ChevronRight,

  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Package, label: "Productos", href: "/productos" },
  { icon: Tags, label: "Categorías", href: "/categorias" },
  { icon: Truck, label: "Proveedores", href: "/proveedores" },
  { icon: ArrowLeftRight, label: "Movimientos", href: "/movimientos" },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col h-full w-60 bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            I
          </div>
          <span className="font-bold text-base text-sidebar-foreground">INVENTARIO</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-8 w-8 text-muted-foreground"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3 block">
          Navegación
        </span>
        <div className="space-y-0.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:text-sidebar-foreground hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-[18px] w-[18px]" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className={cn(
                  "h-4 w-4 opacity-0 transition-opacity",
                  isActive ? "opacity-100" : "group-hover:opacity-50"
                )} />
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Download Section */}

    </aside>
  )
}
