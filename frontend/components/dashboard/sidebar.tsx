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
  LogOut,
  User,
  Shield
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/", permission: "DASHBOARD_VER" },
  { icon: Package, label: "Productos", href: "/productos", permission: "PRODUCTO_VER" },
  { icon: Tags, label: "Categorías", href: "/categorias", permission: "CATEGORIA_VER" },
  { icon: Truck, label: "Proveedores", href: "/proveedores", permission: "PROVEEDOR_VER" },
  { icon: ArrowLeftRight, label: "Movimientos", href: "/movimientos", permission: "MOVIMIENTO_VER" },
  { icon: User, label: "Usuarios", href: "/usuarios", permission: "USUARIO_VER" },
  { icon: Shield, label: "Roles", href: "/roles", permission: "ROL_VER" },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const { logout, user } = useAuth()

  // Filter items based on user permissions
  const filteredItems = menuItems.filter(item => {
    if (!user) return false
    if (!item.permission) return true
    return user.permisos?.includes(item.permission)
  })

  return (
    <aside className="flex flex-col h-full w-64 bg-background border-r border-border/50 shadow-xl shadow-black/5 dark:shadow-none transition-all duration-300">
      {/* Header / Logo */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-border/40">
        <div className="flex items-center gap-3 select-none">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-linear-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 text-primary-foreground">
            <img src="/abasto-logo.svg" alt="Abasto Logo" className="w-5 h-5 object-contain brightness-0 invert" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight tracking-tight">ABASTO</span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Inventario</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-8 w-8 text-muted-foreground hover:bg-muted/50 rounded-full"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">

        {/* Main Menu */}
        <div>
          <span className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider px-3 mb-3 block select-none">
            Principal
          </span>
          <div className="space-y-1">
            {filteredItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border border-transparent",
                    isActive
                      ? "bg-primary/10 text-primary border-primary/10 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("h-[18px] w-[18px] transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-sm shadow-primary/50" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* User Profile Section - Footer */}
      <div className="p-4 border-t border-border/40 bg-muted/20">
        {user && (
          <div className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-3 shadow-sm hover:shadow-md hover:border-border transition-all duration-300">
            {/* Background Glow Effect */}
            <div className="absolute inset-0 bg-linear-to-r from-primary/0 via-primary/5 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            <div className="relative flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt={user.nombre} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {user.nombre.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                  {user.nombre}
                </span>
                <span className="text-xs text-muted-foreground truncate capitalize flex items-center gap-1">
                  <div className={cn("h-1.5 w-1.5 rounded-full", user.rol === "ADMIN" ? "bg-amber-500" : "bg-emerald-500")} />
                  {user.rol.toLowerCase()}
                </span>
              </div>
            </div>

            <Button
              variant="default"
              size="sm"
              className="w-full justify-center bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-none font-medium h-9"
              onClick={logout}
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Cerrar Sesión
            </Button>
          </div>
        )}
      </div>
    </aside>
  )
}
