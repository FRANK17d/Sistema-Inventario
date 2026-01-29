"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

// Mapeo de rutas a permisos (sincronizado con sidebar.tsx)
const routePermissions = [
    { href: "/", permission: "DASHBOARD_VER" },
    { href: "/productos", permission: "PRODUCTO_VER" },
    { href: "/categorias", permission: "CATEGORIA_VER" },
    { href: "/proveedores", permission: "PROVEEDOR_VER" },
    { href: "/movimientos", permission: "MOVIMIENTO_VER" },
    { href: "/usuarios", permission: "USUARIO_VER" },
    { href: "/roles", permission: "ROL_VER" },
]

interface PermissionGuardProps {
    children: React.ReactNode
    requiredPermission: string
}

export function PermissionGuard({ children, requiredPermission }: PermissionGuardProps) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/login")
            } else if (!user.permisos?.includes(requiredPermission)) {
                // El usuario no tiene permiso para esta página
                // Si estamos en la ruta principal ("/"), buscar la primera ruta con permiso
                if (pathname === "/") {
                    // Buscar la primera ruta a la que el usuario tenga acceso
                    const firstAvailableRoute = routePermissions.find(
                        route => route.href !== "/" && user.permisos?.includes(route.permission)
                    )

                    if (firstAvailableRoute) {
                        router.replace(firstAvailableRoute.href)
                        return
                    }
                }

                // Si no hay rutas disponibles o no estamos en "/", mostrar unauthorized
                router.push("/unauthorized")
            }
        }
    }, [user, loading, requiredPermission, router, pathname])

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user) return null

    // If has permission, render.
    if (user.permisos?.includes(requiredPermission)) {
        return <>{children}</>
    }

    // Otherwise render nothing (while redirecting)
    return null
}
