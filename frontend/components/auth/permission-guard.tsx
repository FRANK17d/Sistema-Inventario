"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface PermissionGuardProps {
    children: React.ReactNode
    requiredPermission: string
}

export function PermissionGuard({ children, requiredPermission }: PermissionGuardProps) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/login")
            } else if (!user.permisos?.includes(requiredPermission)) {
                // Admin usually has all permissions, but explicit check is better. 
                // However usually permissions are flattened. 
                // If user.rol is ADMIN, we might want to bypass, but currently ADMIN has all permissions seeded.
                // Depending on seed.ts specific implementation. 
                // Let's stick to permission check.

                router.push("/unauthorized")
            }
        }
    }, [user, loading, requiredPermission, router])

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
