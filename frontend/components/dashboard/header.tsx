"use client"

import { Menu, ChevronRight, Moon, Sun } from "lucide-react"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  onMenuToggle?: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  const getPageTitle = (path: string) => {
    if (path.startsWith("/productos")) return "Productos"
    if (path.startsWith("/categorias")) return "Categorías"
    if (path.startsWith("/proveedores")) return "Proveedores"
    if (path.startsWith("/movimientos")) return "Movimientos"
    return "Dashboard"
  }

  const pageTitle = getPageTitle(pathname)

  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border px-4 md:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-muted-foreground"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden sm:flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Inicio</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">{pageTitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Cambiar tema</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
